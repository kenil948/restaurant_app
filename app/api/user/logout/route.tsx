import { connectDB } from "@/app/utility/db"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { UserModel } from "@/app/utility/Model/UserModel";
import { sessionModel } from "@/app/utility/Model/session.model";

connectDB();

type Jwt = {
    id: string;
    role: string;
    type: string;
    session: string;
}

export const POST = async () => {
    const cookieStore = await cookies();

    try {
        const accessToken = cookieStore.get("accessToken")?.value || "";

        if (!accessToken) return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        await sessionModel.findByIdAndUpdate(
            decoded.session,
            {
                revoked: true
            }
        );

        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");

        return NextResponse.json({ message: "Logout successfully", status: true }, { status: 200, statusText: "Logout successfully" });
    } catch (error) {
        console.log(error);

        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}