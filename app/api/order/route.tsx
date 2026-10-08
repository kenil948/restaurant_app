import { connectDB } from "@/app/utility/db";
import { OrderModel } from "@/app/utility/Model/OrdersModel";
import { RestaurantModel } from "@/app/utility/Model/RestaurantsModel";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken"

connectDB();

type Jwt = {
    id: string,
    role: string,
    type: string,
    session: string
}

export const POST = async (request: Request) => {
    try {

        const cookieStore = await cookies();

        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json(
                {
                    status: false,
                    message: "Unauthorized"
                },
                {
                    status: 401
                }
            );
        }

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        const payload = await request.json();

        const existingOrder = await OrderModel.findOne({
            userId: decoded.id,
            status: "Pending",
            restoId: payload.restoId,
            createdAt: {
                $gte: new Date(Date.now() - 10000),
            },
        });

        if (existingOrder) {
            return NextResponse.json(
                {
                    status: false,
                    message: "Order already placed. Please wait.",
                },
                {
                    status: 409,
                }
            );
        }

        const createdOrder = await OrderModel.create({
            ...payload,
            userId: decoded.id,
        });

        return NextResponse.json({ message: "Created successfully", status: true, data: createdOrder }, { status: 200, statusText: "Created successfully" });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}



export const GET = async (request: Request) => {
    try {
        const cookieStore = await cookies();

        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json(
                {
                    status: false,
                    message: "Unauthorized"
                },
                {
                    status: 401
                }
            )
        }

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        const orders = await OrderModel.find({
            userId: decoded.id,
        }).sort({ createdAt: -1 });

        const result = await Promise.all(
            orders.map(async (order) => {
                const restaurant = await RestaurantModel.findById(
                    order.restoId
                );

                return {
                    orderId: order._id,
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
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                status: false,
                message: "Something went wrong",
            },
            { status: 500 }
        );
    }
};