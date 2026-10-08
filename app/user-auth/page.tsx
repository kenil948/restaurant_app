"use client";

import { useSearchParams } from "next/navigation";
import CustomerLogin from "../_components/CustomerLogin";
import CustomerSignUp from "../_components/CustomerSignUp";
import CustomerHeader from "../_components/CustomerHeader";
import RestaurantFooter from "../_components/RestaurantFooter";

const UserAuth = () => {
    const searchParams = useSearchParams();

    const mode = searchParams.get("mode");
    const redirect = searchParams.get("redirect");

    return (
        <>
            <CustomerHeader />

            <main className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
                {mode === "signup" ? (
                    <CustomerSignUp redirect={redirect}/>
                ) : (
                    <CustomerLogin redirect={redirect}/>
                )}
            </main>

            <RestaurantFooter />
        </>
    );
};

export default UserAuth;