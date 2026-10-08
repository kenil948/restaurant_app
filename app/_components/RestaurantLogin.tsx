"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface RestaurantLogintypes {
  islogin: boolean;
  setislogin: (value: boolean) => void;
}

const RestaurantLogin = ({
  data,
}: {
  data: RestaurantLogintypes;
}) => {
  const { setislogin } = data;

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

    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/restaurant/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Welcome back! Login successful.");
        router.replace("/restaurant/dashboard");
      } else {
        toast.error(
          data.message || "Invalid email or password."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "Unable to login right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">
          Welcome Back
        </h1>

        <p className="mt-2 text-zinc-500">
          Login to your restaurant account.
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
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
          {error && !email.trim() && <span className="text-red-500 text-sm">Please enter your email address</span>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
          {error && !password.trim() && <span className="text-red-500 text-sm">Please enter your password</span>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold transition
    ${loading
              ? "bg-orange-300 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
            }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-zinc-500">
          Don't have an account?
        </span>

        <button
          type="button"
          onClick={() => setislogin(false)}
          className="ml-2 font-semibold text-orange-500 hover:text-orange-600 cursor-pointer"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default RestaurantLogin;