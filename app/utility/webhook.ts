import crypto from "node:crypto";

export const createWebhookSignature = (timestamp: string, rawBody: string) => {
  const secret = process.env.WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("WEBHOOK_SECRET is not configured");
  }

  const signedPayload = `${timestamp}.${rawBody}`;

  return crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");
};
