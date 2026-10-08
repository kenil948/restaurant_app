import { connectDB } from "@/app/utility/db";
import { sessionModel } from "@/app/utility/Model/session.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

connectDB()

type Jwt = {
    id: string;
    role: string;
    type: string;
    session: string;
}

export const POST = async () => {
    const cookieStore = await cookies();

    try {
        const refreshToken = cookieStore.get("refreshToken")?.value || "";

        if (!refreshToken) return NextResponse.json({ message: "Refresh token not found", status: false }, { status: 401, statusText: "Refresh token not found" });
        
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        if (decoded.type !== "refresh") {
            return NextResponse.json(
                {
                    message: "Invalid token type",
                    status: false,
                },
                {
                    status: 401,
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

        const isMatch = await bcrypt.compare(
            refreshToken,
            session.refreshTokenHash
        );
        if (!isMatch) {
            return NextResponse.json(
                {
                    message: "Invalid refresh token",
                    status: false
                },
                {
                    status: 401
                }
            );
        }
        const accessToken = jwt.sign({
            id: decoded.id,
            role: decoded.role,
            type: "access",
            session: decoded.session
        }, process.env.JWT_SECRET_KEY as string, {
            expiresIn: "15m"
        })
        const newRefreshToken = jwt.sign({
            id: decoded.id,
            role: decoded.role,
            type: "refresh",
            session: decoded.session
        }, process.env.JWT_SECRET_KEY as string, {
            expiresIn: "7d"
        })
        const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

        session.refreshTokenHash = newRefreshTokenHash;
        await session.save();

        cookieStore.set("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 15 * 60 });
        cookieStore.set("refreshToken", newRefreshToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 60 * 60 * 24 * 7 });
        return NextResponse.json({ message: "Refresh token updated", status: true }, { status: 200, statusText: "Refresh token updated" });

    } catch (error) {

        return NextResponse.json(
            {
                message: error instanceof Error ? error.message : "Something went wrong",
                status: false
            },
            {
                status: 500
            }
        );
    }
}