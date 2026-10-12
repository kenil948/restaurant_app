import mongoose, { Schema } from "mongoose";

const WebhookDeliveryLogSchema = new Schema(
    {
        eventId: {
            type: String,
            required: true,
            index: true,
        },
        attempt: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["Success", "Failed"],
            required: true,
        },
        statusCode: {
            type: Number,
            default: null,
        },
        response: {
            type: String,
            default: null,
        },
        errorMessage: {
            type: String,
            default: null,
        },
        attemptedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export const WebhookDeliveryLogModel = mongoose.models.WebhookDeliveryLog || mongoose.model("WebhookDeliveryLog", WebhookDeliveryLogSchema);