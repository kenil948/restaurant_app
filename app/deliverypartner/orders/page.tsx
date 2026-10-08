"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DeliveryPartnerHeader from "@/app/_components/DeliveryPartnerHeader";
import RestaurantFooter from "@/app/_components/RestaurantFooter";
import { FiCalendar, FiMapPin, FiNavigation, FiTruck } from "react-icons/fi";
import { fetchWithAuth } from "@/app/helper/fetchWithAuth";
import { useRouter } from "next/navigation";

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

type DeliveryPartner = {
    _id: string;
    fullName: string;
    email: string;
    city: string;
    contactNumber: string;
};

const AvailableOrders = () => {
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState(true);
    const [deliveryBoy, setDeliveryBoy] = useState<DeliveryPartner | null>(null);

    const router = useRouter();

    const getOrders = async () => {
        try {
            const response = await fetchWithAuth(
                "/api/deliverypartner/orders"
            );

            const data = await response.json();

            if (response.ok) {
                setOrders(data.data);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const res = await fetchWithAuth("/api/deliverypartner/me");

                const data = await res.json();

                if (!res.ok) {
                    router.replace("/deliverypartner");
                    return;
                }

                setDeliveryBoy(data.data);
                await getOrders();
            } catch (error) {
                console.log(error);
                router.replace("/deliverypartner");
            }
        }

        getCurrentUser();
    }, [router])

    const updateOrderStatus = async (
        orderId: string,
        status: string
    ) => {
        try {
            const response = await fetchWithAuth(
                `/api/order/status/${orderId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status }),
                }
            );

            if (response.ok) {
                toast.success("Order status updated");
                await getOrders();
            } else {
                toast.error("Unable to update order");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    };

    const activeOrders = useMemo(
        () =>
            orders.filter(
                (order) => order.status !== "Delivered"
            ),
        [orders]
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <>
            <DeliveryPartnerHeader />

            <main className="min-h-screen bg-zinc-50 py-10">
                <div className="max-w-7xl mx-auto px-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">

                        <div>
                            <h1 className="text-4xl font-bold text-zinc-900">
                                Available Orders
                            </h1>

                            <p className="text-zinc-500 mt-2">
                                Manage and deliver assigned orders.
                            </p>
                        </div>

                        <div className="bg-orange-100 text-orange-600 px-5 py-3 rounded-2xl font-semibold">
                            {activeOrders.length} Active Orders
                        </div>

                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-zinc-500">
                            Loading orders...
                        </div>
                    ) : activeOrders.length === 0 ? (
                        <div className="bg-white rounded-3xl shadow-md p-12 text-center">

                            <div className="text-6xl mb-4">
                                🛵
                            </div>

                            <h2 className="text-2xl font-bold text-zinc-800">
                                No Orders Available
                            </h2>

                            <p className="text-zinc-500 mt-3">
                                New delivery requests will appear here.
                            </p>

                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

                            {activeOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className="bg-white rounded-3xl shadow-md border border-zinc-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                                >

                                    <div className="bg-orange-500 text-white p-5">

                                        <h2 className="text-xl font-bold">
                                            {order.restaurant?.restaurantName}
                                        </h2>

                                        <p className="text-orange-100 text-sm mt-1">
                                            {order.restaurant?.city}
                                        </p>

                                    </div>

                                    <div className="p-5">

                                        <div className="flex justify-between items-center mb-5">

                                            <div>
                                                <p className="text-sm text-zinc-500">
                                                    Order Amount
                                                </p>

                                                <p className="text-3xl font-bold text-orange-500">
                                                    ₹{order.amount}
                                                </p>
                                            </div>

                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === "Pending"
                                                    ? "bg-yellow-100 text-yellow-700 font-semibold"
                                                    : order.status ===
                                                        "Picked Up"
                                                        ? "bg-blue-100 text-blue-700 font-semibold"
                                                        : "bg-red-100 text-red-700 font-semibold"
                                                    }`}
                                            >
                                                {order.status}
                                            </span>

                                        </div>

                                        <div className="space-y-4">

                                            <div>
                                                <p className="text-sm text-zinc-500 flex items-center gap-2">
                                                    <FiTruck className="text-orange-500" />
                                                    Delivery Address
                                                </p>

                                                <p className="font-medium">
                                                    {order.address}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-zinc-500 flex items-center gap-2">
                                                    <FiNavigation className="text-orange-500" />
                                                    Landmark
                                                </p>

                                                <p className="font-medium">
                                                    {order.landmark || "N/A"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-zinc-500 flex items-center gap-2">
                                                    <FiMapPin className="text-orange-500" />
                                                    City
                                                </p>

                                                <p className="font-medium capitalize">
                                                    {order.city}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-zinc-500 flex items-center gap-2">
                                                    <FiCalendar className="text-orange-500" />
                                                    Order Date
                                                </p>

                                                <p className="font-medium">
                                                    {new Date(order.createdAt).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </p>
                                            </div>

                                        </div>

                                        <div className="mt-5 pt-4 border-t border-zinc-200">

                                            <p className="text-xs text-zinc-400 mb-4">
                                                Order #
                                                {order._id.slice(-6)}
                                            </p>

                                            {order.status === "Pending" && (
                                                <button
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                "Accept this order?"
                                                            )
                                                        ) {
                                                            updateOrderStatus(
                                                                order._id,
                                                                "Picked Up"
                                                            );
                                                        }
                                                    }}
                                                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold cursor-pointer"
                                                >
                                                    Accept Order
                                                </button>
                                            )}

                                            {order.status ===
                                                "Picked Up" && (
                                                    <button
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    "Mark this order as delivered?"
                                                                )
                                                            ) {
                                                                updateOrderStatus(
                                                                    order._id,
                                                                    "Delivered"
                                                                );
                                                            }
                                                        }}
                                                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold cursor-pointer"
                                                    >
                                                        Mark Delivered
                                                    </button>
                                                )}
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <RestaurantFooter />
        </>
    );
};

export default AvailableOrders;