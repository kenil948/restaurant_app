
import { connectDB } from "@/app/utility/db";
import { sendOrderStatusWebhook } from "@/app/utility/sendwebhook";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

connectDB()
export const runtime = "nodejs";

export async function POST() {
    try {
        const event = {
            id: randomUUID(),
            event: "order.status_updated" as const,
            createdAt: new Date().toISOString(),
            data: {
                orderId: "test-order-123",
                previousStatus: "Pending",
                newStatus: "Picked Up",
            },
        };

        const result = await sendOrderStatusWebhook(event);

        return NextResponse.json({
            message: "Test webhook sent",
            result,
        });
    } catch (error) {
        console.error("Test webhook failed:", error);

        return NextResponse.json(
            { message: "Test webhook failed" },
            { status: 500 }
        );
    }
}
