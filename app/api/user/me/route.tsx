import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserModel } from "@/app/utility/Model/UserModel";
import { cookies } from "next/headers";
import { connectDB } from "@/app/utility/db";
import { sessionModel } from "@/app/utility/Model/session.model";

connectDB();
type Jwt = {
    id: string,
    role: string,
    type: string,
    session: string
}
export const GET = async () => {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value || "";

        if (!accessToken) {
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
            return NextResponse.json(
                {
                    message: "Session not found",
                    status: false
                },
                {
                    status: 401
                }
            );
        }

        const user = await UserModel.findById(decoded.id).select("-password");

        if (!user) return NextResponse.json({ message: "User not found", status: false }, { status: 404, statusText: "Unauthorized" });

        return NextResponse.json({ message: "Fetched successfully", status: true, data: user }, { status: 200, statusText: "Fetched successfully" });

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