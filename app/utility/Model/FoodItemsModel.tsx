import mongoose, { Schema } from "mongoose";

const FoodItemsSchema = new Schema({
    foodName: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'restaurants',
        required: true,
    },  
});

export const FoodItemsModel = mongoose.models.foodItems || mongoose.model('foodItems', FoodItemsSchema)