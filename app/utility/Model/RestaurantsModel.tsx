import mongoose, { Schema } from "mongoose";

const RestaurantSchema = new Schema({
    restaurantName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    fullAddress: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
},
    {
        timestamps: true,
    }
)

export const RestaurantModel = mongoose.models.restaurants || mongoose.model('restaurants', RestaurantSchema)