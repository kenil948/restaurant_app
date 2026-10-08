"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiHome, FiLogOut, FiUser } from "react-icons/fi";
import { fetchWithAuth } from "../helper/fetchWithAuth";

const RestaurantHeader = () => {
    const [details, setDetails] = useState<any>(null);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const res = await fetchWithAuth("/api/restaurant/me");

                const data = await res.json();

                if (res.ok) {
                    setDetails(data.data);
                }
            } catch (error) {
                console.log(error);
            }
        }

        getCurrentUser();
    }, []);

    const handleLogout = async () => {
        try {
            const res = await fetchWithAuth("/api/restaurant/logout", {
                method: "POST",
                credentials: "include",

            })
            if (res.ok) {
                router.push("/restaurant");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const scrollToForm = () => {
        document
            .getElementById("restaurant-form")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">

                {/* Logo */}
                <Link href="/">
                    <Image
                        src="/restaurant-logo.png"
                        alt="Restaurant Logo"
                        width={180}
                        height={60}
                        priority
                    />
                </Link>

                {/* Navbar */}
                <nav>
                    <ul className="flex items-center gap-5">

                        {/* Home */}
                        <li>
                            <Link
                                href={details ? "/restaurant/dashboard" : "/restaurant"}
                                className={`flex items-center gap-2 font-medium transition px-4 py-2 rounded-xl
                                ${pathname === "/restaurant" ||
                                        pathname === "/restaurant/dashboard"
                                        ? "text-orange-500 bg-orange-50"
                                        : "text-zinc-700 hover:text-orange-500"
                                    }`}
                            >
                                <FiHome size={18} />
                                Home
                            </Link>
                        </li>

                        {details ? (
                            <>
                                {/* Profile */}
                                <li>
                                    <Link
                                        href="/restaurant/profile"
                                        className={`flex items-center gap-2 font-medium transition px-4 py-2 rounded-xl
                                        ${pathname === "/restaurant/profile"
                                                ? "text-orange-500 bg-orange-50"
                                                : "text-zinc-700 hover:text-orange-500"
                                            }`}
                                    >
                                        <FiUser size={18} />
                                        Profile
                                    </Link>
                                </li>

                                {/* Logout */}
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
                                    onClick={scrollToForm}
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

export default RestaurantHeader;