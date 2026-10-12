import { createWebhookSignature } from "@/app/utility/webhook";
import { connectDB } from "./db";
import { WebhookDeliveryLogModel } from "./Model/WebhookDeliveryLogModel";

type OrderStatusUpdatedEvent = {
  id: string;
  event: "order.status_updated";
  createdAt: string;
  data: {
    orderId: string;
    previousStatus: string;
    newStatus: string;
  };
};

const MAX_ATTEMPTS = 4;
const TIMEOUT_MS = 5000;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableStatus = (status: number): boolean =>
  status === 408 || status === 429 || status >= 500;

const saveDeliveryLog = async ({
  eventId,
  attempt,
  status,
  statusCode = null,
  response = null,
  errorMessage = null,
}: {
  eventId: string;
  attempt: number;
  status: "Success" | "Failed";
  statusCode?: number | null;
  response?: string | null;
  errorMessage?: string | null;
}) => {
  await connectDB();

  await WebhookDeliveryLogModel.create({
    eventId,
    attempt,
    status,
    statusCode,
    response,
    errorMessage,
    attemptedAt: new Date(),
  });
};

export const sendOrderStatusWebhook = async (
  eventData: OrderStatusUpdatedEvent,
) => {
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("WEBHOOK_URL is not configured");
  }

  const rawBody = JSON.stringify(eventData);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = createWebhookSignature(timestamp, rawBody);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Id": eventData.id,
          "X-Webhook-Timestamp": timestamp,
          "X-Webhook-Signature": `v1=${signature}`,
        },
        body: rawBody,
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
      });

      const responseBody = await response.text();

      if (response.ok) {
        await saveDeliveryLog({
          eventId: eventData.id,
          attempt,
          status: "Success",
          statusCode: response.status,
          response: responseBody,
        });

        let receiverResponse: unknown = responseBody;

        try {
          receiverResponse = JSON.parse(responseBody);
        } catch {
          // Keep the response as text if it isn't JSON.
        }

        return {
          success: true,
          eventId: eventData.id,
          attempt,
          statusCode: response.status,
          receiverResponse,
        };
      }

      await saveDeliveryLog({
        eventId: eventData.id,
        attempt,
        status: "Failed",
        statusCode: response.status,
        response: responseBody,
      });

      // Don't retry permanent HTTP errors.
      if (!isRetryableStatus(response.status) || attempt === MAX_ATTEMPTS) {
        throw new Error(
          `Webhook delivery failed after ${attempt} attempt(s): ` +
            `HTTP ${response.status} - ${responseBody}`,
        );
      }

      console.warn(
        `Webhook attempt ${attempt} failed with HTTP ${response.status}`,
      );
    } catch (error) {
      // The HTTP failure was already logged above.
      if (
        error instanceof Error &&
        error.message.startsWith("Webhook delivery failed")
      ) {
        throw error;
      }

      // Record network errors, timeouts, and other request exceptions.
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await saveDeliveryLog({
        eventId: eventData.id,
        attempt,
        status: "Failed",
        errorMessage,
      });

      if (attempt === MAX_ATTEMPTS) {
        throw new Error(
          `Webhook delivery failed after ${attempt} attempts: ${errorMessage}`,
        );
      }

      console.warn(`Webhook attempt ${attempt} failed:`, errorMessage);
    }

    // Exponential backoff: 2s, 4s, 8s.
    await wait(2000 * 2 ** (attempt - 1));
  }

  throw new Error("Webhook delivery failed");
};
