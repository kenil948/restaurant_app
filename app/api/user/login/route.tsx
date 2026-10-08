import { connectDB } from "@/app/utility/db";
import { UserModel } from "@/app/utility/Model/UserModel";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sessionModel } from "@/app/utility/Model/session.model";
import { cookies } from "next/headers";
import mongoose from "mongoose";

connectDB();

export const POST = async (request: Request) => {
    try {
        const cookieStore = await cookies();
        const payload = await request.json();

        const user = await UserModel.findOne({
            email: payload.email,
        });

        if (!user) {
            return NextResponse.json(
                {
                    message: "Invalid email or password",
                    status: false,
                },
                { status: 401 }
            );
        }

        const isMatch = await bcrypt.compare(
            payload.password,
            user.password
        );

        if (!isMatch) {
            return NextResponse.json(
                {
                    message: "Invalid email or password",
                    status: false,
                },
                { status: 401 }
            );
        }

        const tempSessionId = new mongoose.Types.ObjectId();

        const refreshToken = jwt.sign(
            {
                id: user._id,
                role: "user",
                type: "refresh",
                session: tempSessionId
            },
            process.env.JWT_SECRET_KEY as string,
            {
                expiresIn: "7d"
            }
        );

        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        const session = await sessionModel.create({
            _id: tempSessionId,
            user: user._id,
            refreshTokenHash,
            ip: request.headers.get("x-forwarded-for") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown"
        });
        const accessToken = jwt.sign(
            {
                id: user._id,
                role: "user",
                type: "access",
                session: session._id,
            },
            process.env.JWT_SECRET_KEY as string,
            {
                expiresIn: "15m",
            }
        );

        cookieStore.set({
            name: "accessToken",
            value: accessToken,
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60,
        });

        cookieStore.set({
            name: "refreshToken",
            value: refreshToken,
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60,
        });

        return NextResponse.json(
            {
                message: "Login Successful",
                status: true,
            },
            { status: 200 }
        );
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                message: "Something went wrong",
                status: false,
            },
            { status: 500 }
        );
    }
};