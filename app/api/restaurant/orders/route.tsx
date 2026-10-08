import { OrderModel } from "@/app/utility/Model/OrdersModel";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sessionModel } from "@/app/utility/Model/session.model";
import { connectDB } from "@/app/utility/db";

connectDB();

type Jwt = {
    id: string,
    role: string,
    type: string,
    session: string
}


export const GET = async (request: Request) => {
    try {
        const cookieStore = await cookies();

        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        if (decoded.role !== "restaurant") return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });

        if (decoded.type !== "access") return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });

        const session = await sessionModel.findById(decoded.session);

        if (!session || session.revoked) return NextResponse.json({ message: "Session not found", status: false }, { status: 401 });

        const orders = await OrderModel.find({ restoId: decoded.id }).sort({ createdAt: -1 });

        return NextResponse.json({ message: "Fetched successfully", status: true, data: orders }, { status: 200, statusText: "Fetched successfully" });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}   