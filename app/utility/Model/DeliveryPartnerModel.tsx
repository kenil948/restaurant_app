import mongoose, { Schema } from "mongoose";

const DeliveryPartnerSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        contactNumber: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export const DeliveryPartnerModel = mongoose.models.deliveryBoys || mongoose.model('deliveryBoys', DeliveryPartnerSchema)