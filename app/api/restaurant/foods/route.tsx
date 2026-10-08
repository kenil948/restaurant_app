import { connectDB } from "@/app/utility/db";
import { FoodItemsModel } from "@/app/utility/Model/FoodItemsModel";
import { sessionModel } from "@/app/utility/Model/session.model";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connectDB();

type Jwt = {
    id: string
    role: string
    type: string
    session: string
}
export const POST = async (request: Request) => {
    try {
        const cookieStore = await cookies();
        const payload = await request.json();
        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json({
                message: "Unauthorized",
                status: false
            }, {
                status: 401
            })
        };

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        if (decoded.role !== "restaurant") {
            return NextResponse.json({
                message: "Unauthorized",
                status: false
            }, {
                status: 401
            })
        };

        if (decoded.type !== "access") {
            return NextResponse.json({
                message: "Unauthorized",
                status: false
            }, {
                status: 401
            })
        };

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
        const food = await FoodItemsModel.create({
            ...payload,
            restaurantId: decoded.id
        });


        return NextResponse.json({ message: "Created successfully", status: true, data: food }, { status: 200, statusText: "Created successfully" });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}


export const GET = async (request: Request) => {
    try {
        const cookieStore = await cookies();

        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json({
                message: "Unauthorized",
                status: false
            }, {
                status: 401
            })
        };

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        if (decoded.role !== "restaurant") {
            return NextResponse.json({
                message: "Unauthorized",
                status: false
            }, {
                status: 401
            })
        };

        if (decoded.type !== "access") {
            return NextResponse.json({
                message: "Unauthorized",
                status: false
            }, {
                status: 401
            })
        };

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

        const foods = await FoodItemsModel.find({ restaurantId: decoded.id });

        return NextResponse.json({ message: "Fetched successfully", status: true, data: foods }, { status: 200, statusText: "Fetched successfully" });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}