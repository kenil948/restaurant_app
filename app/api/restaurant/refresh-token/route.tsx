import { connectDB } from "@/app/utility/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { sessionModel } from "@/app/utility/Model/session.model";
import bcrypt from "bcryptjs";

connectDB()

type Jwt = {
    id: string;
    role: string;
    type: string;
    session: string
}

export const POST = async (request: Request) => {
    try {
        const cookieStore = await cookies();

        const refreshToken = cookieStore.get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json({ message: "Refresh token not found", status: false }, { status: 401, statusText: "Refresh token not found" });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        if (decoded.role !== "restaurant") return NextResponse.json({ message: "Invalid token", status: false }, { status: 401, statusText: "Invalid token" });

        if (decoded.type !== "refresh") {
            return NextResponse.json({ message: "Invalid token type", status: false }, { status: 401, statusText: "Invalid token type" });
        }

        const session = await sessionModel.findById(decoded.session);

        if (!session || session.revoked) return NextResponse.json({ message: "Session not found", status: false }, { status: 401 });

        const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);

        if (!isMatch) return NextResponse.json({ message: "Invalid token", status: false }, { status: 401 });

        const accessToken = jwt.sign({
            id: decoded.id,
            role: "restaurant",
            type: "access",
            session: decoded.session
        }, process.env.JWT_SECRET_KEY as string, { expiresIn: "15m" });

        const newRefreshToken = jwt.sign({
            id: decoded.id,
            role: "restaurant",
            type: "refresh",
            session: decoded.session
        }, process.env.JWT_SECRET_KEY as string, { expiresIn: "7d" });

        const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

        session.refreshTokenHash = newRefreshTokenHash;
        await session.save();

        cookieStore.set("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 60 * 15 });
        cookieStore.set("refreshToken", newRefreshToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 60 * 60 * 24 * 7 });

        return NextResponse.json({ message: "Refresh token successfully", status: true }, { status: 200, statusText: "Refresh token successfully" });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}