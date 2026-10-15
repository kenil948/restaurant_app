
import { connectDB } from "@/app/utility/db";
import { OrderModel } from "@/app/utility/Model/OrdersModel";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";

type Jwt = {
    id: string;
    role: string;
    type: string;
    session: string;
};

export const POST = async (request: Request) => {
    try {
        await connectDB();

        // 1. Authenticate the customer
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken || !process.env.JWT_SECRET_KEY) {
            return NextResponse.json(
                { status: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(
            accessToken,
            process.env.JWT_SECRET_KEY
        ) as Jwt;

        if (decoded.role !== "user" || decoded.type !== "access") {
            return NextResponse.json(
                { status: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Get payment details from Razorpay Checkout
        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = await request.json();

        if (
            !mongoose.Types.ObjectId.isValid(orderId) ||
            typeof razorpay_order_id !== "string" ||
            typeof razorpay_payment_id !== "string" ||
            typeof razorpay_signature !== "string"
        ) {
            return NextResponse.json(
                { status: false, message: "Invalid payment details." },
                { status: 400 }
            );
        }

        if (
            !process.env.RAZORPAY_KEY_ID ||
            !process.env.RAZORPAY_KEY_SECRET
        ) {
            return NextResponse.json(
                { status: false, message: "Payment gateway is not configured." },
                { status: 500 }
            );
        }

        // 3. Find this customer's saved order
        const order = await OrderModel.findOne({
            _id: orderId,
            userId: decoded.id,
            paymentMethod: "Razorpay",
            razorpayOrderId: razorpay_order_id,
        });

        if (!order) {
            return NextResponse.json(
                { status: false, message: "Order not found." },
                { status: 404 }
            );
        }

        // 4. Verify Razorpay's payment signature
        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const received = Buffer.from(razorpay_signature, "hex");
        const expected = Buffer.from(expectedSignature, "hex");

        if (
            received.length !== expected.length ||
            !crypto.timingSafeEqual(received, expected)
        ) {
            return NextResponse.json(
                { status: false, message: "Payment signature is invalid." },
                { status: 400 }
            );
        }


        // 5. If the verified webhook has already confirmed this
        // exact payment, don't repeat the Razorpay API fetch.
        if (
            order.paymentStatus === "Paid" &&
            order.razorpayPaymentId === razorpay_payment_id &&
            order.razorpayOrderId === razorpay_order_id
        ) {
            return NextResponse.json({
                status: true,
                message: "Payment verified successfully.",
                data: {
                    orderId: order._id,
                    paymentStatus: order.paymentStatus,
                    transactionId: order.transactionId,
                },
            });
        }

        // 6. Otherwise, verify the payment directly with Razorpay.
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        let payment;

        try {
            payment = await razorpay.payments.fetch(
                razorpay_payment_id
            );
        } catch (error) {
            console.error(
                "Razorpay payment fetch failed:",
                error
            );

            // The webhook may have confirmed payment while
            // the API request was failing. Recheck MongoDB.
            const latestOrder = await OrderModel.findOne({
                _id: orderId,
                userId: decoded.id,
                paymentMethod: "Razorpay",
                razorpayOrderId: razorpay_order_id,
            });

            if (
                latestOrder?.paymentStatus === "Paid" &&
                latestOrder.razorpayPaymentId ===
                razorpay_payment_id
            ) {
                return NextResponse.json({
                    status: true,
                    message: "Payment verified successfully.",
                    data: {
                        orderId: latestOrder._id,
                        paymentStatus: latestOrder.paymentStatus,
                        transactionId: latestOrder.transactionId,
                    },
                });
            }

            return NextResponse.json(
                {
                    status: false,
                    message:
                        "Payment confirmation is temporarily unavailable. Please check your order status before retrying.",
                },
                { status: 503 }
            );
        }


        if (
            payment.order_id !== order.razorpayOrderId ||
            payment.amount !== Math.round(order.amount * 100) ||
            payment.currency !== "INR"
        ) {
            return NextResponse.json(
                { status: false, message: "Payment details do not match the order." },
                { status: 400 }
            );
        }

        // 6. Only mark the order paid after capture
        if (payment.status !== "captured") {
            if (payment.status === "failed") {
                order.paymentStatus = "Failed";
                order.razorpayPaymentId = razorpay_payment_id;
                order.transactionId = razorpay_payment_id;
                await order.save();

                return NextResponse.json(
                    { status: false, message: "Payment failed." },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                {
                    status: false,
                    message: "Payment is not captured yet. Please wait for confirmation.",
                },
                { status: 409 }
            );
        }

        // 7. Update the database order
        if (order.paymentStatus !== "Paid") {
            order.paymentStatus = "Paid";
            order.razorpayPaymentId = razorpay_payment_id;
            order.transactionId = razorpay_payment_id;
            await order.save();
        }

        return NextResponse.json({
            status: true,
            message: "Payment verified successfully.",
            data: {
                orderId: order._id,
                paymentStatus: order.paymentStatus,
                transactionId: order.transactionId,
            },
        });
    } catch (error) {
        console.error("Razorpay verification error:", error);

        if (
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.TokenExpiredError
        ) {
            return NextResponse.json(
                { status: false, message: "Invalid or expired token." },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { status: false, message: "Unable to verify payment." },
            { status: 500 }
        );
    }
};
