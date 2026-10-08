import { connectDB } from "@/app/utility/db";
import { UserModel } from "@/app/utility/Model/UserModel";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sessionModel } from "@/app/utility/Model/session.model";

connectDB()

export const POST = async (request: Request) => {
    const cookieStore = await cookies();
    try {
        const payload = await request.json();

        const existingUser = await UserModel.findOne({
            email: payload.email
        })

        if (existingUser) {
            return NextResponse.json(
                {
                    status: false,
                    message: "Email already exists"
                },
                {
                    status: 409
                }
            );
        }

        const hashPassword = await bcrypt.hash(payload.password, 10);
        payload.password = hashPassword;

        const user = await UserModel.create(payload);
        
        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash: "temp",
            ip: request.headers.get("x-forwarded-for") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown"
        })
        const refreshToken = jwt.sign({
            id: user._id,
            role: "user",
            type: "refresh",
            session: session._id
        }, process.env.JWT_SECRET_KEY as string, {
            expiresIn: "7d"
        })

        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        session.refreshTokenHash = refreshTokenHash;
        await session.save();


        if (!session) {
            return NextResponse.json({ message: "Session not created", status: false }, { status: 500, statusText: "Something went wrong" });
        }

        const accessToken = jwt.sign({
            id: user._id,
            role: "user",
            type: "access",
            session: session._id
        }, process.env.JWT_SECRET_KEY as string, {
            expiresIn: "15m"
        })

        cookieStore.set({
            name: "accessToken",
            value: accessToken,
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60
        });

        cookieStore.set({
            name: "refreshToken",
            value: refreshToken,
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60
        });

        return NextResponse.json({ message: "Created successfully", status: true }, { status: 200, statusText: "Created successfully" });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}