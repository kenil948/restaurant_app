"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";

type OrderType = {
    _id: string;
    transactionId: string;
    paymentMethod: string;
    paymentStatus: string;
    amount: number;
    status: string;
    createdAt?: string;
};

const PaymentSuccessPage = ({
    params,
}: {
    params: Promise<{ id: string }>;
}) => {

    const router = useRouter();

    const [order, setOrder] = useState<OrderType | null>(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const getOrder = async () => {
            try {

                const { id } = await params;

                const res = await fetch(`/api/order/${id}`);

                const data = await res.json();

                if (res.ok) {
                    setOrder(data.data);
                }

            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        getOrder();
    }, [params]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const timer = setTimeout(() => {
            router.push("/myprofile");
        }, 5000);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-lg font-medium">
                Loading...
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center text-lg font-medium">
                Order not found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-100 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-zinc-200 p-8">

                <div className="text-center">

                    <FaCheckCircle
                        className="mx-auto text-green-500"
                        size={90}
                    />

                    <h1 className="text-4xl font-bold text-zinc-900 mt-6">
                        Payment Successful
                    </h1>

                    <p className="text-zinc-500 mt-3 max-w-md mx-auto">
                        Thank you for your payment. Your order has been confirmed
                        and will be prepared shortly.
                    </p>

                </div>

                {/* Transaction ID */}

                <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-5">

                    <p className="text-sm text-zinc-500">
                        Transaction ID
                    </p>

                    <p className="font-semibold text-zinc-900 break-all mt-1">
                        {order.transactionId}
                    </p>

                </div>

                {/* Order ID */}

                <div className="mt-4 bg-purple-50 border border-purple-200 rounded-2xl p-5">

                    <p className="text-sm text-zinc-500">
                        Order ID
                    </p>

                    <p className="font-semibold text-zinc-900 break-all mt-1">
                        {order._id}
                    </p>

                </div>

                {/* Payment Method */}

                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-2xl p-5">

                    <p className="text-sm text-zinc-500">
                        Payment Method
                    </p>

                    <p className="font-semibold text-zinc-900 mt-1">
                        {order.paymentMethod}
                    </p>

                </div>

                {/* Payment Status */}

                <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-5">

                    <p className="text-sm text-zinc-500">
                        Payment Status
                    </p>

                    <p className="font-semibold text-green-600 mt-1">
                        {order.paymentStatus}
                    </p>

                </div>

                {/* Amount */}

                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-5">

                    <p className="text-sm text-zinc-500">
                        Amount Paid
                    </p>

                    <p className="font-semibold text-zinc-900 mt-1 text-xl">
                        ₹{order.amount}
                    </p>

                </div>

                {/* Order Status */}

                <div className="mt-4 bg-zinc-50 border border-zinc-200 rounded-2xl p-5">

                    <p className="text-sm text-zinc-500">
                        Order Status
                    </p>

                    <p
                        className={`font-semibold mt-1 ${order.status === "Pending"
                            ? "text-orange-500"
                            : order.status === "Delivered"
                                ? "text-green-600"
                                : "text-blue-500"
                            }`}
                    >
                        {order.status}
                    </p>

                </div>

                {/* Order Timeline */}

                <div className="mt-6 border border-zinc-200 rounded-2xl p-5">

                    <h3 className="font-semibold text-zinc-900 mb-4">
                        Order Progress
                    </h3>

                    <div className="flex items-center justify-between text-sm">

                        <div className="text-center">
                            <div className="w-4 h-4 rounded-full bg-green-500 mx-auto"></div>
                            <p className="mt-2">Placed</p>
                        </div>

                        <div className="flex-1 h-[2px] bg-zinc-300 mx-2"></div>

                        <div className="text-center">
                            <div className="w-4 h-4 rounded-full bg-zinc-300 mx-auto"></div>
                            <p className="mt-2">Preparing</p>
                        </div>

                        <div className="flex-1 h-[2px] bg-zinc-300 mx-2"></div>

                        <div className="text-center">
                            <div className="w-4 h-4 rounded-full bg-zinc-300 mx-auto"></div>
                            <p className="mt-2">Delivered</p>
                        </div>

                    </div>

                </div>

                <p className="text-center text-sm text-zinc-400 mt-5">
                    Redirecting to My Orders in {countdown} seconds...
                </p>

                <div className="mt-8 flex flex-col gap-3">

                    <Link
                        href="/myprofile"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-semibold text-center transition"
                    >
                        View My Orders
                    </Link>

                    <Link
                        href="/"
                        className="w-full border border-zinc-300 py-4 rounded-2xl font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition"
                    >
                        Back To Home
                    </Link>

                </div>

            </div>

        </div>
    );
};

export default PaymentSuccessPage;