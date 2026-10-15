
import { connectDB } from "@/app/utility/db";
import { OrderModel } from "@/app/utility/Model/OrdersModel";
import { FoodItemsModel } from "@/app/utility/Model/FoodItemsModel";
import { RestaurantModel } from "@/app/utility/Model/RestaurantsModel";
import { DeliveryPartnerModel } from "@/app/utility/Model/DeliveryPartnerModel";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import mongoose from "mongoose";

type Jwt = {
    id: string;
    role: string;
    type: string;
    session: string;
};

export const POST = async (request: Request) => {
    try {
        await connectDB();

        // 1. Authenticate customer
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken || !process.env.JWT_SECRET_KEY) {
            return NextResponse.json(
                { status: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(
            accessToken,
            process.env.JWT_SECRET_KEY
        ) as Jwt;

        if (decoded.role !== "user" || decoded.type !== "access") {
            return NextResponse.json(
                { status: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Read checkout details
        const payload = await request.json();

        const {
            foodItemsIds,
            restoId,
            deliveryBoyId,
            city,
            address,
            landmark,
        } = payload;

        if (
            !Array.isArray(foodItemsIds) ||
            foodItemsIds.length === 0 ||
            foodItemsIds.length > 100 ||
            !foodItemsIds.every(
                (id: unknown) =>
                    typeof id === "string" &&
                    mongoose.Types.ObjectId.isValid(id)
            ) ||
            !mongoose.Types.ObjectId.isValid(restoId) ||
            !mongoose.Types.ObjectId.isValid(deliveryBoyId) ||
            typeof city !== "string" ||
            !city.trim() ||
            typeof address !== "string" ||
            !address.trim()
        ) {
            return NextResponse.json(
                { status: false, message: "Invalid order details." },
                { status: 400 }
            );
        }

        // 3. Validate the selected delivery partner
        // Keep the existing city-based assignment from checkout.
        const deliveryBoy = await DeliveryPartnerModel.findById(deliveryBoyId);

        if (
            !deliveryBoy ||
            deliveryBoy.city.trim().toLowerCase() !== city.trim().toLowerCase()
        ) {
            return NextResponse.json(
                {
                    status: false,
                    message: "Invalid delivery partner for this city.",
                },
                { status: 400 }
            );
        }

        // 4. Get actual food prices from MongoDB
        const uniqueFoodIds = [...new Set(foodItemsIds)];

        const foodItems = await FoodItemsModel.find({
            _id: { $in: uniqueFoodIds },
        });

        if (foodItems.length !== uniqueFoodIds.length) {
            return NextResponse.json(
                { status: false, message: "Some food items were not found." },
                { status: 400 }
            );
        }

        // 5. Validate restaurant and food items
        const restaurant = await RestaurantModel.findById(restoId);

        if (!restaurant) {
            return NextResponse.json(
                { status: false, message: "Restaurant not found." },
                { status: 404 }
            );
        }

        const validRestaurant = foodItems.every(
            (item) => item.restaurantId.toString() === restoId
        );

        if (!validRestaurant) {
            return NextResponse.json(
                {
                    status: false,
                    message: "Food items must belong to the selected restaurant.",
                },
                { status: 400 }
            );
        }

        // 6. Calculate the total using database prices
        const priceMap = new Map(
            foodItems.map((item) => [
                item._id.toString(),
                item.price,
            ])
        );

        if (
            foodItems.some(
                (item) =>
                    !Number.isFinite(item.price) || item.price < 0
            )
        ) {
            return NextResponse.json(
                { status: false, message: "Invalid food prices." },
                { status: 400 }
            );
        }

        const foodTotal = foodItemsIds.reduce(
            (total: number, id: string) =>
                total + (priceMap.get(id) ?? 0),
            0
        );

        if (foodTotal <= 0) {
            return NextResponse.json(
                { status: false, message: "Invalid order total." },
                { status: 400 }
            );
        }

        const deliveryFee = 40;
        const tax = Math.round(foodTotal * 0.05);
        const amount = foodTotal + deliveryFee + tax;

        // 7. Check Razorpay configuration
        if (
            !process.env.RAZORPAY_KEY_ID ||
            !process.env.RAZORPAY_KEY_SECRET
        ) {
            return NextResponse.json(
                { status: false, message: "Payment gateway is not configured." },
                { status: 500 }
            );
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // 8. Create an order with Razorpay (amount is in paise)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `order_${Date.now()}`,
        });

        // 9. Save the matching order in MongoDB
        const createdOrder = await OrderModel.create({
            userId: decoded.id,
            foodItemsIds,
            restoId,
            deliveryBoyId: deliveryBoy._id,
            amount,
            address: address.trim(),
            city: city.trim(),
            landmark: typeof landmark === "string" ? landmark.trim() : "",
            paymentMethod: "Razorpay",
            paymentStatus: "Pending",
            razorpayOrderId: razorpayOrder.id,
        });

        // 10. Return checkout details (never return the secret key)
        return NextResponse.json(
            {
                status: true,
                message: "Razorpay order created successfully.",
                data: {
                    orderId: createdOrder._id,
                    razorpayOrderId: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    keyId: process.env.RAZORPAY_KEY_ID,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Razorpay order error:", error);

        if (
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.TokenExpiredError
        ) {
            return NextResponse.json(
                { status: false, message: "Invalid or expired token." },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { status: false, message: "Failed to create payment order." },
            { status: 500 }
        );
    }
};
