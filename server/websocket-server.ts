import { loadEnvConfig } from "@next/env";
import { createServer } from "node:http";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { WebSocket, WebSocketServer } from "ws";

import { connectDB } from "../app/utility/db";
import { OrderModel } from "../app/utility/Model/OrdersModel";
import { sessionModel } from "../app/utility/Model/session.model";

loadEnvConfig(process.cwd());

type JwtPayload = {
  id: string;
  role: string;
  type: string;
  session: string;
};

type OrderStatusEvent = {
  id: string;
  event: "order.status_updated";
  createdAt: string;
  data: {
    orderId: string;
    previousStatus: string;
    newStatus: string;
  };
};

type ClientState = {
  userId: string;
  orderId?: string;
};

// Create the server and connection storage
const PORT = Number(process.env.WS_PORT || 4001);
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const INTERNAL_SECRET = process.env.WS_INTERNAL_SECRET;

const httpServer = createServer();
const wss = new WebSocketServer({ noServer: true });

const clientStates = new Map<WebSocket, ClientState>();

if (!JWT_SECRET || !INTERNAL_SECRET) {
  throw new Error("JWT_SECRET_KEY and WS_INTERNAL_SECRET must be configured");
}

// Create a helper for sending messages
const sendJson = (socket: WebSocket, payload: unknown) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
};

// Read the customer's access token from cookies
const getCookie = (
  cookieHeader: string | undefined,
  name: string,
): string | undefined => {
  if (!cookieHeader) return undefined;

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!cookie) return undefined;

  return decodeURIComponent(cookie.substring(name.length + 1));
};

// Authenticate the customer
const authenticateCustomer = async (
  cookieHeader: string | undefined,
): Promise<{ userId: string }> => {
  const accessToken = getCookie(cookieHeader, "accessToken");

  if (!accessToken) {
    throw new Error("Missing access token");
  }

  const decoded = jwt.verify(accessToken, JWT_SECRET!) as JwtPayload;

  if (decoded.type !== "access" || decoded.role !== "user") {
    throw new Error("Invalid customer token");
  }

  await connectDB();

  const session = await sessionModel.findById(decoded.session);

  if (!session || session.revoked) {
    throw new Error("Session is invalid or revoked");
  }

  return { userId: decoded.id };
};

// Browser connections arrive at /ws.
// Handle the WebSocket handshake
httpServer.on("upgrade", (request, socket, head) => {
  let pathname: string;

  try {
    pathname = new URL(request.url || "/", `http://${request.headers.host}`)
      .pathname;
  } catch {
    socket.destroy();
    return;
  }

  if (pathname !== "/ws") {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

// Handle a connected customer
wss.on("connection", (ws, request) => {
  const authPromise = authenticateCustomer(request.headers.cookie);

  ws.on("message", async (rawMessage) => {
    try {
      const customer = await authPromise;
      const message = JSON.parse(rawMessage.toString());

      if (message.type !== "subscribe") {
        sendJson(ws, {
          type: "error",
          message: "Unsupported message type",
        });
        return;
      }

      const orderId = message.orderId;

      if (
        typeof orderId !== "string" ||
        !mongoose.Types.ObjectId.isValid(orderId)
      ) {
        sendJson(ws, {
          type: "error",
          message: "Invalid order ID",
        });
        return;
      }

      // Customers may subscribe only to their own orders.
      const order = await OrderModel.findOne({
        _id: orderId,
        userId: customer.userId,
      }).select("_id");

      if (!order) {
        sendJson(ws, {
          type: "error",
          message: "Order not found",
        });
        return;
      }

      clientStates.set(ws, {
        userId: customer.userId,
        orderId: order._id.toString(),
      });

      sendJson(ws, {
        type: "subscribed",
        orderId: order._id.toString(),
      });
    } catch (error) {
      console.error(
        "WebSocket authentication/subscription failed:",
        error instanceof Error ? error.message : error,
      );

      sendJson(ws, {
        type: "error",
        message: "Authentication or subscription failed",
      });

      ws.close(1008, "Unauthorized");
    }
  });

  ws.on("close", () => {
    clientStates.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket client error:", error);
    clientStates.delete(ws);
  });
});

// Create the private HTTP publishing endpoint
httpServer.on("request", async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(200, {
      "Content-Type": "application/json",
    });

    response.end(JSON.stringify({ status: true, service: "websocket" }));
    return;
  }

  if (request.method !== "POST" || request.url !== "/publish") {
    response.writeHead(404, {
      "Content-Type": "application/json",
    });
    response.end(JSON.stringify({ message: "Not found" }));
    return;
  }

  const suppliedSecret = request.headers["x-ws-secret"];

  if (
    typeof suppliedSecret !== "string" ||
    suppliedSecret.length !== INTERNAL_SECRET!.length ||
    !crypto.timingSafeEqual(
      Buffer.from(suppliedSecret),
      Buffer.from(INTERNAL_SECRET!),
    )
  ) {
    response.writeHead(401, {
      "Content-Type": "application/json",
    });
    response.end(JSON.stringify({ message: "Unauthorized" }));
    return;
  }

  try {
    let body = "";
    let tooLarge = false;

    for await (const chunk of request) {
      body += chunk.toString();

      if (body.length > 100_000) {
        tooLarge = true;
        break;
      }
    }

    if (tooLarge) {
      response.writeHead(413, {
        "Content-Type": "application/json",
      });
      response.end(JSON.stringify({ message: "Payload too large" }));
      return;
    }

    const event = JSON.parse(body) as OrderStatusEvent;

    if (
      !event ||
      typeof event.id !== "string" ||
      event.event !== "order.status_updated" ||
      typeof event.data?.orderId !== "string" ||
      typeof event.data?.previousStatus !== "string" ||
      typeof event.data?.newStatus !== "string" ||
      !mongoose.Types.ObjectId.isValid(event.data.orderId)
    ) {
      response.writeHead(400, {
        "Content-Type": "application/json",
      });
      response.end(JSON.stringify({ message: "Invalid event" }));
      return;
    }

    // Find the customers tracking the changed order
    let delivered = 0;

    for (const [client, state] of clientStates.entries()) {
      if (
        client.readyState === WebSocket.OPEN &&
        state.orderId === event.data.orderId
      ) {
        sendJson(client, {
          type: event.event,
          id: event.id,
          createdAt: event.createdAt,
          data: event.data,
        });

        delivered++;
      }
    }

    response.writeHead(200, {
      "Content-Type": "application/json",
    });

    response.end(
      JSON.stringify({
        success: true,
        eventId: event.id,
        delivered,
      }),
    );
  } catch (error) {
    console.error("Failed to publish event:", error);

    response.writeHead(400, {
      "Content-Type": "application/json",
    });

    response.end(JSON.stringify({ message: "Invalid request" }));
  }
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});
