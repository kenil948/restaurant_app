import { connectDB } from "@/app/utility/db";
import { OrderModel } from "@/app/utility/Model/OrdersModel";
import { NextResponse } from "next/server";

connectDB();

export const POST = async (request: Request) => {
    try {
        const payload = await request.json();

        const { paymentStatus, paymentId, orderData } = payload;

        if (!orderData) {
            return NextResponse.json(
                {
                    status: false,
                    message: "Order data is required",
                },
                {
                    status: 400,
                }
            );
        }

        const order = await OrderModel.create({
            ...orderData,
            transactionId: paymentId,
            paymentStatus,
        });

        return NextResponse.json(
            {
                status: true,
                message: "Payment received",
                data: order,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                status: false,
                message: "Something went wrong",
            },
            {
                status: 500,
            }
        );
    }
};