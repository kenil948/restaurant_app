"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import DeliveryPartnerHeader from "../../_components/DeliveryPartnerHeader";
import RestaurantFooter from "../../_components/RestaurantFooter";
import {
    FiTruck,
    FiCheckCircle,
    FiClock,
    FiMapPin,
    FiPackage,
    FiCalendar,
} from "react-icons/fi";
import { fetchWithAuth } from "@/app/helper/fetchWithAuth";

type OrderType = {
    _id: string;
    amount: string;
    status: string;
    city: string;
    address: string;
    landmark: string;
    createdAt: string;
    restaurant: {
        restaurantName: string;
        city: string;
    };
};

const DeliveryDashboard = () => {
    const router = useRouter();

    const [myOrders, setMyOrders] = useState<OrderType[]>([]);
    const [deliveryBoyData, setDeliveryBoyData] = useState<any>(null);

    const getMyOrders = async () => {
        try {
            const response = await fetchWithAuth(
                "/api/deliverypartner/orders"
            );

            const data = await response.json();

            if (response.ok) {
                setMyOrders(data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const res = await fetchWithAuth(
                    "/api/deliverypartner/me"
                );

                const data = await res.json();

                if (res.ok) {
                    setDeliveryBoyData(data.data);
                    getMyOrders();
                } else {
                    router.replace("/deliverypartner");
                }

            } catch (error) {
                console.log(error);
                router.replace("/deliverypartner");
            }
        };

        getCurrentUser();
    }, [router]);

    const completedOrders = myOrders.filter(
        (item) => item.status === "Delivered"
    ).length;

    const pendingOrders = myOrders.filter(
        (item) => item.status === "Pending"
    ).length;

    const pickedUpOrders = myOrders.filter(
        item => item.status === "Picked Up"
    ).length;

    return (
        <>
            <DeliveryPartnerHeader />

            <main className="min-h-screen bg-zinc-50 py-10">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Welcome Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-md border border-zinc-100 mb-8">
                        <h1 className="text-4xl font-bold text-zinc-900">
                            Welcome,
                            <span className="text-orange-500">
                                {" "}
                                {deliveryBoyData?.fullName}
                            </span>
                        </h1>

                        <p className="text-zinc-500 mt-2">
                            Manage your deliveries and track order activity.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid md:grid-cols-4 gap-6 mb-8">

                        <div className="bg-white rounded-3xl p-6 shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-500">
                                        Total Orders
                                    </p>

                                    <h2 className="text-3xl font-bold mt-2">
                                        {myOrders.length}
                                    </h2>
                                </div>

                                <FiTruck
                                    size={34}
                                    className="text-orange-500"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-500">
                                        Delivered
                                    </p>

                                    <h2 className="text-3xl font-bold mt-2 text-green-600">
                                        {completedOrders}
                                    </h2>
                                </div>

                                <FiCheckCircle
                                    size={34}
                                    className="text-green-500"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-500">
                                        Pending
                                    </p>

                                    <h2 className="text-3xl font-bold mt-2 text-yellow-600">
                                        {pendingOrders}
                                    </h2>
                                </div>

                                <FiClock
                                    size={34}
                                    className="text-yellow-500"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-500">Picked Up</p>
                                    <h2 className="text-3xl font-bold mt-2 text-blue-600">
                                        {pickedUpOrders}
                                    </h2>
                                </div>

                                <FiPackage
                                    size={34}
                                    className="text-blue-500"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-3xl shadow-md p-6">

                        <h2 className="text-2xl font-bold mb-6">
                            Recent Orders
                        </h2>

                        {myOrders.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">📦</div>

                                <h3 className="text-2xl font-semibold">
                                    No Deliveries Yet
                                </h3>

                                <p className="text-zinc-500 mt-2">
                                    Orders assigned to you will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-5">

                                {myOrders.slice(0, 5).map((order) => (
                                    <div
                                        key={order._id}
                                        className="border border-zinc-200 rounded-2xl p-5"
                                    >

                                        <div className="flex justify-between items-start">

                                            <div>
                                                <h3 className="text-lg font-semibold">
                                                    {
                                                        order.restaurant
                                                            ?.restaurantName
                                                    }
                                                </h3>

                                                <p className="text-zinc-500 text-sm flex items-center gap-2">
                                                    <FiMapPin size={14} />
                                                    {
                                                        order.restaurant
                                                            ?.city
                                                    }
                                                </p>
                                            </div>

                                            <span
                                                className={`px-4 py-1 rounded-full text-sm font-medium ${order.status ===
                                                    "Delivered"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid md:grid-cols-3 gap-4">

                                            <div>
                                                <p className="text-zinc-500 text-sm">
                                                    Order Amount
                                                </p>

                                                <p className="text-2xl font-bold text-orange-500">
                                                    ₹{order.amount}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-zinc-500 text-sm flex items-center gap-2">
                                                    <FiTruck />
                                                    Delivery Address
                                                </p>

                                                <p className="font-medium">
                                                    {order.address},{" "}
                                                    {order.city}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-zinc-500 text-sm flex items-center gap-2">
                                                    <FiCalendar />
                                                    Date
                                                </p>

                                                <p className="font-medium">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                        </div>

                                        <div className="mt-4 text-xs text-zinc-400">
                                            Order #
                                            {order._id.slice(-4)}
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <RestaurantFooter />
        </>
    );
};

export default DeliveryDashboard;