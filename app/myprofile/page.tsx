"use client";

import React, { useEffect, useState } from "react";
import CustomerHeader from "../_components/CustomerHeader";
import RestaurantFooter from "../_components/RestaurantFooter";
import { fetchWithAuth } from "../helper/fetchWithAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

type OrderType = {
    orderId: string;
    amount: string;
    status: string;
    city: string;
    address: string;
    landmark: string;
    paymentMethod: string;
    paymentStatus: string;
    restaurant: {
        restaurantName: string;
        city: string;
    };
};


const MyProfile = () => {

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [myOrders, setMyOrders] = useState<OrderType[]>([]);
    const [user, setUser] = useState<any>(null);

    const getCurrentUser = async () => {
        try {
            const response = await fetchWithAuth("/api/user/me");

            if (!response.ok) {
                router.push("/user-auth?mode=login");
                return;
            }

            const data = await response.json();
            setUser(data.data);
        } catch (error) {
            console.log(error);
        }
    };

    const getMyOrders = async () => {
        try {
            const response = await fetchWithAuth("/api/order");

            if (!response.ok) {
                router.push("/user-auth?mode=login");
                return;
            }

            const data = await response.json();
            setMyOrders(data.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    getCurrentUser(),
                    getMyOrders()
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }
    return (
        <>
            <CustomerHeader />

            <main className="min-h-screen bg-zinc-50 py-10">
                <div className="max-w-7xl mx-auto px-6">

                    <h1 className="text-4xl font-bold text-zinc-900 mb-8">
                        My Profile
                    </h1>

                    <div className="grid lg:grid-cols-[350px_1fr] gap-8">

                        <div className="bg-white rounded-3xl shadow-md p-6 h-fit lg:sticky lg:top-28">
                            <div className="flex items-center gap-4 mb-6">

                                <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold">
                                    {user?.fullName?.charAt(0)}
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold">
                                        {user?.fullName}
                                    </h2>

                                    <p className="text-zinc-500">
                                        Customer Account
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">

                                <div>
                                    <p className="text-sm text-zinc-500">
                                        Email Address
                                    </p>

                                    <p className="font-medium">
                                        {user?.email}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-zinc-500">
                                        Contact Number
                                    </p>

                                    <p className="font-medium">
                                        {user?.contactNumber}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-zinc-500">
                                        Total Orders
                                    </p>

                                    <p className="font-medium text-orange-500">
                                        {myOrders.length}
                                    </p>
                                </div>

                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-md p-6">

                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">
                                    Order History
                                </h2>

                                <span className="text-zinc-500 text-sm">
                                    {myOrders.length} Orders
                                </span>
                            </div>

                            {myOrders.length === 0 ? (
                                <div className="bg-zinc-50 rounded-3xl p-12 text-center">

                                    <h3 className="text-xl font-semibold">
                                        No Orders Yet
                                    </h3>

                                    <p className="text-zinc-500 mt-2">
                                        Start exploring restaurants and place your first order.
                                    </p>

                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {myOrders.map((order) => {
                                        const shortId = order.orderId.slice(-4);

                                        return (
                                            <Link
                                                key={order.orderId}
                                                href={`/myprofile/order-details/${order.orderId}`}
                                                className="group block border border-zinc-200 rounded-2xl p-5 bg-white hover:border-orange-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors">
                                                            {order.restaurant.restaurantName}
                                                        </h3>

                                                        <p className="text-sm text-zinc-500 mt-1">
                                                            {order.restaurant.city}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${order.paymentMethod === "Razorpay" &&
                                                                order.paymentStatus !== "Paid"
                                                                ? order.paymentStatus === "Failed"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-amber-100 text-amber-700"
                                                                : order.status === "Pending"
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : order.status === "Delivered"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : order.status === "Cancelled"
                                                                            ? "bg-red-100 text-red-700"
                                                                            : "bg-blue-100 text-blue-700"
                                                            }`}
                                                    >
                                                        {order.paymentMethod === "Razorpay" &&
                                                            order.paymentStatus !== "Paid"
                                                            ? order.paymentStatus === "Failed"
                                                                ? "Payment Failed"
                                                                : "Awaiting Payment"
                                                            : order.status}
                                                    </span>
                                                </div>

                                                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-zinc-500">
                                                            Amount
                                                        </p>

                                                        <p className="text-2xl font-bold text-orange-500 mt-1">
                                                            ₹{order.amount}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm text-zinc-500">
                                                            Delivery Location
                                                        </p>

                                                        <p className="font-medium text-zinc-800 mt-1 break-words">
                                                            {order.address}, {order.city}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                                                    <span className="text-sm text-zinc-500">
                                                        Order #{shortId}
                                                    </span>

                                                    <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 group-hover:gap-2 transition-all">
                                                        View Details
                                                        <span aria-hidden="true">→</span>
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}

                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>

            <RestaurantFooter />
        </>
    );
};

export default MyProfile;