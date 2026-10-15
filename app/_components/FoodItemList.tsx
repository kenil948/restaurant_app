"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { fetchWithAuth } from "../helper/fetchWithAuth";

type FoodItemsTypes = {
    _id: string;
    foodName: string;
    price: number;
    imageUrl: string;
    description: string;
    restaurantId: string;
};

const FoodItemList = () => {

    const [foodItems, setFoodItems] = useState<FoodItemsTypes[]>([]);
    const [deletingFoodId, setDeletingFoodId] = useState<string | null>(null);
    const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
    const router = useRouter();

    const getFoodItems = async () => {

        const response = await fetchWithAuth(
            "/api/restaurant/foods"
        );

        const data = await response.json();

        if (response.ok) {
            setFoodItems(data.data);
        } else {
            toast.error(data.message || "Food items not fetched");
        }
    };

    const deleteFoodItem = async (id: string) => {
        try {
            const response = await fetchWithAuth(
                `/api/restaurant/foods/${id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || "Food item not deleted");
                return;
            }

            toast.success(data.message || "Food item deleted");
            await getFoodItems();
        } catch (error) {
            console.error("Delete food item error:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    useEffect(() => {
        const fetchFoodItems = async () => {
            await getFoodItems();
        }

        fetchFoodItems();
    }, []);

    return (
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-zinc-200 p-8">
            <h2 className="text-4xl font-bold text-zinc-900 mb-8">
                Food Items
            </h2>

            {foodItems.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-zinc-200">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-orange-500 text-white">
                                <th className="px-6 py-5 text-left">Sr. No</th>

                                <th className="px-6 py-5 text-left">Name</th>

                                <th className="px-6 py-5 text-left">Price</th>

                                <th className="px-6 py-5 text-center">Image</th>

                                <th className="px-6 py-5 text-left">
                                    Description
                                </th>

                                <th className="px-6 py-5 text-center">
                                    Operations
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {foodItems.map((item, index) => (
                                <tr
                                    key={item._id}
                                    className="border-b border-zinc-200 hover:bg-orange-50 transition-all"
                                >
                                    <td className="px-6 py-5">{index + 1}</td>

                                    <td className="px-6 py-5 font-medium">
                                        {item.foodName}
                                    </td>

                                    <td className="px-6 py-5 font-semibold text-orange-600">
                                        ₹{item.price}
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.foodName}
                                                className="w-25 h-18 rounded-xl object-cover border border-zinc-200"
                                            />
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 text-zinc-600 max-w-sm">
                                        {item.description}
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                type="button"
                                                disabled={editingFoodId !== null || deletingFoodId !== null}
                                                onClick={() => {
                                                    if (editingFoodId || deletingFoodId) return;

                                                    setEditingFoodId(item._id);
                                                    router.push(`/restaurant/dashboard/${item._id}`);
                                                }}
                                                className="w-24 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
                                            >
                                                {editingFoodId === item._id ? (
                                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                                ) : (
                                                    <>
                                                        <FiEdit />
                                                        Edit
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={deletingFoodId !== null || editingFoodId !== null}
                                                onClick={async () => {
                                                    if (deletingFoodId || editingFoodId) return;

                                                    if (confirm("Are you sure you want to delete this food item?")) {
                                                        setDeletingFoodId(item._id);

                                                        try {
                                                            await deleteFoodItem(item._id);
                                                        } finally {
                                                            setDeletingFoodId(null);
                                                        }
                                                    }
                                                }}
                                                className="w-24 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-red-500"
                                            >
                                                {deletingFoodId === item._id ? (
                                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                                ) : (
                                                    <>
                                                        <FiTrash2 />
                                                        Delete
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-zinc-600 text-lg">
                    No food items found.
                </p>
            )}
        </div>
    );
};

export default FoodItemList;