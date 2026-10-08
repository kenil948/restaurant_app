"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
    FiClipboard,
    FiHome,
    FiLogOut,
    FiUser,
} from "react-icons/fi";
import { fetchWithAuth } from "../helper/fetchWithAuth";

type DeliveryPartner = {
    _id: string;
    fullName: string;
    email: string;
    city: string;
};


const DeliveryPartnerHeader = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [data, setData] = useState<DeliveryPartner | null>(null);

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const res = await fetchWithAuth("/api/deliverypartner/me");

                const data = await res.json();

                if (res.ok) {
                    setData(data.data);
                } else {
                     router.replace("/deliverypartner");
                }
            } catch (error) {
                console.log(error);
                 router.replace("/deliverypartner");
            }

        }

        getCurrentUser();
    }, [router]);

    const homeLink = data
        ? "/deliverypartner/dashboard"
        : "/deliverypartner";

    const handleLogout = async () => {
        const res = await fetchWithAuth("/api/deliverypartner/logout", {
            method: "POST",
        });

        if (res.ok) {
            router.replace("/deliverypartner");
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">

                <Link href="/">
                    <Image
                        src="/restaurant-logo.png"
                        alt="Restaurant Logo"
                        width={180}
                        height={60}
                        priority
                    />
                </Link>

                <nav>
                    <ul className="flex items-center gap-6">

                        <li>
                            <Link
                                href={homeLink}
                                className={`flex items-center gap-2 font-medium transition px-4 py-2 rounded-xl
                                ${pathname === "/deliverypartner" ||
                                        pathname === "/deliverypartner/dashboard"
                                        ? "text-orange-500 bg-orange-50"
                                        : "text-zinc-700 hover:text-orange-500"
                                    }`}
                            >
                                <FiHome size={18} />
                                Home
                            </Link>
                        </li>

                        {data ? (
                            <>
                                <li>
                                    <Link
                                        href="/deliverypartner/profile"
                                        className={`flex items-center gap-2 font-medium transition px-4 py-2 rounded-xl
                                        ${pathname ===
                                                "/deliverypartner/profile"
                                                ? "text-orange-500 bg-orange-50"
                                                : "text-zinc-700 hover:text-orange-500"
                                            }`}
                                    >
                                        <FiUser size={18} />
                                        My Profile
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        href="/deliverypartner/orders"
                                        className={`flex items-center gap-2 font-medium transition px-4 py-2 rounded-xl
                                        ${pathname ===
                                                "/deliverypartner/orders"
                                                ? "text-orange-500 bg-orange-50"
                                                : "text-zinc-700 hover:text-orange-500"
                                            }`}
                                    >
                                        <FiClipboard size={18} />
                                        Available Orders
                                    </Link>
                                </li>

                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all shadow-md hover:shadow-lg cursor-pointer"
                                    >
                                        <FiLogOut size={18} />
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li>
                                <button
                                    onClick={() =>
                                        document
                                            .getElementById("delivery-form")
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                            })
                                    }
                                    className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all shadow-md hover:shadow-lg cursor-pointer"
                                >
                                    Join Us
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default DeliveryPartnerHeader;