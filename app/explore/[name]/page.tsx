"use client";

import CustomerHeader from "@/app/_components/CustomerHeader";
import RestaurantFooter from "@/app/_components/RestaurantFooter";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type RestaurantType = {
    _id: string;
    restaurantName: string;
    city: string;
    fullAddress: string;
    contactNumber: string;
    email: string;
};

type FoodItemType = {
    _id: string;
    foodName: string;
    price: number;
    imageUrl: string;
    description: string;
    restaurantId: string;
};

const RestaurantDetails = () => {
    const [restaurant, setRestaurant] = useState<RestaurantType | null>(null);
    const [foodItems, setFoodItems] = useState<FoodItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartData, setCartData] = useState<FoodItemType>();
    const [cartStorage, setCartStorage] = useState(JSON.parse(localStorage.getItem("cart") || "[]"));
    const [cartIds, setCartIds] = useState<string[]>(cartStorage ? cartStorage.map((item: FoodItemType) => item._id) : []);
    const [removeCartData, setRemoveCartData] = useState<string>();

    const searchParams = useSearchParams();

    const handleRestaurantDetail = async () => {
        try {
            const id = searchParams.get("id");

            const response = await fetch(`/api/customer/${id}`);
            const data = await response.json();

            if (response.ok) {
                setRestaurant(data.data.restaurant);
                setFoodItems(data.data.foodItems);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (item: FoodItemType) => {
        setCartData(item);
        const localCartIds = cartIds;
        localCartIds.push(item._id);
        setCartIds(localCartIds);
        setRemoveCartData()
    };

    const handleRemoveFromCart = (id: string) => {
        setRemoveCartData(id);
        setCartData()
        const localCartIds = cartIds.filter((item) => item != id);
        setCartIds(localCartIds);
    }

    useEffect(() => {
        const fetchData = async () => {
            await handleRestaurantDetail();
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div>
                <CustomerHeader />
                <div className="min-h-screen flex items-center justify-center">
                    <h2 className="text-2xl font-semibold">
                        Loading Restaurant...
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div>
            <CustomerHeader cartData={cartData} removeCartData={removeCartData} />

            <section
                className="relative h-[400px] flex items-center justify-center"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 bg-black/70"></div>

                <div className="relative z-10 text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-bold text-white">
                        {restaurant?.restaurantName}
                    </h1>

                    <p className="text-orange-400 text-xl mt-4 font-medium">
                        📍 {restaurant?.city}
                    </p>

                    <p className="text-white/90 mt-4 text-lg">
                        Discover delicious food from this restaurant
                    </p>
                </div>
            </section>

            <section className="-mt-16 relative z-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-white rounded-3xl shadow-xl p-8">

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-4xl font-bold text-zinc-900">
                                    {restaurant?.restaurantName}
                                </h2>

                                <p className="text-orange-500 mt-2 text-lg">
                                    📍 {restaurant?.city}
                                </p>
                            </div>

                            <div className="w-20 h-20 rounded-3xl bg-orange-100 flex items-center justify-center text-4xl">
                                🍽️
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">

                            <div className="bg-zinc-50 rounded-2xl p-6">
                                <h3 className="font-semibold text-zinc-500 mb-3">
                                    Contact Number
                                </h3>

                                <p className="text-lg font-medium text-zinc-800">
                                    {restaurant?.contactNumber}
                                </p>
                            </div>

                            <div className="bg-zinc-50 rounded-2xl p-6">
                                <h3 className="font-semibold text-zinc-500 mb-3">
                                    Email Address
                                </h3>

                                <p className="text-lg font-medium text-zinc-800 break-all">
                                    {restaurant?.email}
                                </p>
                            </div>

                            <div className="bg-zinc-50 rounded-2xl p-6">
                                <h3 className="font-semibold text-zinc-500 mb-3">
                                    Address
                                </h3>

                                <p className="text-zinc-700 leading-7">
                                    {restaurant?.fullAddress}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">

                    <div className="text-center mb-14">
                        <span className="inline-block px-5 py-2 rounded-full bg-orange-100 text-orange-500">
                            Restaurant Menu
                        </span>

                        <h2 className="text-5xl font-bold text-zinc-900 mt-5">
                            Popular Dishes
                        </h2>

                        <p className="text-zinc-500 text-lg mt-3">
                            {foodItems.length} dishes available
                        </p>
                    </div>

                    {foodItems.length > 0 ? (
                        <div className="grid lg:grid-cols-2 gap-8">

                            {foodItems.map((item: FoodItemType) => (
                                <div
                                    key={item._id}
                                    className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row"
                                >
                                    <div className="overflow-hidden">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.foodName}
                                            className="w-full md:w-56 h-56 object-cover hover:scale-110 transition duration-500"
                                        />
                                    </div>

                                    <div className="p-6 flex flex-col flex-1">

                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="text-2xl font-bold text-zinc-900">
                                                {item.foodName}
                                            </h3>

                                            <span className="text-orange-500 font-bold text-xl whitespace-nowrap">
                                                ₹{item.price}
                                            </span>
                                        </div>

                                        <p className="text-zinc-500 mt-4 leading-7 line-clamp-3">
                                            {item.description}
                                        </p>

                                        {
                                            cartIds.includes(item._id) ? (
                                                <button
                                                    onClick={() => handleRemoveFromCart(item._id)}
                                                    className="mt-auto bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition cursor-pointer"
                                                >
                                                    Remove from Cart
                                                </button>
                                            ) : (
                                                <button onClick={() => handleAddToCart(item)} className="mt-auto bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition cursor-pointer">
                                                    Add To Cart
                                                </button>
                                            )
                                        }
                                    </div>
                                </div>
                            ))}

                        </div>
                    ) : (
                        <div className="text-center py-20">

                            <div className="text-7xl mb-4">
                                🍽️
                            </div>

                            <h3 className="text-3xl font-bold text-zinc-900">
                                No Food Items Available
                            </h3>

                            <p className="text-zinc-500 mt-3">
                                This restaurant has not added any dishes yet.
                            </p>

                        </div>
                    )}

                </div>
            </section>

            <RestaurantFooter />
        </div>
    );
};

export default RestaurantDetails;