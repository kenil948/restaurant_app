"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../helper/fetchWithAuth";

const AddFoodItem = ({ setAddItem }: { setAddItem: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const [foodName, setFoodName] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (
            !foodName.trim() ||
            !price ||
            !imageUrl.trim() ||
            !description.trim()
        ) {
            setError(true);
            return;
        } else {
            setError(false)
        }
        if (Number(price) <= 0) {
            toast.error("Price must be greater than 0");
            return;
        }
        if (loading) return;
        setLoading(true);

        try {
            const response = await fetchWithAuth("/api/restaurant/foods",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        foodName: foodName.trim(),
                        price: Number(price),
                        imageUrl: imageUrl.trim(),
                        description: description.trim(),
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.success("Food item added successfully.");

                setFoodName("");
                setPrice("");
                setImageUrl("");
                setDescription("");

                setAddItem(false);
            } else {
                toast.error(
                    data.message || "Failed to add food item."
                );
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm p-8">
            <h2 className="text-3xl font-bold text-zinc-900">
                Add Food Item
            </h2>

            <p className="text-zinc-500 mt-2 mb-8">
                Add a new food item to your restaurant menu.
            </p>

            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                <div>
                    <label className="block mb-2 font-medium text-zinc-700">
                        Food Name
                    </label>

                    <input
                        type="text"
                        placeholder="Enter food name"
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                    {error && !foodName.trim() && <p className="text-red-500 text-sm mt-1">Food name is required.</p>}
                </div>

                <div>
                    <label className="block mb-2 font-medium text-zinc-700">
                        Price
                    </label>

                    <input
                        type="number"
                        min="1"
                        placeholder="Enter price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                    {error && !price && <p className="text-red-500 text-sm mt-1">Price is required.</p>}
                </div>

                <div>
                    <label className="block mb-2 font-medium text-zinc-700">
                        Image URL
                    </label>

                    <input
                        type="text"
                        placeholder="Enter image url"
                        value={imageUrl}
                        onChange={(e) =>
                            setImageUrl(e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                    {error && !imageUrl.trim() && <p className="text-red-500 text-sm mt-1">Image URL is required.</p>}
                </div>

                <div>
                    <label className="block mb-2 font-medium text-zinc-700">
                        Description
                    </label>

                    <textarea
                        rows={4}
                        placeholder="Enter food description"
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none resize-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                    {error && !description.trim() && <p className="text-red-500 text-sm mt-1">Description is required.</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-semibold transition-all
    ${loading
                            ? "bg-orange-300 cursor-not-allowed text-white"
                            : "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                        }`}
                >
                    {loading ? "Adding Food..." : "Add Food Item"}
                </button>
            </form>
        </div>
    );
};

export default AddFoodItem;