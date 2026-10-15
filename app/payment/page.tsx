
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../helper/fetchWithAuth";

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => {
            open: () => void;
            on: (
                event: string,
                callback: (response: {
                    error?: {
                        description?: string;
                    };
                }) => void
            ) => void;
        };
    }
}

type RazorpayOptions = {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    theme: {
        color: string;
    };
    handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }) => void;
    modal?: {
        ondismiss?: () => void;
    };
};

type PendingOrder = {
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
    fullName: string;
    email: string;
    contactNumber: string;
};

export default function PaymentPage() {
    const router = useRouter();

    const [pendingOrder, setPendingOrder] =
        useState<PendingOrder | null>(null);

    const [loading, setLoading] = useState(false);
    const [scriptReady, setScriptReady] = useState(false);

    useEffect(() => {
        const savedOrder = localStorage.getItem("pendingOrder");

        if (!savedOrder) {
            toast.error("Payment details not found. Please checkout again.");
            router.replace("/checkout");
            return;
        }

        try {
            const parsed: PendingOrder = JSON.parse(savedOrder);

            if (
                !parsed.orderId ||
                !parsed.razorpayOrderId ||
                !parsed.keyId ||
                !Number.isFinite(parsed.amount) ||
                parsed.amount <= 0
            ) {
                throw new Error("Invalid pending order");
            }

            setPendingOrder(parsed);
        } catch {
            toast.error("Invalid payment details. Please checkout again.");
            router.replace("/checkout");
        }
    }, [router]);

    const handlePayment = async () => {
        if (loading) return;

        if (!pendingOrder) {
            toast.error("Payment details not found. Please checkout again.");
            return;
        }

        if (!scriptReady || !window.Razorpay) {
            toast.error("Payment gateway is still loading. Please try again.");
            return;
        }

        setLoading(true);

        try {
            const options: RazorpayOptions = {
                key: pendingOrder.keyId,
                amount: pendingOrder.amount,
                currency: pendingOrder.currency || "INR",
                name: "RestaurantHub",
                description: "Food order payment",
                order_id: pendingOrder.razorpayOrderId,
                prefill: {
                    name: pendingOrder.fullName || "",
                    email: pendingOrder.email || "",
                    contact: pendingOrder.contactNumber || "",
                },
                theme: {
                    color: "#f97316",
                },

                handler: async (paymentResponse) => {
                    try {
                        const response = await fetchWithAuth(
                            "/api/payment/razorpay/verify",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    orderId: pendingOrder.orderId,
                                    razorpay_order_id:
                                        paymentResponse.razorpay_order_id,
                                    razorpay_payment_id:
                                        paymentResponse.razorpay_payment_id,
                                    razorpay_signature:
                                        paymentResponse.razorpay_signature,
                                }),
                            }
                        );

                        const result = await response.json();

                        if (!response.ok || result.status === false) {
                            toast.error(
                                result.message ||
                                "Payment verification failed. Please contact support if money was deducted."
                            );
                            return;
                        }

                        localStorage.removeItem("cart");
                        localStorage.removeItem("pendingOrder");

                        toast.success("Payment successful!");

                        router.replace(
                            `/payment/success/${pendingOrder.orderId}`
                        );
                    } catch (error) {
                        console.error("Payment verification error:", error);
                        toast.error(
                            "Could not verify payment. Please check your order before trying again."
                        );
                    } finally {
                        setLoading(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", (response) => {
                setLoading(false);
                toast.error(
                    response.error?.description || "Payment failed. Please try again."
                );
            });

            razorpay.open();
        } catch (error) {
            console.error("Unable to open Razorpay:", error);
            setLoading(false);
            toast.error("Unable to open the payment gateway.");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-100 flex items-center justify-center px-4 py-10">
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
                onReady={() => setScriptReady(true)}
                onError={() => {
                    setScriptReady(false);
                    toast.error("Could not load the payment gateway.");
                }}
            />

            <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg border border-zinc-200 p-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900">
                    Secure Payment
                </h1>

                <p className="text-zinc-500 mt-2">
                    Complete your payment securely with Razorpay.
                </p>

                <div className="mt-8 p-5 rounded-2xl border border-orange-200 bg-orange-50">
                    <p className="text-zinc-500 text-sm">Amount To Pay</p>

                    <h2 className="text-4xl font-bold text-orange-500 mt-1">
                        ₹
                        {pendingOrder
                            ? (pendingOrder.amount / 100).toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )
                            : "—"}
                    </h2>
                </div>

                <div className="mt-6 rounded-2xl bg-zinc-50 border border-zinc-200 p-5">
                    <p className="font-semibold text-zinc-900">
                        Pay using Razorpay
                    </p>
                    <p className="text-sm text-zinc-500 mt-2">
                        Choose an available payment method in the secure Razorpay
                        popup, such as UPI, cards or net banking.
                    </p>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={loading || !pendingOrder || !scriptReady}
                    className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-semibold text-lg transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
                >
                    {loading
                        ? "Processing..."
                        : !scriptReady
                            ? "Loading Payment Gateway..."
                            : `Pay ₹${pendingOrder
                                ? (pendingOrder.amount / 100).toFixed(2)
                                : "—"
                            }`}
                </button>

                <button
                    type="button"
                    onClick={() => router.push("/order")}
                    disabled={loading}
                    className="w-full mt-3 border border-zinc-200 text-zinc-700 py-3 rounded-2xl font-medium hover:bg-zinc-50 transition disabled:opacity-60"
                >
                    Back to Checkout
                </button>

                <p className="text-center text-zinc-400 text-sm mt-5">
                    Secure payment · Razorpay Test Mode
                </p>
            </div>
        </div>
    );
}
