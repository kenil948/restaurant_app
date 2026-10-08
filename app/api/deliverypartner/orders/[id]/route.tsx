import { OrderModel } from "@/app/utility/Model/OrdersModel";
import { RestaurantModel } from "@/app/utility/Model/RestaurantsModel";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/app/utility/db";

connectDB();

type Jwt = {
    id: string;
    role: string;
    type: string;
    session: string;
}

export const GET = async (request: Request) => {
    try {
        const cookieStore = await cookies();

        const accessToken = cookieStore.get("accessToken")?.value || "";

        if (!accessToken) {
            return NextResponse.json(
                {
                    status: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(
            accessToken,
            process.env.JWT_SECRET_KEY as string
        ) as Jwt;

        if (decoded.type !== "access") {
            return NextResponse.json(
                {
                    status: false,
                    message: "Invalid token type",
                },
                { status: 401 }
            );
        }

        if (decoded.role !== "deliverypartner") {
            return NextResponse.json(
                {
                    status: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const orders = await OrderModel.find({
            deliveryBoyId: decoded.id,
        }).sort({ createdAt: -1 });

        const result = await Promise.all(
            orders.map(async (order) => {
                const restaurant = await RestaurantModel.findById(
                    order.restoId
                ).select("-password");

                return {
                    orderId: order._id.toString(),
                    restaurant,
                    amount: order.amount,
                    status: order.status,
                    city: order.city,
                    address: order.address,
                    landmark: order.landmark,
                    createdAt: order.createdAt,
                };
            })
        );

        return NextResponse.json({
            status: true,
            data: result,
        },
            {
                status: 200,
            });

    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                status: false,
                message: "Invalid or expired token",
            },
            {
                status: 401,
            }
        );
    }
}