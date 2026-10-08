import { connectDB } from "@/app/utility/db";
import { FoodItemsModel } from "@/app/utility/Model/FoodItemsModel";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { sessionModel } from "@/app/utility/Model/session.model";

connectDB();

type Props = {
    params: Promise<{
        id: string
    }>
}

type Jwt = {
    id: string
    role: string
    type: string
    session: string
}

export const GET = async (request: Request, { params }: Props) => {
    try {
        const cookieStore = await cookies();
        const { id } = await params;

        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                    status: false
                },
                {
                    status: 401
                }
            );;
        }

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        if (decoded.role !== "restaurant") {
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

        if (decoded.type !== "access") {
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

        const food = await FoodItemsModel.findOne({ _id: id, restaurantId: decoded.id });

        if (!food) {
            return NextResponse.json(
                {
                    message: "Food not found",
                    status: false
                },
                {
                    status: 404
                }
            );
        }

        return NextResponse.json({ message: "Fetched successfully", status: true, data: food }, { status: 200, statusText: "Fetched successfully" });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}


export const PUT = async (request: Request, { params }: Props) => {
    try {
        const cookieStore = await cookies();
        const { id } = await params;
        const payload = await request.json();

        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
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

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        if (decoded.role !== "restaurant") {
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

        if (decoded.type !== "access") {
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

        const food = await FoodItemsModel.findOneAndUpdate(
            {
                _id: id,
                restaurantId: decoded.id
            },
            payload,
            { new: true }
        );

        if (!food) {
            return NextResponse.json(
                {
                    message: "Food not found",
                    status: false
                },
                {
                    status: 404
                }
            );
        }

        return NextResponse.json({ message: "Updated successfully", status: true, data: food }, { status: 200, statusText: "Updated successfully" });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}