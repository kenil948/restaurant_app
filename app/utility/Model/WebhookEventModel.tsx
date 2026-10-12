import mongoose, { Schema } from "mongoose";

const WebhookEventSchema = new Schema(
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
        payload: {
            type: Schema.Types.Mixed,
            required: true,
        },
        status: {
            type: String,
            enum: ["Received", "Processed"],
            default: "Received",
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

export const WebhookEventModel = mongoose.models.WebhookEvent || mongoose.model("WebhookEvent", WebhookEventSchema);