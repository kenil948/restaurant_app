import { OrderModel } from "@/app/utility/Model/OrdersModel";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/app/utility/db";
import { sessionModel } from "@/app/utility/Model/session.model";
import { randomUUID } from "node:crypto";
import { sendOrderStatusWebhook } from "@/app/utility/sendwebhook";
import { publishOrderStatus } from "@/app/utility/publishOrderStatus";

connectDB();

type Jwt = {
    id: string;
    role: string;
    type: string;
    session: string;
};

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export const PATCH = async (request: Request, { params }: Props) => {
    try {
        const { id } = await params;
        const cookieStore = await cookies();

        const accessToken =
            cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                    status: false,
                },
                {
                    status: 401,
                }
            );
        }

        const decoded = jwt.verify(
            accessToken,
            process.env.JWT_SECRET_KEY as string
        ) as Jwt;

        if (decoded.type !== "access") {
            return NextResponse.json(
                {
                    message: "Invalid token type",
                    status: false,
                },
                { status: 401 }
            );
        }

        if (decoded.role !== "deliverypartner") {
            return NextResponse.json(
                {
                    message: "Forbidden",
                    status: false,
                },
                { status: 403 }
            );
        }

        const session = await sessionModel.findById(
            decoded.session
        );

        if (!session || session.revoked) {
            return NextResponse.json(
                {
                    message: "Session not found",
                    status: false,
                },
                {
                    status: 401,
                }
            );
        }

        const { status } = await request.json();

        if (
            status !== "Picked Up" &&
            status !== "Delivered"
        ) {
            return NextResponse.json(
                {
                    message: "Invalid order status",
                    status: false,
                },
                { status: 400 }
            );
        }

        if (!status) {
            return NextResponse.json(
                {
                    message: "Status is required",
                    status: false,
                },
                { status: 400 }
            );
        }

        const order = await OrderModel.findOne({
            _id: id,
            deliveryBoyId: decoded.id,
        });

        if (!order) {
            return NextResponse.json(
                {
                    message: "Order not found",
                    status: false,
                },
                {
                    status: 404,
                }
            );
        }


        if (
            order.paymentMethod === "Razorpay" &&
            order.paymentStatus !== "Paid"
        ) {
            return NextResponse.json(
                {
                    message:
                        order.paymentStatus === "Failed"
                            ? "Payment has failed. This order cannot proceed to delivery."
                            : "Payment has not been confirmed. This order cannot proceed to delivery.",
                    status: false,
                },
                { status: 409 }
            );
        }


        if (
            order.status === "Pending" &&
            status !== "Picked Up"
        ) {
            return NextResponse.json(
                {
                    message: "Pending order can only be picked up",
                    status: false,
                },
                { status: 400 }
            );
        }

        if (
            order.status === "Picked Up" &&
            status !== "Delivered"
        ) {
            return NextResponse.json(
                {
                    message: "Picked up order can only be delivered",
                    status: false,
                },
                { status: 400 }
            );
        }

        if (
            order.status === "Delivered" ||
            order.status === "Cancelled"
        ) {
            return NextResponse.json(
                {
                    message: "Order already completed",
                    status: false,
                },
                { status: 400 }
            );
        }

        const previousStatus = order.status;

        order.status = status;
        if (
            status === "Delivered" &&
            order.paymentMethod === "COD"
        ) {
            order.paymentStatus = "Paid";
        }
        await order.save();

        // Create a unique event for this status change.
        const event = {
            id: randomUUID(),
            event: "order.status_updated" as const,
            createdAt: new Date().toISOString(),
            data: {
                orderId: order._id.toString(),
                previousStatus,
                newStatus: order.status,
            },
        };

        let webhookResult;

        try {
            webhookResult = await sendOrderStatusWebhook(event);
        } catch (error) {
            console.error("Webhook delivery failed:", error);

            webhookResult = {
                success: false,
                message: "Order updated, but webhook delivery failed",
            };
        }

        let websocketResult;

        try {
            websocketResult = await publishOrderStatus(event);
        } catch (error) {
            console.error(
                "WebSocket event publishing failed:",
                error
            );

            websocketResult = {
                success: false,
                message: "Order updated, but WebSocket publishing failed",
            };
        }

        return NextResponse.json(
            {
                message: "Updated successfully",
                status: true,
                data: order,
                webhook: webhookResult,
                websocket: websocketResult,
            },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                message: "Something went wrong",
                status: false,
            },
            {
                status: 500,
            }
        );
    }
};