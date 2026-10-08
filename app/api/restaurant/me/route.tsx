import { connectDB } from "@/app/utility/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { RestaurantModel } from "@/app/utility/Model/RestaurantsModel";
import { sessionModel } from "@/app/utility/Model/session.model";

connectDB()

type Jwt = {
    id: string,
    role: string,
    type: string,
    session: string
}

export const GET = async (request: Request) => {

    try {
        const cookieStore = await cookies();

        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });

        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as Jwt;

        if (decoded.role !== "restaurant") {
            return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });
        }

        if (decoded.type !== "access") return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401, statusText: "User not found" });

        const session = await sessionModel.findById(decoded.session);

        if (!session || session.revoked) return NextResponse.json({ message: "Session not found", status: false }, { status: 401 });

        const user = await RestaurantModel.findById(decoded.id).select("-password");

        if (!user) return NextResponse.json({ message: "User not found", status: false }, { status: 404, statusText: "User not found" });

        return NextResponse.json({ message: "User found", status: true, data: user }, { status: 200, statusText: "User found" });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Something went wrong", status: false }, { status: 500, statusText: "Something went wrong" });
    }
}