"use client";

import RestaurantFooter from "@/app/_components/RestaurantFooter";
import RestaurantHeader from "@/app/_components/RestaurantHeader";
import { fetchWithAuth } from "@/app/helper/fetchWithAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
    FiMail,
    FiPhone,
    FiMapPin,
    FiPackage,
    FiCheckCircle,
    FiClock,
    FiDollarSign,
    FiTrendingUp,
    FiClipboard,
    FiCreditCard,
    FiHome,
    FiCalendar,
} from "react-icons/fi";

type Restaurant = {
    _id: string;
    restaurantName: string;
    email: string;
    city: string;
    fullAddress: string;
    contactNumber: string;
    createdAt?: string;
};

type Order = {
    orderId: string;
    status: string;
    amount: string;
    createdAt: string;
};

type Food = {
    foodName: string;
    price: number;
};

const RestaurantProfile = () => {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [foods, setFoods] = useState<Food[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const res = await fetchWithAuth("/api/restaurant/me");

                const data = await res.json();

                if (res.ok) {
                    setRestaurant(data.data);
                } else {
                    router.replace("/restaurant");
                }
            } catch (error) {
                console.log(error);
                router.replace("/restaurant");
            }
        }

        getCurrentUser();

    }, [router])

    useEffect(() => {
        if (!restaurant?._id) {
            return;
        }
        const getData = async () => {
            try {
                const foodsRes = await fetchWithAuth(
                    "/api/restaurant/foods"
                );

                const foodsJson = await foodsRes.json();

                if (foodsRes.ok) {
                    setFoods(foodsJson.data);
                }

                const res = await fetchWithAuth(
                    "/api/restaurant/orders"
                );

                const data = await res.json();
                console.log(data)

                if (res.ok) {
                    setOrders(data.data);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, [restaurant?._id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
                Loading...
            </div>
        );
    }

    const deliveredOrders = orders.filter(
        (order) => order.status === "Delivered"
    ).length;

    const pendingOrders = orders.filter(
        (order) => order.status === "Pending"
    ).length;

    const cancelledOrders = orders.filter(
        (order) => order.status === "Cancelled"
    ).length;

    const totalRevenue = orders
        .filter((order) => order.status === "Delivered")
        .reduce(
            (sum, order) => sum + Number(order.amount),
            0
        );

    const today = new Date();

    const todayRevenue = orders
        .filter((order) => {
            const orderDate = new Date(order.createdAt);

            return (
                order.status === "Delivered" &&
                orderDate.getDate() === today.getDate() &&
                orderDate.getMonth() === today.getMonth() &&
                orderDate.getFullYear() === today.getFullYear()
            );
        })
        .reduce(
            (sum, order) => sum + Number(order.amount),
            0
        );

    const monthlyRevenue = orders
        .filter((order) => {
            const orderDate = new Date(order.createdAt);

            return (
                order.status === "Delivered" &&
                orderDate.getMonth() === today.getMonth() &&
                orderDate.getFullYear() === today.getFullYear()
            );
        })
        .reduce(
            (sum, order) => sum + Number(order.amount),
            0
        );

    const successRate =
        orders.length > 0
            ? Math.round(
                (deliveredOrders / orders.length) * 100
            )
            : 0;

    const joinedDate = new Date(
        restaurant?.createdAt || Date.now()
    ).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <>
            <RestaurantHeader />

            <div className="min-h-screen bg-zinc-50">

                {/* Hero Section */}

                <section className="max-w-7xl mx-auto px-6 pt-10">
                    <div className="bg-orange-500 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-lg">

                        <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg">
                            <span className="text-5xl font-bold text-orange-500">
                                {restaurant?.restaurantName?.charAt(0)}
                            </span>
                        </div>

                        <div className="text-white text-center md:text-left">
                            <h1 className="text-4xl font-bold">
                                {restaurant?.restaurantName}
                            </h1>

                            <p className="text-orange-100 mt-1 text-lg">
                                Active Restaurant Partner
                            </p>

                            <p className="mt-3 flex items-center justify-center md:justify-start gap-2 text-orange-50">
                                <FiMapPin />
                                {restaurant?.city}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}

                <section className="max-w-7xl mx-auto px-6 mt-10">
                    <h2 className="text-3xl font-bold mb-6">
                        Restaurant Overview
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-600">
                                    Total Foods
                                </span>

                                <FiPackage
                                    size={32}
                                    className="text-orange-500"
                                />
                            </div>

                            <h3 className="text-5xl font-bold mt-4">
                                {foods.length}
                            </h3>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-600">
                                    Total Orders
                                </span>

                                <FiClipboard
                                    size={32}
                                    className="text-blue-500"
                                />
                            </div>

                            <h3 className="text-5xl font-bold mt-4">
                                {orders.length}
                            </h3>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-600">
                                    Delivered
                                </span>

                                <FiCheckCircle
                                    size={32}
                                    className="text-green-500"
                                />
                            </div>

                            <h3 className="text-5xl font-bold text-green-600 mt-4">
                                {deliveredOrders}
                            </h3>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-600">
                                    Pending
                                </span>

                                <FiClock
                                    size={32}
                                    className="text-amber-500"
                                />
                            </div>

                            <h3 className="text-5xl font-bold text-amber-600 mt-4">
                                {pendingOrders}
                            </h3>
                        </div>

                    </div>
                </section>

                {/* Revenue Summary */}

                <section className="max-w-7xl mx-auto px-6 mt-14">

                    <h2 className="text-3xl font-bold mb-6">
                        Revenue Summary
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">

                        <div className="bg-green-50 border border-green-100 rounded-3xl p-6">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-700">
                                    Today's Revenue
                                </span>

                                <FiDollarSign
                                    size={30}
                                    className="text-green-500"
                                />
                            </div>

                            <h3 className="text-5xl font-bold text-green-600 mt-4">
                                ₹{todayRevenue}
                            </h3>
                        </div>

                        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-700">
                                    Monthly Revenue
                                </span>

                                <FiTrendingUp
                                    size={30}
                                    className="text-orange-500"
                                />
                            </div>

                            <h3 className="text-5xl font-bold text-orange-600 mt-4">
                                ₹{monthlyRevenue}
                            </h3>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-700">
                                    Total Revenue
                                </span>

                                <FiCreditCard
                                    size={30}
                                    className="text-blue-500"
                                />
                            </div>

                            <h3 className="text-5xl font-bold text-blue-600 mt-4">
                                ₹{totalRevenue}
                            </h3>
                        </div>

                    </div>
                </section>

                {/* Restaurant Information */}
                <section className="max-w-7xl mx-auto px-6 mt-14">

                    <h2 className="text-4xl font-bold mb-6">
                        Restaurant Information
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">

                        <div className="bg-white rounded-3xl p-6 shadow">
                            <div className="flex items-center gap-3 text-orange-500 mb-2">
                                <FiMail size={24} />
                                <span>Email Address</span>
                            </div>

                            <p className="font-semibold text-xl">
                                {restaurant?.email}
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow">
                            <div className="flex items-center gap-3 text-orange-500 mb-2">
                                <FiPhone size={24} />
                                <span>Contact Number</span>
                            </div>

                            <p className="font-semibold text-xl">
                                {restaurant?.contactNumber}
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow">
                            <div className="flex items-center gap-3 text-orange-500 mb-2">
                                <FiMapPin size={24} />
                                <span>City</span>
                            </div>

                            <p className="font-semibold text-xl">
                                {restaurant?.city}
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow">
                            <div className="flex items-center gap-3 text-orange-500 mb-2">
                                <FiHome size={24} />
                                <span>Address</span>
                            </div>

                            <p className="font-semibold text-lg">
                                {restaurant?.fullAddress}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Performance */}
                <section className="max-w-7xl mx-auto px-6 mt-14">

                    <h2 className="text-4xl font-bold mb-6">
                        Restaurant Performance
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">

                        <div className="bg-purple-50 rounded-3xl p-6 border border-purple-100">
                            <p>Success Rate</p>

                            <h3 className="text-5xl font-bold text-purple-600 mt-3">
                                {successRate}%
                            </h3>
                        </div>

                        <div className="bg-green-50 rounded-3xl p-6 border border-green-100">
                            <p>Delivered Orders</p>

                            <h3 className="text-5xl font-bold text-green-600 mt-3">
                                {deliveredOrders}
                            </h3>
                        </div>

                        <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
                            <p>Cancelled Orders</p>

                            <h3 className="text-5xl font-bold text-red-600 mt-3">
                                {cancelledOrders}
                            </h3>
                        </div>
                    </div>
                </section>

                {/* Member Since */}
                <section className="max-w-7xl mx-auto px-6 mt-14 pb-14">

                    <h2 className="text-4xl font-bold mb-6">
                        Member Since
                    </h2>

                    <div className="bg-white rounded-3xl p-8 shadow flex justify-between items-center">

                        <div>
                            <p className="text-zinc-500">
                                Joined Date
                            </p>

                            <h3 className="text-3xl font-bold mt-2">
                                {joinedDate}
                            </h3>
                        </div>

                        <FiCalendar
                            size={40}
                            className="text-orange-500"
                        />
                    </div>
                </section>
            </div>

            <RestaurantFooter />
        </>
    );
};

export default RestaurantProfile;