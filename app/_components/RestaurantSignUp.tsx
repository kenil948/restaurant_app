"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../helper/fetchWithAuth";

interface RestaurantSignuptypes {
  islogin: boolean;
  setislogin: (value: boolean) => void;
}

const RestaurantSignup = ({
  data,
}: {
  data: RestaurantSignuptypes;
}) => {
  const { setislogin } = data;
  const router = useRouter();

  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [c_Password, setC_Password] = useState("");
  const [error, setError] = useState(false)
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== c_Password) {
      setPasswordError(true);
      return;
    } else {
      setPasswordError(false)
    }

    if (
      !restaurantName.trim() ||
      !email.trim() ||
      !city.trim() ||
      !fullAddress.trim() ||
      !contactNumber.trim() ||
      !password.trim() ||
      !c_Password.trim()
    ) {
      setError(true);
      return;
    }
    else {
      setError(false)
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await fetchWithAuth("/api/restaurant/signup", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          restaurantName,
          email,
          city,
          fullAddress,
          contactNumber,
          password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Restaurant registered successfully!");

        router.replace("/restaurant/dashboard");
      } else {
        toast.error(
          data.message || "Registration failed"
        );

      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="restaurant-form" className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 mb-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">
          Create Restaurant Account
        </h1>

        <p className="mt-2 text-zinc-500">
          Start managing your restaurant today.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Restaurant Name"
              value={restaurantName}
              onChange={(e) =>
                setRestaurantName(e.target.value)
              }

              className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
            {error && !restaurantName.trim() && <p className="text-red-500 text-sm mt-2">Restaurant Name is required</p>}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />

            {error && !email.trim() && (
              <p className="text-red-500 text-sm mt-2">
                Email is required
              </p>
            )}
          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />

            {error && !city.trim() && (
              <p className="text-red-500 text-sm mt-2">
                City is required
              </p>
            )}
          </div>

          <div>
            <input
              type="tel"
              placeholder="Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />

            {error && !contactNumber.trim() && (
              <p className="text-red-500 text-sm mt-2">
                Contact Number is required
              </p>
            )}
          </div>
        </div>

        <div>
          <textarea
            rows={3}
            placeholder="Full Address"
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none resize-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />

          {error && !fullAddress.trim() && (
            <p className="text-red-500 text-sm mt-2">
              Full Address is required
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
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
              value={c_Password}
              onChange={(e) => setC_Password(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-300 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />

            {error && !c_Password.trim() && (
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className={"w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-orange-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-zinc-500">
          Already have an account?
        </span>

        <button
          type="button"
          onClick={() => setislogin(true)}
          className="ml-2 font-semibold text-orange-500 hover:text-orange-600 cursor-pointer"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default RestaurantSignup;