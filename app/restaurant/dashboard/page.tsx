"use client";

import AddFoodItem from "@/app/_components/AddFoodItem";
import FoodItemList from "@/app/_components/FoodItemList";
import RestaurantHeader from "@/app/_components/RestaurantHeader";
import { useState } from "react";

const Dashboard = () => {
    const [addItem, setAddItem] = useState(false);

    return (
        <div className="min-h-screen bg-zinc-50">
            <RestaurantHeader />

            <div className="max-w-6xl mx-auto p-6">
                <div className="flex gap-3 mb-8">
                    <button
                        onClick={() => setAddItem(false)}
                        className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 cursor-pointer ${!addItem
                                ? "bg-orange-500 text-white border border-orange-500 shadow-md"
                                : "bg-white text-zinc-700 border border-zinc-300 hover:border-orange-500"
                            }`}
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={() => setAddItem(true)}
                        className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 cursor-pointer ${addItem
                                ? "bg-orange-500 text-white border border-orange-500 shadow-md"
                                : "bg-white text-zinc-700 border border-zinc-300 hover:border-orange-500"
                            }`}
                    >
                        Add Food Item
                    </button>
                </div>

                <div className="transition-all duration-300 ease-in-out">
                    {addItem ? (
                        <AddFoodItem setAddItem={setAddItem}/>
                    ) : (
                        <FoodItemList />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;