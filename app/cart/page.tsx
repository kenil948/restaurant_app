"use client";

import React, { useMemo, useState } from "react";
import CustomerHeader from "../_components/CustomerHeader";
import RestaurantFooter from "../_components/RestaurantFooter";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "../helper/fetchWithAuth";

type FoodItemType = {
    _id: string;
    foodName: string;
    price: number;
    imageUrl: string;
    description: string;
    restaurantId: string;
};


const Cart = () => {

    const router = useRouter();

    const handleCheckout = async () => {
        const res = await fetchWithAuth("/api/user/me")

        if (res.ok) {
            router.push("/order")
        }
        else {
            router.push("/user-auth?mode=login&redirect=true");
        }
    };

    const removeFromCart = (id: string) => {
        const updatedCart = cartStorage.filter(
            (item) => item._id !== id
        );

        localStorage.setItem("cart", JSON.stringify(updatedCart));

        window.location.reload();
    };

    const [cartStorage] = useState<FoodItemType[]>(
        JSON.parse(localStorage.getItem("cart") || "[]")
    );

    const totalAmount = useMemo(() => {
        return cartStorage.reduce((acc, item) => acc + item.price, 0);
    }, [cartStorage]);

    const deliveryCharge = 40;
    const taxAmount = Math.round(totalAmount * 0.05);

    const grandTotal = totalAmount + taxAmount + deliveryCharge;

    return (
        <div className="min-h-screen bg-zinc-50">
            <CustomerHeader />

            <section className="bg-white border-b border-zinc-200">
                <div className="max-w-7xl mx-auto p-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>
                            <h1 className="text-4xl font-bold text-zinc-900">
                                Shopping Cart
                            </h1>

                            <p className="text-zinc-500 mt-1 text-lg">
                                {cartStorage.length} item{cartStorage.length > 1 ? "s" : ""} in your cart
                            </p>
                        </div>

                        <div className="hidden md:flex items-center gap-3 bg-orange-50 px-5 py-3 rounded-2xl border border-orange-100">
                            <span className="text-2xl">🛒</span>

                            <div>
                                <p className="text-sm text-zinc-500">
                                    Total Amount
                                </p>

                                <p className="text-xl font-bold text-orange-500">
                                    ₹{grandTotal}
                                </p>
                            </div>
                        </div>

                    </div>

                </div>
            </section>

            <section className="py-16">
                <div className="max-w-7xl mx-auto px-6">

                    {cartStorage.length > 0 ? (
                        <div className="grid lg:grid-cols-[1.8fr_0.8fr] gap-8">

                            <div className="space-y-5">

                                {cartStorage.map((item) => (
                                    <div
                                        key={item._id}
                                        className="bg-white rounded-3xl shadow-lg border border-zinc-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
                                    >
                                        <div className="flex flex-col sm:flex-row">

                                            <div className="overflow-hidden">
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.foodName}
                                                    className="w-full md:w-50 h-50 object-cover hover:scale-110 transition duration-500"
                                                />
                                            </div>

                                            <div className="flex-1 p-6">

                                                <div className="flex justify-between items-start gap-4">

                                                    <div>
                                                        <h2 className="text-2xl font-bold text-zinc-900">
                                                            {item.foodName}
                                                        </h2>

                                                        <p className="text-zinc-500 mt-3 leading-7">
                                                            {item.description}
                                                        </p>
                                                    </div>

                                                    <span className="text-3xl font-bold text-orange-500 whitespace-nowrap">
                                                        ₹{item.price}
                                                    </span>

                                                </div>

                                                <div className="mt-6">
                                                    <button
                                                        onClick={() => removeFromCart(item._id)}
                                                        className="mt-auto bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-xl font-medium transition cursor-pointer"
                                                    >
                                                        Remove from Cart
                                                    </button>
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                ))}

                            </div>

                            <div>

                                <div className="sticky top-24 bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden">

                                    <div className="bg-orange-500 px-8 py-6">
                                        <h2 className="text-3xl font-bold text-white">
                                            Order Summary
                                        </h2>
                                    </div>

                                    <div className="pb-8 pt-5 px-8">

                                        <div className="flex justify-between items-center py-4">
                                            <span className="text-zinc-500">
                                                Items
                                            </span>

                                            <span className="font-bold">
                                                {cartStorage.length}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center py-4 ">
                                            <span className="text-zinc-500">
                                                Food Total
                                            </span>

                                            <span className="font-semibold">
                                                ₹{totalAmount}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center py-4">
                                            <span className="text-zinc-500">
                                                Delivery Fee
                                            </span>

                                            <span className="font-semibold">
                                                ₹{deliveryCharge}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center py-4">
                                            <span className="text-zinc-500">
                                                GST (5%)
                                            </span>

                                            <span className="font-semibold">
                                                ₹{taxAmount}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center py-5">

                                            <span className="text-2xl font-bold text-zinc-900">
                                                Grand Total
                                            </span>

                                            <span className="text-3xl font-bold text-orange-500">
                                                ₹{grandTotal}
                                            </span>

                                        </div>

                                        <button
                                            onClick={handleCheckout}
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-semibold text-lg transition cursor-pointer"
                                        >
                                            Proceed To Checkout
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl shadow-xl border border-zinc-100 py-24 text-center">

                            <div className="w-28 h-28 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-6xl">
                                🛒
                            </div>

                            <h2 className="text-4xl font-bold text-zinc-900 mt-8">
                                Your Cart is Empty
                            </h2>

                            <p className="text-zinc-500 mt-4 text-lg">
                                Add delicious dishes from restaurants to get started.
                            </p>

                            <Link
                                href="/"
                                className="inline-block mt-8 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-medium transition-all duration-300"
                            >
                                Browse Restaurants
                            </Link>

                        </div>
                    )}

                </div>
            </section>

            <RestaurantFooter />
        </div>
    );
};

export default Cart;