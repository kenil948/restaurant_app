import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/app/utility/db";
import { WebhookEventModel } from "@/app/utility/Model/WebhookEventModel"; 

export const runtime = "nodejs";
const MAX_AGE_SECONDS = 300;

export const POST = async (request: Request) => {
    try {
        const secret = process.env.WEBHOOK_SECRET;

        if (!secret) {
            console.log("WEBHOOK_SECRET is not configured");

            return NextResponse.json({ message: "Server configuration error", status: false }, { status: 500 });
        }

        // Read the exact body that was signed by the sender.
        const rawBody = await request.text();

        const timestamp = request.headers.get("X-webhook-timestamp");
        const receivedSignature = request.headers.get("X-Webhook-Signature");
        const eventId = request.headers.get("X-webhook-id");

        if (!timestamp || !receivedSignature || !eventId) {
            return NextResponse.json({ message: "Missing webhook headers", status: false }, { status: 400 });
        }

        // Validate timestamp format and freshness.
        if (!/^\d+$/.test(timestamp)) {
            return NextResponse.json(
                { message: "Invalid timestamp" },
                { status: 400 }
            );
        }

        const timestampNumber = Number(timestamp);
        // The Math.abs() function checks both old timestamps and timestamps too far in the future.
        if (!Number.isSafeInteger(timestampNumber) || Math.abs(Math.floor(Date.now() / 1000) - timestampNumber) > MAX_AGE_SECONDS) {
            return NextResponse.json(
                { message: "Invalid timestamp" },
                { status: 400 }
            )
        }

        // Calculate the expected signature using the same algorithm.
        const signedPayload = `${timestamp}.${rawBody}`

        const expectedSignature = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

        // Require the version prefix and a valid hexadecimal signature.
        const match = /^v1=([a-f0-9]{64})$/.exec(receivedSignature);

        if (!match) {
            return NextResponse.json(
                { message: "Invalid signature format" },
                { status: 401 }
            );
        }

        const receivedSignatureBuffer = Buffer.from(match[1], "hex");
        const expectedSignatureBuffer = Buffer.from(
            expectedSignature,
            "hex"
        );

        // Timing-safe comparison helps prevent timing attacks.
        // crypto.timingSafeEqual() compares the signature bytes using a timing-safe comparison.
        if (
            !crypto.timingSafeEqual(
                receivedSignatureBuffer,
                expectedSignatureBuffer
            )
        ) {
            return NextResponse.json(
                { message: "Invalid webhook signature" },
                { status: 401 }
            );
        }

        // Parse JSON only after signature verification.
        let event: unknown;

        try {
            event = JSON.parse(rawBody);
        } catch {
            return NextResponse.json(
                { message: "Invalid JSON body" },
                { status: 400 }
            );
        }

        // The header ID must match the event ID in the signed body.
        if (
            !event ||
            typeof event !== "object" ||
            !("id" in event) ||
            event.id !== eventId
        ) {
            return NextResponse.json(
                { message: "Event ID mismatch" },
                { status: 400 }
            );
        }

        await connectDB();

        if (
            !("event" in event) ||
            typeof event.event !== "string"
        ) {
            return NextResponse.json(
                { message: "Invalid event type" },
                { status: 400 }
            );
        }
        
        if (
            process.env.NODE_ENV !== "production" &&
            process.env.WEBHOOK_TEST_FORCE_500 === "true"
        ) {
            console.log("Testing retry logic: returning HTTP 500");

            return NextResponse.json(
                { message: "Simulated temporary failure" },
                { status: 500 }
            );
        }

        try {
            const savedEvent = await WebhookEventModel.create({
                eventId,
                eventType: event.event,
                payload: event,
                status: "Processed",
                processedAt: new Date(),
            });

            return NextResponse.json({
                success: true,
                message: "Webhook event processed",
                eventId: savedEvent.eventId,
            });
        } catch (error: unknown) {
            if (
                error &&
                typeof error === "object" &&
                "code" in error &&
                error.code === 11000
            ) {
                // The event was already recorded.
                return NextResponse.json({
                    success: true,
                    message: "Duplicate event ignored",
                    eventId,
                });
            }

            console.error("Failed to store webhook event:", error);

            return NextResponse.json(
                { message: "Failed to process webhook event" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Webhook receiver error:", error);

        return NextResponse.json(
            { message: "Webhook processing failed" },
            { status: 500 }
        );
    }
}