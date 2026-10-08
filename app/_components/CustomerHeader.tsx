"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FiHome, FiUser, FiShoppingCart, FiTruck, FiChevronDown, FiLogOut,
    FiLayers,
    FiPackage,
    FiUserPlus
} from "react-icons/fi";
import { fetchWithAuth } from "../helper/fetchWithAuth";

type FoodItem = {
    _id: string;
    foodName: string;
    price: number;
    imageUrl: string;
    description: string;
    restaurantId: string;
};

type CartItemProps = {
    cartData?: FoodItem | null;
    removeCartData?: string;
};

type User = {
    fullName: string;
    email: string;
    contactNumber: string;
    password: string;
};

const CustomerHeader = ({ cartData, removeCartData }: CartItemProps) => {

    const [user, setUser] = useState<User | null>(null);
    const [cartCount, setCartCount] = useState(0);
    const [cartItems, setCartItems] = useState<FoodItem[]>([]);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode");

    useEffect(() => {
        const cart = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

        setCartItems(cart);
        setCartCount(cart.length);
    }, []);

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const res = await fetchWithAuth("/api/user/me");

                const data = await res.json();

                if (res.ok) {
                    setUser(data.data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.log(error);
            }
        }

        getCurrentUser()
    }, [])


    useEffect(() => {
        if (cartData) {
            if (cartCount) {
                if (cartItems[0].restaurantId !== cartData.restaurantId) {
                    localStorage.removeItem("cart");
                    setCartCount(1);
                    setCartItems([cartData]);
                    localStorage.setItem("cart", JSON.stringify([cartData]));
                } else {
                    const localCartItem = cartItems;
                    localCartItem.push(JSON.parse(JSON.stringify(cartData)));
                    setCartItems(localCartItem);
                    setCartCount(localCartItem.length);
                    localStorage.setItem("cart", JSON.stringify(localCartItem));
                }
            } else {
                setCartCount(1);
                setCartItems([cartData]);
                localStorage.setItem("cart", JSON.stringify([cartData]));
            }
        }
    }, [cartData])

    useEffect(() => {
        if (removeCartData) {
            const localCartItem = cartItems.filter((item: FoodItem) => item._id !== removeCartData);
            setCartItems(localCartItem);
            setCartCount(localCartItem.length);
            localStorage.setItem("cart", JSON.stringify(localCartItem));
            if (localCartItem.length === 0) {
                localStorage.removeItem("cart");
            }
        }
    }, [removeCartData])

    const handleLogout = async () => {
        const response = await fetchWithAuth("/api/user/logout", {
            method: "POST",
        });

        if (response.ok) {
            router.push("/");
            setUser(null);
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
                                href="/"
                                className={`flex items-center gap-2 font-medium transition px-2 py-2 rounded-lg
    ${pathname === "/"
                                        ? "text-orange-500 bg-orange-50"
                                        : "text-zinc-700 hover:text-orange-500"
                                    }`}
                            >
                                <FiHome size={18} />
                                Home
                            </Link>
                        </li>

                        {user ? (
                            <>
                                <li>
                                    <Link
                                        href="/myprofile"
                                        className={`flex items-center gap-2 font-medium transition px-2 py-2 rounded-lg
    ${pathname === "/myprofile"
                                                ? "text-orange-500 bg-orange-50"
                                                : "text-zinc-700 hover:text-orange-500"
                                            }`}
                                    >
                                        <FiUser size={18} />
                                        My Profile
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link
                                        href="/user-auth?mode=login"
                                        className={`flex items-center gap-2 font-medium transition px-2 py-2 rounded-lg
        ${mode === "login"
                                                ? "text-orange-500 bg-orange-50"
                                                : "text-zinc-700 hover:text-orange-500"
                                            }`}
                                    >
                                        <FiUser size={18} />
                                        Login
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        href="/user-auth?mode=signup"
                                        className={`flex items-center gap-2 font-medium transition px-2 py-2 rounded-lg
        ${mode === "signup"
                                                ? "text-orange-500 bg-orange-50"
                                                : "text-zinc-700 hover:text-orange-500"
                                            }`}
                                    >
                                        <FiUserPlus size={18} />
                                        Sign Up
                                    </Link>
                                </li>
                            </>
                        )}

                        <li>
                            <Link
                                href={cartCount ? "/cart" : "#"}
                                className={`relative flex items-center justify-center p-2 rounded-lg transition
    ${pathname === "/cart"
                                        ? "text-orange-500 bg-orange-50"
                                        : "text-zinc-700 hover:text-orange-500 hover:bg-orange-50"
                                    }`}
                            >
                                <FiShoppingCart
                                    size={22}
                                    className="text-zinc-700 hover:text-orange-500 transition"
                                />

                                <span className="absolute -top-2 -right-3 w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                                    {cartCount}
                                </span>
                            </Link>
                        </li>

                        <li className="relative group">
                            <button
                                className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-zinc-700 hover:text-orange-500 hover:bg-orange-50 transition-all cursor-pointer"
                            >
                                <FiLayers size={18} />
                                For Business
                                <FiChevronDown
                                    size={16}
                                    className="transition-transform duration-300 group-hover:rotate-180"
                                />
                            </button>

                            <div className="absolute top-14 right-0 w-80 bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden z-50 opacity-0 invisible translate-y-3 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300">

                                <div className="p-4 border-b border-zinc-100">
                                    <h3 className="font-bold text-zinc-900">
                                        Grow With RestaurantHub
                                    </h3>

                                    <p className="text-sm text-zinc-500 mt-1">
                                        Start selling food or earn by delivering orders.
                                    </p>
                                </div>

                                <div className="p-2">

                                    <Link
                                        href="/restaurant"
                                        className="flex items-start gap-4 p-4 rounded-2xl hover:bg-orange-50 transition group/item"
                                    >
                                        <div className="w-14 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
                                            <FiPackage size={22} />
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-zinc-900 group-hover/item:text-orange-500">
                                                Add Restaurant
                                            </h4>

                                            <p className="text-sm text-zinc-500">
                                                Register your restaurant and start receiving orders.
                                            </p>
                                        </div>
                                    </Link>

                                    <Link
                                        href="/deliverypartner"
                                        className="flex items-start gap-4 p-4 rounded-2xl hover:bg-orange-50 transition group/item"
                                    >
                                        <div className="w-14 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                                            <FiTruck size={22} />
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-zinc-900 group-hover/item:text-orange-500">
                                                Become Delivery Partner
                                            </h4>

                                            <p className="text-sm text-zinc-500">
                                                Earn money by delivering food in your city.
                                            </p>
                                        </div>
                                    </Link>

                                </div>
                            </div>
                        </li>
                        {user && (
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
                                >
                                    <FiLogOut size={18} />
                                    Logout
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default CustomerHeader;