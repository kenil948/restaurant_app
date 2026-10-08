import { connectDB } from "@/app/utility/db";
import { FoodItemsModel } from "@/app/utility/Model/FoodItemsModel";
import { RestaurantModel } from "@/app/utility/Model/RestaurantsModel";
import { NextResponse } from "next/server";

connectDB()

type Props = {
    params: Promise<{
        id: string
    }>
}

export const GET = async (request: Request, { params }: Props) =>{
    try {
        const {id} = await params;

        const restaurant = await RestaurantModel.findOne({ _id: id });
        const foodItems = await FoodItemsModel.find({ restaurantId: id });

        return NextResponse.json({ message: "Fetched successfully", status: true, data: { restaurant, foodItems } }, { status: 200, statusText: "Fetched successfully" });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}