import { connectDB } from "@/app/utility/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DeliveryPartnerModel } from "@/app/utility/Model/DeliveryPartnerModel";
import { sessionModel } from "@/app/utility/Model/session.model";

connectDB();

type Jwt = {
    id: string;
    role: string;
    type: string;
    session: string;
}

export const GET = async (req: Request) => {
    try {

        const cookieStore = await cookies();

        const accessToken = cookieStore.get("accessToken")?.value || "";

        if (!accessToken) return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        if (decoded.role !== "deliverypartner") {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                    status: false
                },
                {
                    status: 401
                }
            );
        }

        if (decoded.type !== "access") return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });

        const session = await sessionModel.findById(decoded.session);

        if (!session || session.revoked) {
            return NextResponse.json(
                {
                    message: "Session not found",
                    status: false
                },
                {
                    status: 404
                }
            );
        }

        const deliveryPartner = await DeliveryPartnerModel.findById(decoded.id).select("-password");

        if (!deliveryPartner) {
            return NextResponse.json(
                {
                    message: "Delivery partner not found",
                    status: false
                },
                {
                    status: 404
                }
            );
        }

        return NextResponse.json({ message: "Fetched successfully", status: true, data: deliveryPartner }, { status: 200, statusText: "Fetched successfully" });

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                message: "Invalid or expired token",
                status: false
            },
            {
                status: 401
            }
        );
    }
}