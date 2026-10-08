import { connectDB } from "@/app/utility/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sessionModel } from "@/app/utility/Model/session.model";

connectDB()

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

        if (!accessToken) return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        if (decoded.role !== "restaurant") return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });

        if (decoded.type !== "access") return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });

        const session = await sessionModel.findById(decoded.session);

        if (!session || session.revoked) return NextResponse.json({ message: "Session Invalid", status: false }, { status: 401 });

        session.revoked = true;
        await session.save();

        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");

        return NextResponse.json({ message: "Logout successfully", status: true }, { status: 200, statusText: "Logout successfully" });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}