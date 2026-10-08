import { connectDB } from "@/app/utility/db";
import { DeliveryPartnerModel } from "@/app/utility/Model/DeliveryPartnerModel";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sessionModel } from "@/app/utility/Model/session.model";
import mongoose from "mongoose";

connectDB()

export const POST = async (request: Request) => {
    try {

        const cookieStore = await cookies();

        const payload = await request.json();

        const existingUser = await DeliveryPartnerModel.findOne({
            email: payload.email
        })

        if (existingUser) {
            return NextResponse.json({ message: "Email already exists", status: false }, { status: 409, statusText: "Email already exists" });
        }

        const hashPassword = await bcrypt.hash(payload.password, 10);
        payload.password = hashPassword;

        const deliveryPartner = await DeliveryPartnerModel.create(payload);

        if (!deliveryPartner) {
            return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
        }

        const tempSessionId = new mongoose.Types.ObjectId();

        const refreshToken = jwt.sign({
            id: deliveryPartner._id,
            type: "refresh",
            role: "deliverypartner",
            session: tempSessionId
        }, process.env.JWT_SECRET_KEY as string, {
            expiresIn: "7d"
        })

        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        const session = await sessionModel.create({
            _id: tempSessionId,
            user: deliveryPartner._id,
            refreshTokenHash,
            ip: request.headers.get("x-forwarded-for") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown"
        })

        if (!session) {
            return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
        }

        const accessToken = jwt.sign({
            id: deliveryPartner._id,
            role: "deliverypartner",
            type: "access",
            session: session._id
        }, process.env.JWT_SECRET_KEY as string, {
            expiresIn: "15m"
        })

        cookieStore.set("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60
        })

        cookieStore.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60
        })

        return NextResponse.json({ message: "Created successfully", status: true }, { status: 200, statusText: "Created successfully" });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}