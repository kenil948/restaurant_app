"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
// import toast from "react-hot-toast";

const UpdateFoodItem = () => {

    const { id } = useParams<{ id: string }>();

    const [foodName, setFoodName] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState(false)
    const router = useRouter();

    const fetchFoodData = async () => {
        const response = await fetch(`/api/restaurant/foods/edit/${id}`);

        const data = await response.json();

        if (response.ok) {
            console.log(data)
            setFoodName(data.data.foodName);
            setPrice(data.data.price);
            setImageUrl(data.data.imageUrl);
            setDescription(data.data.description);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchFoodData();
        }

        fetchData();
    }, []);

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        if (!foodName || !price || !imageUrl || !description) {
            setError(true);
            return;
        } else {
            setError(false)
        }

        const response = await fetch(`/api/restaurant/foods/edit/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                foodName,
                price,
                imageUrl,
                description,
            })
        })
        const data = await response.json();

        if (response.ok) {
            toast.success(data.message || "Food item updated");
            router.push("/restaurant/dashboard");
        } else {
            toast.error(data.message || "Food item not updated");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 py-10 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg border border-zinc-200 p-8">

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-zinc-900">
                        Update Food Item
                    </h2>

                    <p className="text-zinc-500 mt-2">
                        Update details of your menu item.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-zinc-700">
                            Food Name
                        </label>

                        <input
                            type="text"
                            placeholder="Enter food name"
                            value={foodName}
                            onChange={(e) => setFoodName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-white outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        />

                        {error && !foodName && (
                            <p className="text-red-500 text-sm mt-2">
                                Food name is required.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-semibold text-zinc-700">
                            Price
                        </label>

                        <input
                            type="number"
                            placeholder="Enter price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-white outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        />

                        {error && !price && (
                            <p className="text-red-500 text-sm mt-2">
                                Price is required.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-semibold text-zinc-700">
                            Image URL
                        </label>

                        <input
                            type="text"
                            placeholder="Enter image URL"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-white outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        />

                        {error && !imageUrl && (
                            <p className="text-red-500 text-sm mt-2">
                                Image URL is required.
                            </p>
                        )}
                    </div>

                    {imageUrl && (
                        <div>
                            <p className="text-sm font-semibold text-zinc-700 mb-2">
                                Preview
                            </p>

                            <img
                                src={imageUrl}
                                alt="Food Preview"
                                className="w-32 h-32 object-cover rounded-2xl border border-zinc-200"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-zinc-700">
                            Description
                        </label>

                        <textarea
                            rows={4}
                            placeholder="Enter food description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-300 bg-white outline-none resize-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        />

                        {error && !description && (
                            <p className="text-red-500 text-sm mt-2">
                                Description is required.
                            </p>
                        )}
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all cursor-pointer"
                        >
                            Update Food Item
                        </button>

                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 py-3 border border-zinc-300 hover:bg-zinc-100 text-zinc-700 rounded-xl font-semibold transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateFoodItem;