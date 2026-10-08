import { connectDB } from "@/app/utility/db";
import { RestaurantModel } from "@/app/utility/Model/RestaurantsModel"
import { NextResponse } from "next/server";

connectDB()

export const GET = async (request: Request) => {
    const restaurantData = await RestaurantModel.find();

    const results = restaurantData.map((item) => item.city.charAt(0).toUpperCase() + item.city.slice(1));

    const uniqueResults = [...new Set(results)];

    return NextResponse.json({ message: "Fetched successfully", status: true, data: uniqueResults }, { status: 200, statusText: "Fetched successfully" });
}