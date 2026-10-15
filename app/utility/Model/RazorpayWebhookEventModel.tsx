    
import mongoose, { Schema } from "mongoose";

const RazorpayWebhookEventSchema = new Schema(
    {
        eventId: {
            type: String,
            required: true,
            unique: true,
        },
        eventType: {
            type: String,
            required: true,
        },
        paymentId: {
            type: String,
            default: null,
        },
        razorpayOrderId: {
            type: String,
            default: null,
        },
        payload: {
            type: Schema.Types.Mixed,
            required: true,
        },
        status: {
            type: String,
            enum: [
                "Received",
                "Processing",
                "Processed",
                "Failed",
            ],
            default: "Received",
        },
        attempts: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastError: {
            type: String,
            default: null,
        },
        processedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const RazorpayWebhookEventModel =
    mongoose.models.RazorpayWebhookEvent ||
    mongoose.model(
        "RazorpayWebhookEvent",
        RazorpayWebhookEventSchema
    );
