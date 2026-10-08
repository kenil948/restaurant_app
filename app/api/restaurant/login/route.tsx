import { connectDB } from "@/app/utility/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { RestaurantModel } from "@/app/utility/Model/RestaurantsModel";
import mongoose from "mongoose";
import { sessionModel } from "@/app/utility/Model/session.model";

connectDB()

export const POST = async (request: Request) => {
    try {
        const cookieStore = await cookies();

        const payload = await request.json();

        const existingUser = await RestaurantModel.findOne({
            email: payload.email
        })

        if (!existingUser) {
            return NextResponse.json({ message: "Invalid email or password", status: false }, { status: 401, statusText: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(
            payload.password,
            existingUser.password
        );

        if (!isMatch) {
            return NextResponse.json({ message: "Invalid email or password", status: false }, { status: 401, statusText: "Invalid email or password" });
        }

        const tempSessionId = new mongoose.Types.ObjectId();

        const refreshToken = jwt.sign({
            id: existingUser._id,
            type: "refresh",
            role: "restaurant",
            session: tempSessionId
        }, process.env.JWT_SECRET_KEY as string, { expiresIn: "7d" });

        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        const session = await sessionModel.create({
            _id: tempSessionId,
            user: existingUser._id,
            refreshTokenHash,
            ip: request.headers.get("x-forwarded-for") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown"
        });

        if (!session) {
            return NextResponse.json({ message: "Session not created", status: false }, { status: 500 });
        }

        const accessToken = jwt.sign({
            id: existingUser._id,
            type: "access",
            role: "restaurant",
            session: session._id
        }, process.env.JWT_SECRET_KEY as string, { expiresIn: "15m" });

        cookieStore.set("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 15 * 60 });
        cookieStore.set("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 60 * 60 * 24 * 7 });

        return NextResponse.json({ message: "Login successful", status: true }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}