import { connectDB } from "@/app/utility/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sessionModel } from "@/app/utility/Model/session.model";
import mongoose from "mongoose";
import { RestaurantModel } from "@/app/utility/Model/RestaurantsModel";

connectDB();

export const POST = async (request: Request) => {
    try {
        const cookieStore = await cookies();

        const payload = await request.json();

        const existingUser = await RestaurantModel.findOne({
            email: payload.email
        })

        if (existingUser) {
            return NextResponse.json({ message: "Email already exists", status: false }, { status: 409, statusText: "Email already exists" });
        }

        const hashPassword = await bcrypt.hash(payload.password, 10);

        payload.password = hashPassword;

        const restaurant = await RestaurantModel.create(payload);

        const tempSessionId = new mongoose.Types.ObjectId();

        const refreshToken = jwt.sign({
            id: restaurant._id,
            type: "refresh",
            role: "restaurant",
            session: tempSessionId
        }, process.env.JWT_SECRET_KEY as string, { expiresIn: "7d" });

        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        const session = await sessionModel.create({
            _id: tempSessionId,
            user: restaurant._id,
            refreshTokenHash,
            ip: request.headers.get("x-forwarded-for") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown"
        });

        if (!session) {
            return NextResponse.json({ message: "Session not created", status: false }, { status: 500 });
        }

        const accessToken = jwt.sign({
            id: restaurant._id,
            type: "access",
            role: "restaurant",
            session: session._id
        }, process.env.JWT_SECRET_KEY as string, { expiresIn: "15m" });

        cookieStore.set("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 15 * 60 });
        cookieStore.set("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 7 * 24 * 60 * 60 });

        return NextResponse.json({ message: "Signup successful", status: true }, { status: 201, statusText: "Signup successful" });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}