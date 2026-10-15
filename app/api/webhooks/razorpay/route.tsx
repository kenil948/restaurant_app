
import { connectDB } from "@/app/utility/db";
import { OrderModel } from "@/app/utility/Model/OrdersModel";
import { RazorpayWebhookEventModel } from "@/app/utility/Model/RazorpayWebhookEventModel";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

export const POST = async (request: Request) => {
    let eventId: string | null = null;

    try {
        await connectDB();

        // 1. Read the raw body and verify Razorpay's signature
        const rawBody = await request.text();
        const signature = request.headers.get(
            "x-razorpay-signature"
        );
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!signature || !secret) {
            return NextResponse.json(
                { status: false, message: "Missing signature or secret." },
                { status: 400 }
            );
        }

        if (!/^[a-f0-9]{64}$/i.test(signature)) {
            return NextResponse.json(
                { status: false, message: "Invalid signature format." },
                { status: 400 }
            );
        }

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");

        const received = Buffer.from(signature, "hex");
        const expected = Buffer.from(expectedSignature, "hex");

        if (
            received.length !== expected.length ||
            !crypto.timingSafeEqual(received, expected)
        ) {
            return NextResponse.json(
                { status: false, message: "Invalid signature." },
                { status: 401 }
            );
        }

        // 2. Parse the verified body
        let event: any;

        try {
            event = JSON.parse(rawBody);
        } catch {
            return NextResponse.json(
                { status: false, message: "Invalid JSON body." },
                { status: 400 }
            );
        }

        // 3. Handle only payment events we support
        if (
            event.event !== "payment.captured" &&
            event.event !== "payment.failed"
        ) {
            return NextResponse.json({
                status: true,
                message: "Event ignored.",
            });
        }

        eventId = request.headers.get("x-razorpay-event-id");

        const payment = event.payload?.payment?.entity;

        if (
            !eventId ||
            !payment?.id ||
            !payment?.order_id ||
            typeof payment.amount !== "number" ||
            payment.currency !== "INR"
        ) {
            return NextResponse.json(
                { status: false, message: "Invalid payment event data." },
                { status: 400 }
            );
        }

        // 4. Check whether this event has already been processed
        const existingEvent =
            await RazorpayWebhookEventModel.findOne({ eventId });

        if (existingEvent?.status === "Processed") {
            return NextResponse.json({
                status: true,
                message: "Duplicate event ignored.",
            });
        }

        // 5. Save the event or reuse an unfinished event
        let webhookEvent = existingEvent;

        if (!webhookEvent) {
            try {
                webhookEvent =
                    await RazorpayWebhookEventModel.create({
                        eventId,
                        eventType: event.event,
                        paymentId: payment.id,
                        razorpayOrderId: payment.order_id,
                        payload: event,
                        status: "Received",
                        attempts: 0,
                    });
            } catch (error: any) {
                // Another request may have created the same event
                if (error?.code === 11000) {
                    return NextResponse.json(
                        {
                            status: false,
                            message: "Event is being processed. Retry later.",
                        },
                        { status: 500 }
                    );
                }

                throw error;
            }
        }

        // 6. Mark the event as processing
        webhookEvent.status = "Processing";
        webhookEvent.attempts += 1;
        webhookEvent.lastError = null;
        await webhookEvent.save();

        try {
            // 7. Find the matching local order
            const order = await OrderModel.findOne({
                razorpayOrderId: payment.order_id,
                paymentMethod: "Razorpay",
            });

            if (!order) {
                throw new Error("Matching order not found.");
            }

            // 8. Verify the payment amount
            if (
                payment.amount !== Math.round(order.amount * 100)
            ) {
                throw new Error("Payment amount mismatch.");
            }

            // 9. Update the payment status
            if (event.event === "payment.captured") {
                // Never downgrade an already-paid order
                await OrderModel.updateOne(
                    {
                        _id: order._id,
                        paymentStatus: { $ne: "Paid" },
                    },
                    {
                        $set: {
                            paymentStatus: "Paid",
                            razorpayPaymentId: payment.id,
                            transactionId: payment.id,
                        },
                    }
                );
            } else {
                await OrderModel.updateOne(
                    {
                        _id: order._id,
                        paymentStatus: { $ne: "Paid" },
                    },
                    {
                        $set: {
                            paymentStatus: "Failed",
                            razorpayPaymentId: payment.id,
                            transactionId: payment.id,
                        },
                    }
                );
            }

            // 10. Mark the event as successfully processed
            webhookEvent.status = "Processed";
            webhookEvent.processedAt = new Date();
            webhookEvent.lastError = null;
            await webhookEvent.save();

            return NextResponse.json({
                status: true,
                message: "Webhook processed successfully.",
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown processing error.";

            webhookEvent.status = "Failed";
            webhookEvent.lastError = message;
            await webhookEvent.save();

            console.error("Razorpay event processing failed:", {
                eventId,
                message,
            });

            return NextResponse.json(
                {
                    status: false,
                    message: "Webhook processing failed.",
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Razorpay webhook error:", error);

        return NextResponse.json(
            {
                status: false,
                message: "Webhook processing failed.",
            },
            { status: 500 }
        );
    }
};
