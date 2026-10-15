import { connectDB } from "@/app/utility/db";
import { OrderModel } from "@/app/utility/Model/OrdersModel";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { RestaurantModel } from "@/app/utility/Model/RestaurantsModel";

connectDB();

type Props = {
    params: Promise<{
        id: string
    }>
}

type Jwt = {
    id: string
    role: string
    type: string
    session: string
}

export const GET = async (request: Request, { params }: Props) => {
    try {

        const cookiStore = await cookies();

        const accessToken = cookiStore.get("accessToken")?.value;

        if (!accessToken) return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        if (decoded.role !== "user") return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });

        if (decoded.type !== "access") return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    status: false,
                    message: "Invalid order ID",
                },
                { status: 400 }
            );
        }

        const order = await OrderModel.findOne({
            _id: id,
            userId: decoded.id
        }).lean();

        if (!order) return NextResponse.json({ message: "Order not found", status: false }, { status: 404, statusText: "Order not found" });

        const restaurant = await RestaurantModel.findById(order.restoId).lean();

        return NextResponse.json({
            message: "Order found", status: true, data: {
                ...order,
                orderId: String(order._id),
                restaurant,
            }
        }, { status: 200, statusText: "Order found" });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}