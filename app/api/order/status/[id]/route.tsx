import { OrderModel } from "@/app/utility/Model/OrdersModel";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/app/utility/db";
import { sessionModel } from "@/app/utility/Model/session.model";

connectDB();

type Jwt = {
    id: string;
    role: string;
    type: string;
    session: string;
};

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export const PATCH = async (request: Request, { params }: Props) => {
    try {
        const { id } = await params;
        const cookieStore = await cookies();

        const accessToken =
            cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                    status: false,
                },
                {
                    status: 401,
                }
            );
        }

        const decoded = jwt.verify(
            accessToken,
            process.env.JWT_SECRET_KEY as string
        ) as Jwt;

        if (decoded.type !== "access") {
            return NextResponse.json(
                {
                    message: "Invalid token type",
                    status: false,
                },
                { status: 401 }
            );
        }

        if (decoded.role !== "deliverypartner") {
            return NextResponse.json(
                {
                    message: "Forbidden",
                    status: false,
                },
                { status: 403 }
            );
        }

        const session = await sessionModel.findById(
            decoded.session
        );

        if (!session || session.revoked) {
            return NextResponse.json(
                {
                    message: "Session not found",
                    status: false,
                },
                {
                    status: 401,
                }
            );
        }

        const { status } = await request.json();

        if (!status) {
            return NextResponse.json(
                {
                    message: "Status is required",
                    status: false,
                },
                { status: 400 }
            );
        }

        const order = await OrderModel.findOne({
            _id: id,
            deliveryBoyId: decoded.id,
        });

        if (!order) {
            return NextResponse.json(
                {
                    message: "Order not found",
                    status: false,
                },
                {
                    status: 404,
                }
            );
        }

        if (
            order.status === "Pending" &&
            status !== "Picked Up"
        ) {
            return NextResponse.json(
                {
                    message: "Pending order can only be picked up",
                    status: false,
                },
                { status: 400 }
            );
        }

        if (
            order.status === "Picked Up" &&
            status !== "Delivered"
        ) {
            return NextResponse.json(
                {
                    message: "Picked up order can only be delivered",
                    status: false,
                },
                { status: 400 }
            );
        }

        if (
            order.status === "Delivered" ||
            order.status === "Cancelled"
        ) {
            return NextResponse.json(
                {
                    message: "Order already completed",
                    status: false,
                },
                { status: 400 }
            );
        }

        order.status = status;
        await order.save();

        return NextResponse.json(
            {
                message: "Updated successfully",
                status: true,
                data: order,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                message: "Something went wrong",
                status: false,
            },
            {
                status: 500,
            }
        );
    }
};