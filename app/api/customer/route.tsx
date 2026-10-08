import { RestaurantModel } from "@/app/utility/Model/RestaurantsModel";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {

    try {
        const { searchParams } = new URL(request.url);

        let filter = {};

        if (searchParams.get("location")) {
            const city = searchParams.get("location") || "";
            filter = { city: { $regex: new RegExp(city, "i") } }
        }
        else if (searchParams.get("restaurant")) {
            const restaurantName = searchParams.get("restaurant") || "";
            filter = { restaurantName: { $regex: new RegExp(restaurantName, "i") } }
        }

        const restaurantData = await RestaurantModel.find(filter).select("-password");

        return NextResponse.json({ message: "Fetched successfully", status: true, data: restaurantData }, { status: 200, statusText: "Fetched successfully" });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}