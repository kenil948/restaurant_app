"use client";

import React, { useState } from "react";
import RestaurantLogin from "../_components/RestaurantLogin";
import RestaurantSignup from "../_components/RestaurantSignUp";
import RestaurantHeader from "../_components/RestaurantHeader";
import RestaurantFooter from "../_components/RestaurantFooter";

const RestaurantPage = () => {
  const [islogin, setislogin] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-red-50">
      <RestaurantHeader />

      <main className="flex-1 flex justify-center items-start pt-12">
        <div className="w-full max-w-6xl px-6 flex items-center justify-between gap-16">

          <div className="w-[35%]">
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-medium">
              Restaurant Portal
            </span>

            <h1 className="mt-4 text-5xl font-bold text-zinc-900 leading-tight">
              Restaurant
              <span className="block text-orange-500">
                Management
              </span>
            </h1>

            <p className="mt-4 text-zinc-600 text-lg">
              Manage orders, customers and your restaurant from one place.
            </p>
          </div>

          {/* Right Form */}
          <div className="w-[65%] flex justify-end">
            {islogin ? (
              <RestaurantLogin
                data={{
                  islogin,
                  setislogin,
                }}
              />
            ) : (
              <RestaurantSignup
                data={{
                  islogin,
                  setislogin,
                }}
              />
            )}
          </div>
        </div>
      </main>

      <RestaurantFooter />
    </div>
  );
};

export default RestaurantPage;