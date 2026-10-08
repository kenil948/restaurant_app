"use client";

import React, { useEffect, useMemo, useState } from "react";
import CustomerHeader from "../_components/CustomerHeader";
import RestaurantFooter from "../_components/RestaurantFooter";
import toast from "react-hot-toast";
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

const CheckoutPage = () => {

    const [user, setUser] = useState<any>(null);
    const [cartStorage, setCartStorage] = useState<FoodItemType[]>([]);

    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [landmark, setLandmark] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const res = await fetchWithAuth("/api/user/me");

                if (!res.ok) {
                    router.push("/user-auth?mode=login&redirect=true");
                    return;
                }

                const data = await res.json();

                setUser(data.data);
                setCity(data.data.city || "");
                setAddress(data.data.address || "");
                setLandmark(data.data.landmark || "");

                const storedCart = localStorage.getItem("cart");

                if (storedCart) {
                    setCartStorage(JSON.parse(storedCart));
                }
            } catch (error) {
                console.log(error);
                router.push("/user-auth?mode=login&redirect=true");
            }
        };

        getCurrentUser();
    }, [router]);

    const foodTotal = useMemo(() => {
        return cartStorage.reduce(
            (acc, item) => acc + item.price,
            0
        );
    }, [cartStorage]);

    const deliveryFee = 40;
    const tax = Math.round(foodTotal * 0.05);
    const totalAmount = foodTotal + deliveryFee + tax;

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }


    const handlePlaceOrder = async () => {

        if (loading) {
            return;
        }
        setLoading(true);
        if (!city || !address) {
            toast.error("Please enter delivery details.");
            return;
        }

        try {
            if (
                user.city !== city ||
                user.address !== address ||
                user.landmark !== landmark
            ) {
                const response = await fetchWithAuth("/api/user/address", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        city,
                        address,
                        landmark,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    toast.error(data.message || "Failed to update address");
                    return;
                }

                setUser((prev: any) => ({
                    ...prev,
                    city,
                    address,
                    landmark,
                }));
            }

            if (cartStorage.length === 0) {
                toast.error("Cart is empty");
                return;
            }
            const foodItemsIds = cartStorage.map(item => item._id);
            const deliveryBoyResponse = await fetch(`/api/deliverypartner/${city}`);
            const deliveryBoyIds = await deliveryBoyResponse.json();
            const deliveryBoy_Id = deliveryBoyIds.data.map((item: any) => item._id);
            const deliveryBoyId = deliveryBoy_Id[Math.floor(Math.random() * deliveryBoy_Id.length)];
            if (!deliveryBoyId) {
                toast.error("Delivery is currently unavailable in your area.");
                return;
            }

            const orderData = {
                foodItemsIds,
                restoId: cartStorage[0].restaurantId,
                deliveryBoyId,
                status: "Pending",
                amount: totalAmount.toString(),
                city,
                address,
                landmark,
            };
            const response = await fetchWithAuth("/api/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || "Failed to place order");
                return;
            }

            localStorage.removeItem("cart");
            toast.success("Order placed successfully!");
            router.push("/myprofile");

        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-zinc-50">

            <CustomerHeader />

            <section className="bg-white border-b border-zinc-200">

                <div className="max-w-7xl mx-auto px-6 py-10">

                    <h1 className="text-4xl font-bold text-zinc-900">
                        Checkout
                    </h1>

                    <p className="text-zinc-500 mt-2">
                        Complete your order details
                    </p>

                </div>

            </section>


            <section className="py-12">

                <div className="max-w-7xl mx-auto px-6">

                    <div className="grid lg:grid-cols-[1.7fr_1fr] gap-8">

                        <div className="space-y-6">

                            <div className="bg-white rounded-3xl shadow-lg border border-zinc-100 p-8">

                                <h2 className="text-3xl font-bold text-zinc-900 mb-6">
                                    Customer Details
                                </h2>

                                <div className="grid md:grid-cols-2 gap-5">

                                    <input
                                        value={user.fullName || ""}
                                        readOnly
                                        placeholder="Full Name"
                                        className="w-full px-5 py-4 rounded-2xl bg-zinc-100 border border-zinc-200 cursor-not-allowed"
                                    />

                                    <input
                                        value={user.email || ""}
                                        readOnly
                                        placeholder="Email"
                                        className="w-full px-5 py-4 rounded-2xl bg-zinc-100 border border-zinc-200 cursor-not-allowed"
                                    />

                                </div>

                                <div className="mt-5">

                                    <input
                                        value={user.contactNumber || ""}
                                        readOnly
                                        placeholder="Phone Number"
                                        className="w-full px-5 py-4 rounded-2xl bg-zinc-100 border border-zinc-200 cursor-not-allowed"
                                    />

                                </div>

                            </div>

                            <div className="bg-white rounded-3xl shadow-lg border border-zinc-100 p-8">

                                <h2 className="text-3xl font-bold text-zinc-900 mb-6">
                                    Delivery Address
                                </h2>

                                <div className="space-y-5">

                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={city}
                                        onChange={(e) =>
                                            setCity(
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-5 py-4 rounded-2xl border border-zinc-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none"
                                    />

                                    <textarea
                                        rows={4}
                                        placeholder="Full Address"
                                        value={address}
                                        onChange={(e) =>
                                            setAddress(
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-5 py-4 rounded-2xl border border-zinc-300 resize-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none"
                                    />

                                    <input
                                        type="text"
                                        placeholder="Landmark (Optional)"
                                        value={landmark}
                                        onChange={(e) =>
                                            setLandmark(
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-5 py-4 rounded-2xl border border-zinc-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none"
                                    />

                                </div>

                            </div>

                            <div className="bg-white rounded-3xl shadow-lg border border-zinc-100 p-8">
                                <h2 className="text-3xl font-bold text-zinc-900 mb-6">
                                    Payment Method
                                </h2>

                                <div className="p-5 border border-zinc-200 rounded-2xl bg-green-50">
                                    <p className="font-semibold text-zinc-900">
                                        Cash On Delivery
                                    </p>

                                    <p className="text-sm text-zinc-500 mt-1">
                                        You will pay when your order is delivered.
                                    </p>
                                </div>
                            </div>

                        </div>

                        <div>

                            <div className="sticky top-28 bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden">

                                <div className="bg-orange-500 px-8 py-6">

                                    <h2 className="text-3xl font-bold text-white">
                                        Order Summary
                                    </h2>

                                </div>

                                <div className="p-8">

                                    <div className="space-y-4">

                                        {cartStorage.map((item) => (
                                            <div
                                                key={item._id}
                                                className="flex justify-between gap-4"
                                            >
                                                <span className="text-zinc-600">
                                                    {item.foodName}
                                                </span>

                                                <span className="font-semibold whitespace-nowrap">
                                                    ₹{item.price}
                                                </span>
                                            </div>
                                        ))}

                                    </div>

                                    <div className="border-t mt-6 pt-6 space-y-4">

                                        <div className="flex justify-between">

                                            <span className="text-zinc-500">
                                                Food Total
                                            </span>

                                            <span>
                                                ₹{foodTotal}
                                            </span>

                                        </div>

                                        <div className="flex justify-between">

                                            <span className="text-zinc-500">
                                                Delivery Fee
                                            </span>

                                            <span>
                                                ₹{deliveryFee}
                                            </span>

                                        </div>

                                        <div className="flex justify-between">

                                            <span className="text-zinc-500">
                                                GST (5%)
                                            </span>

                                            <span>
                                                ₹{tax}
                                            </span>

                                        </div>

                                    </div>

                                    <div className="border-t mt-6 pt-6 flex justify-between items-center">

                                        <span className="text-2xl font-bold">
                                            Total
                                        </span>

                                        <span className="text-4xl font-bold text-orange-500">
                                            ₹{totalAmount}
                                        </span>

                                    </div>

                                    <button
                                        disabled={loading}
                                        onClick={
                                            handlePlaceOrder
                                        }
                                        className={`w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-300 cursor-pointer
                                            ${loading
                                                ? "bg-orange-300 cursor-not-allowed"
                                                : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
                                            }`}
                                    >
                                        {loading ? "Placing Order..." : "Place Order"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            <RestaurantFooter />

        </div>
    );
};

export default CheckoutPage;