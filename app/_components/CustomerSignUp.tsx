"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "../helper/fetchWithAuth";

const CustomerSignUp = ({ redirect }: { redirect?: string | null }) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const router = useRouter();

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setPasswordError(true);
            return;
        }

        setPasswordError(false);

        if (
            !fullName.trim() ||
            !email.trim() ||
            !contactNumber.trim() ||
            !password.trim() ||
            !confirmPassword.trim()
        ) {
            setError(true);
            return;
        }

        setError(false);

        try {
            setLoading(true);
            const response = await fetchWithAuth("/api/user", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    fullName,
                    email,
                    contactNumber,
                    password,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Account created successfully!");

                if (redirect === "true") {
                    router.push("/order");
                } else {
                    router.push("/");
                }
            } else {
                toast.error(data.message || "Something went wrong!");
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong!");
        } finally {
            setLoading(false);
        }

    };

    return (
        <section className="max-w-7xl mx-auto px-6 py-16">

            <div className="grid lg:grid-cols-2 gap-16 items-start min-h-[700px]">


                <div className="flex flex-col justify-center">

                    <span className="inline-flex w-fit px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-medium">
                        Welcome to RestaurantHub
                    </span>

                    <h1 className="mt-6 text-6xl font-bold leading-tight text-zinc-900">
                        Order Food
                        <span className="block text-orange-500">
                            Anytime,
                        </span>
                        Anywhere
                    </h1>

                    <p className="mt-6 text-xl text-zinc-600 leading-9 max-w-xl">
                        Create your customer account and discover delicious
                        meals from your favorite restaurants with a simple,
                        fast and seamless ordering experience.
                    </p>

                    <div className="mt-10 h-1 w-32 bg-orange-500 rounded-full" />

                </div>

                {/* RIGHT SIDE */}

                <div className="bg-white rounded-[32px] shadow-2xl border border-zinc-100 p-8 lg:p-10">

                    <div className="text-center">

                        <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-4xl">
                            🍔
                        </div>

                        <h2 className="text-4xl font-bold text-zinc-900 mt-5">
                            Create Account
                        </h2>

                        <p className="text-zinc-500 mt-3">
                            Join RestaurantHub and start ordering today.
                        </p>

                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-8 space-y-5"
                    >

                        <div>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) =>
                                    setFullName(e.target.value)
                                }
                                className="w-full px-5 py-4 rounded-2xl border border-zinc-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none"
                            />

                            {error && !fullName.trim() && (
                                <p className="text-red-500 text-sm mt-2">
                                    Full Name is required
                                </p>
                            )}
                        </div>

                        <div>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                className="w-full px-5 py-4 rounded-2xl border border-zinc-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none"
                            />

                            {error && !email.trim() && (
                                <p className="text-red-500 text-sm mt-2">
                                    Email is required
                                </p>
                            )}
                        </div>

                        <div>
                            <input
                                type="tel"
                                placeholder="Contact Number"
                                value={contactNumber}
                                onChange={(e) =>
                                    setContactNumber(e.target.value)
                                }
                                className="w-full px-5 py-4 rounded-2xl border border-zinc-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none"
                            />

                            {error && !contactNumber.trim() && (
                                <p className="text-red-500 text-sm mt-2">
                                    Contact Number is required
                                </p>
                            )}
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                className="w-full px-5 py-4 rounded-2xl border border-zinc-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none"
                            />

                            {error && !password.trim() && (
                                <p className="text-red-500 text-sm mt-2">
                                    Password is required
                                </p>
                            )}
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                className="w-full px-5 py-4 rounded-2xl border border-zinc-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none"
                            />

                            {error && !confirmPassword.trim() && (
                                <p className="text-red-500 text-sm mt-2">
                                    Confirm Password is required
                                </p>
                            )}

                            {passwordError && (
                                <p className="text-red-500 text-sm mt-2">
                                    Passwords do not match
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={"w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-orange-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"}
                        >
                            {loading ? "Creating..." : "Create Account"}
                        </button>

                    </form>

                    <div className="mt-8 text-center">

                        <span className="text-zinc-500">
                            Already have an account?
                        </span>

                        <Link
                            href={`/user-auth?mode=login${redirect === "true" ? "&order=true" : ""}`}
                            className="ml-2 font-semibold text-orange-500 hover:text-orange-600"
                        >
                            Login
                        </Link>

                    </div>

                </div>

            </div>

        </section>
    );
};

export default CustomerSignUp;