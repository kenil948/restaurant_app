"use client";

import DeliveryPartnerHeader from "@/app/_components/DeliveryPartnerHeader";
import RestaurantFooter from "@/app/_components/RestaurantFooter";
import { fetchWithAuth } from "@/app/helper/fetchWithAuth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BsCashStack } from "react-icons/bs";
import {
    FiMail,
    FiPhone,
    FiMapPin,
    FiCheckCircle,
    FiTruck,
    FiPackage,
    FiClock,
    FiTrendingUp,
    FiCalendar,
    FiCreditCard,
} from "react-icons/fi";
import { RiWallet3Line } from "react-icons/ri";

type OrderType = {
    orderId: string;
    amount: string;
    status: string;
    createdAt: string;
};

type DeliveryPartner = {
    _id: string;
    fullName: string;
    email: string;
    city: string;
    contactNumber: string;
};

const DeliveryPartnerProfile = () => {
    const [myOrders, setMyOrders] = useState<OrderType[]>([]);
    const [deliveryBoy, setDeliveryBoy] = useState<DeliveryPartner | null>(null);
    const router = useRouter();

    const getMyOrders = async () => {
        try {
            const response = await fetchWithAuth(
                "/api/deliverypartner/orders"
            );

            const data = await response.json();

            if (!response.ok) {
                setMyOrders([]);
                return;
            }

            setMyOrders(data.data);
        } catch (error) {
            console.log(error);
            setMyOrders([]);
        }
    };

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const res = await fetchWithAuth(
                    "/api/deliverypartner/me"
                );

                const data = await res.json();

                if (!res.ok) {
                    router.replace("/deliverypartner");
                    return;
                }

                setDeliveryBoy(data.data);
                getMyOrders();

            } catch (error) {
                console.log(error);
                router.replace("/deliverypartner");
            }
        }

        getCurrentUser();
    }, [router])

    if (!deliveryBoy) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    const deliveredOrders = myOrders.filter(
        (item) => item.status === "Delivered"
    ).length;

    const pendingOrders = myOrders.filter(
        (item) => item.status === "Pending"
    ).length;

    const pickedUpOrders = myOrders.filter(
        (item) => item.status === "Picked Up"
    ).length;

    const DELIVERY_CHARGE = 40;

    const today = new Date();

    const todayDeliveredOrders = myOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);

        return (
            order.status === "Delivered" &&
            orderDate.getDate() === today.getDate() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear()
        );
    }).length;

    const monthlyDeliveredOrders = myOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);

        return (
            order.status === "Delivered" &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear()
        );
    }).length;

    const todayEarnings =
        todayDeliveredOrders * DELIVERY_CHARGE;

    const monthlyEarnings =
        monthlyDeliveredOrders * DELIVERY_CHARGE;

    const totalEarnings =
        deliveredOrders * DELIVERY_CHARGE;

    const successRate =
        myOrders.length > 0
            ? (
                (deliveredOrders / myOrders.length) *
                100
            ).toFixed(0)
            : "0";

    return (
        <>
            <DeliveryPartnerHeader />

            <main className="min-h-screen bg-zinc-50 py-10">
                <div className="max-w-6xl mx-auto px-6">

                    {/* Hero Section */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 text-white">
                        <div className="flex items-center gap-6">

                            <div className="w-24 h-24 rounded-full bg-white text-orange-500
                    flex items-center justify-center
                    text-4xl font-bold shadow-lg">
                                {deliveryBoy?.fullName?.charAt(0)}
                            </div>

                            <div>
                                <h2 className="text-4xl font-bold">
                                    {deliveryBoy?.fullName}
                                </h2>

                                <p className="text-orange-100">
                                    Active Delivery Partner
                                </p>

                                <p className="text-orange-100 flex items-center gap-2 mt-1">
                                    <FiMapPin />
                                    {deliveryBoy?.city}
                                </p>
                            </div>

                        </div>
                    </div>
                    {/* Stats Cards */}
                    <div className="grid md:grid-cols-4 gap-5 mt-8">

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-zinc-500 text-sm">
                                        Total Orders
                                    </p>

                                    <h3 className="text-4xl font-bold text-orange-500 mt-2">
                                        {myOrders.length}
                                    </h3>
                                </div>

                                <FiTruck
                                    size={35}
                                    className="text-orange-500"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-zinc-500 text-sm">
                                        Delivered
                                    </p>

                                    <h3 className="text-4xl font-bold text-green-600 mt-2">
                                        {deliveredOrders}
                                    </h3>
                                </div>

                                <FiCheckCircle
                                    size={35}
                                    className="text-green-600"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-zinc-500 text-sm">
                                        Pending
                                    </p>

                                    <h3 className="text-4xl font-bold text-yellow-600 mt-2">
                                        {pendingOrders}
                                    </h3>
                                </div>

                                <FiClock
                                    size={35}
                                    className="text-yellow-600"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-zinc-500 text-sm">
                                        Picked Up
                                    </p>

                                    <h3 className="text-4xl font-bold text-blue-600 mt-2">
                                        {pickedUpOrders}
                                    </h3>
                                </div>

                                <FiPackage
                                    size={35}
                                    className="text-blue-600"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Personal Information */}
                    <div className="mt-12">

                        <h2 className="text-3xl font-bold text-zinc-900 mb-6">
                            Personal Information
                        </h2>

                        <div className="grid md:grid-cols-2 gap-5">

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <FiMail className="text-orange-500" />
                                    <span className="text-zinc-500">
                                        Email Address
                                    </span>
                                </div>

                                <p className="font-semibold text-lg">
                                    {deliveryBoy?.email}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <FiPhone className="text-orange-500" />
                                    <span className="text-zinc-500">
                                        Contact Number
                                    </span>
                                </div>

                                <p className="font-semibold text-lg">
                                    {deliveryBoy?.contactNumber}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <FiMapPin className="text-orange-500" />
                                    <span className="text-zinc-500">
                                        City
                                    </span>
                                </div>

                                <p className="font-semibold text-lg">
                                    {deliveryBoy?.city}
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <FiCheckCircle className="text-green-500" />
                                    <span className="text-zinc-500">
                                        Account Status
                                    </span>
                                </div>

                                <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                    Active
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* Earnings Summary */}
                    <div className="mt-12">

                        <h2 className="text-3xl font-bold text-zinc-900 mb-6">
                            Earnings Summary
                        </h2>

                        <div className="grid md:grid-cols-4 gap-5">
                            <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                                <p className="text-sm text-zinc-500">
                                    Per Delivery Fee
                                </p>

                                <h3 className="text-4xl font-bold text-green-600 mt-2">
                                    ₹40
                                </h3>
                            </div>

                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-zinc-500">
                                            Today's Earnings
                                        </p>

                                        <h3 className="text-3xl font-bold text-orange-500 mt-2">
                                            ₹{todayEarnings}
                                        </h3>
                                    </div>

                                    <RiWallet3Line
                                        size={35}
                                        className="text-orange-500"
                                    />
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-zinc-500">
                                            This Month Earnings
                                        </p>

                                        <h3 className="text-3xl font-bold text-green-600 mt-2">
                                            ₹{monthlyEarnings}
                                        </h3>
                                    </div>

                                    <BsCashStack
                                        size={35}
                                        className="text-green-600"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-zinc-500">
                                            Total Earnings
                                        </p>

                                        <h3 className="text-3xl font-bold text-blue-600 mt-2">
                                            ₹{totalEarnings}
                                        </h3>
                                    </div>

                                    <FiCreditCard
                                        size={35}
                                        className="text-blue-600"
                                    />
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* Delivery Performance */}
                    <div className="mt-12">

                        <h2 className="text-3xl font-bold text-zinc-900 mb-6">
                            Delivery Performance
                        </h2>

                        <div className="grid md:grid-cols-3 gap-5">

                            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-zinc-500">
                                            Success Rate
                                        </p>

                                        <h3 className="text-3xl font-bold text-purple-600 mt-2">
                                            {successRate}%
                                        </h3>
                                    </div>

                                    <FiTrendingUp
                                        size={35}
                                        className="text-purple-600"
                                    />
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-zinc-500">
                                            Delivered Orders
                                        </p>

                                        <h3 className="text-3xl font-bold text-green-600 mt-2">
                                            {deliveredOrders}
                                        </h3>
                                    </div>

                                    <FiCheckCircle
                                        size={35}
                                        className="text-green-600"
                                    />
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-zinc-500">
                                            Pending Orders
                                        </p>

                                        <h3 className="text-3xl font-bold text-yellow-600 mt-2">
                                            {pendingOrders}
                                        </h3>
                                    </div>

                                    <FiClock
                                        size={35}
                                        className="text-yellow-600"
                                    />
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* Member Since */}
                    <div className="mt-12 mb-5">

                        <h2 className="text-3xl font-bold text-zinc-900 mb-6">
                            Member Since
                        </h2>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">

                            <div className="flex justify-between items-center">

                                <div>
                                    <p className="text-zinc-500">
                                        Joined Date
                                    </p>

                                    <h3 className="text-2xl font-bold text-zinc-900 mt-2">
                                        {deliveryBoy?.createdAt
                                            ? new Date(
                                                deliveryBoy.createdAt
                                            ).toLocaleDateString(
                                                "en-IN",
                                                {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                }
                                            )
                                            : "N/A"}
                                    </h3>
                                </div>

                                <FiCalendar
                                    size={35}
                                    className="text-orange-500"
                                />

                            </div>

                        </div>

                    </div>

                </div>
            </main>

            <RestaurantFooter />
        </>
    );
};

export default DeliveryPartnerProfile;