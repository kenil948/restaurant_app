"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

type Props = {
    setIslogin: React.Dispatch<React.SetStateAction<boolean>>;
};

const DeliveryPartnerLogin = ({ setIslogin }: Props) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setError(true);
            return;
        }

        setError(false);

        try {
            setLoading(true);
            const response = await fetch("/api/deliverypartner/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Welcome back! Login successful.");
                setEmail("");
                setPassword("");
                router.replace("/deliverypartner/dashboard");
            } else {
                toast.error(data.message || "Invalid email or password");
                setPassword("");
            }

        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }


    };

    return (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl px-8 py-6">

            <div className="text-center mb-8">

                <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-4xl">
                    🛵
                </div>

                <h1 className="text-3xl font-bold text-zinc-900 mt-5">
                    Welcome Back
                </h1>

                <p className="mt-2 text-zinc-500">
                    Login to your delivery partner account.
                </p>

            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >

                <div>
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />

                    {error && !email.trim() && (
                        <span className="text-red-500 text-sm">
                            Please enter your email address
                        </span>
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
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />

                    {error && !password.trim() && (
                        <span className="text-red-500 text-sm">
                            Please enter your password
                        </span>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition cursor-pointer ${loading
                        ? "bg-orange-300 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
                        }`}
                >
                    {loading ? "Logging in..." : "Login as Delivery Partner"}
                </button>

            </form>

            <div className="mt-6 text-center text-sm">

                <span className="text-zinc-500">
                    Not registered yet?
                </span>

                <button
                    onClick={() => setIslogin(false)}
                    className="ml-2 font-semibold text-orange-500 hover:text-orange-600 cursor-pointer"
                >
                    Register Now
                </button>

            </div>

        </div>
    );
};

export default DeliveryPartnerLogin;