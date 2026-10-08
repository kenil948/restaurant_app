import { connectDB } from "@/app/utility/db";
import { DeliveryPartnerModel } from "@/app/utility/Model/DeliveryPartnerModel";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { sessionModel } from "@/app/utility/Model/session.model";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

connectDB();

export const POST = async (request: Request) => {
    try {
        const cookieStore = await cookies();
        const payload = await request.json();

        const deliveryPartner = await DeliveryPartnerModel.findOne({
            email: payload.email,
        });

        if (!deliveryPartner) {
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
            deliveryPartner.password
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
            return NextResponse.json(
                {
                    message: "Something went wrong",
                    status: false,
                },
                { status: 500 }
            );
        }

        const accessToken = jwt.sign({
            id: deliveryPartner._id,
            type: "access",
            role: "deliverypartner",
            session: session._id
        }, process.env.JWT_SECRET_KEY as string, {
            expiresIn: "15m"
        })

        cookieStore.set("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 15 * 60 });
        cookieStore.set("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 60 * 60 * 24 * 7 });

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