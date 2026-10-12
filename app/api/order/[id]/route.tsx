import { connectDB } from "@/app/utility/db";
import { OrderModel } from "@/app/utility/Model/OrdersModel";
import { NextResponse } from "next/server";

connectDB();

type Props = {
    params: Promise<{
        id: string
    }>
}

export const GET = async (request: Request, { params }: Props) => {
    try {
        const { id } = await params;

        const order = await OrderModel.findById(id).lean();

        if (!order) return NextResponse.json({ message: "Order not found", status: false }, { status: 404, statusText: "Order not found" });

        return NextResponse.json({ message: "Order found", status: true, data: order }, { status: 200, statusText: "Order found" });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}