import { connectDB } from "@/app/utility/db";
import { UserModel } from "@/app/utility/Model/UserModel";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken"

connectDB();

type Jwt = {
    id: string;
    role: string;
    type: string;
    session: string;
}

export const PUT = async (request: Request) => {
    try {

        const cookieStore = await cookies();

        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json(
                {
                    status: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        const payload = await request.json();

        const user = await UserModel.findByIdAndUpdate(
            decoded.id,
            {
                city: payload.city,
                address: payload.address,
                landmark: payload.landmark,
            },
            {
                new: true
            }
        ).select("-password");

        if (!user) {
            return NextResponse.json(
                {
                    status: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                status: true,
                data: user,
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
            { status: 500 }
        );
    }
};