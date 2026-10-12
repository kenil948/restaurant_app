import mongoose from "mongoose";
import { Schema } from "mongoose";

const OrderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    foodItemsIds: [{
        type: Schema.Types.ObjectId,
        ref: "foodItems"
    }],
    restoId: {
        type: Schema.Types.ObjectId,
        ref: 'restaurants',
        required: true
    },
    deliveryBoyId: {
        type: Schema.Types.ObjectId,
        ref: 'deliverypartner',
        default: null
    },
    status: {
        type: String,
        enum: [
            "Pending",
            "Picked Up",
            "Delivered",
            "Cancelled"
        ],
        default: "Pending"
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "Razorpay"],
        default: "COD"
    },
    paymentStatus: {
        type: String,
        enum: [
            "Pending",
            "Paid",
            "Failed",
            "Refunded"
        ],
        default: "Pending"
    },
    transactionId: {
        type: String,
        default: null
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    landmark: {
        type: String,
        default: ""
    }
},
    {
        timestamps: true,
    }
)

export const OrderModel = mongoose.models.orders || mongoose.model('orders', OrderSchema)