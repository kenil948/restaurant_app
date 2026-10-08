import { connectDB } from "@/app/utility/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sessionModel } from "@/app/utility/Model/session.model";

connectDB();

type Jwt = {
    id: string;
    role: string;
    type: string;
    session: string;
}

export const POST = async (request: Request) => {
    try {
        const cookieStore = await cookies();

        const refreshToken = cookieStore.get("refreshToken")?.value || "";

        if (!refreshToken) {
            return NextResponse.json({ message: "Refresh token not found", status: false }, { status: 401, statusText: "Refresh token not found" });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        if (decoded.role !== "deliverypartner") {
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

        const session = await sessionModel.findById(decoded.session);

        if (!session || session.revoked) {
            return NextResponse.json({ message: "Session not found", status: false }, { status: 401, statusText: "Session not found" });
        }

        session.revoked = true;
        await session.save();

        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");

        return NextResponse.json({ message: "Logout successfully", status: true }, { status: 200, statusText: "Logout successfully" });

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                message: "Invalid or expired refresh token",
                status: false
            },
            {
                status: 401
            }
        );
    }
}