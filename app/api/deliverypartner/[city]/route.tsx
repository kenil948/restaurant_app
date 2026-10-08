import { connectDB } from "@/app/utility/db";
import { DeliveryPartnerModel } from "@/app/utility/Model/DeliveryPartnerModel";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

connectDB();

type Props = {
    params: Promise<{ city: string }>
}

type Jwt = {
    id: string,
    role: string,
    type: string,
    session: string
}

export const GET = async (request: Request, { params }: Props) => {
    try {
        const cookieStore = await cookies();

        const accessToken = cookieStore.get("accessToken")?.value || "";

        if (!accessToken) {
            return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });
        }

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        if (decoded.role !== "user") {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                    status: false
                },
                {
                    status: 401
                }
            );
        }

        if (decoded.type !== "access") {
            return NextResponse.json(
                {
                    message: "Invalid token type",
                    status: false
                },
                {
                    status: 401
                }
            );
        }

        const { city } = await params;

        const filter = { city: { $regex: new RegExp(city, "i") } };
        const result = await DeliveryPartnerModel.find(filter).select("-password");
        if (result.length === 0) {
            return NextResponse.json(
                {
                    message: "No delivery partner found",
                    status: false,
                    data: []
                },
                { status: 404 }
            );
        }
        return NextResponse.json({ message: "Fetched successfully", status: true, data: result }, { status: 200, statusText: "Fetched successfully" });

    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                message: "Invalid or expired token",
                status: false
            },
            {
                status: 401
            }
        );
    }


}