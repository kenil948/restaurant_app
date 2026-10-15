"use client";

import { fetchWithAuth } from "@/app/helper/fetchWithAuth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CustomerHeader from "@/app/_components/CustomerHeader";
import RestaurantFooter from "@/app/_components/RestaurantFooter";

type OrderDetailsType = {
    orderId: string;
    amount: number | string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    address: string;
    city: string;
    landmark: string;
    foodItemsIds: string[];
    createdAt: string;
    restaurant: {
        restaurantName: string;
        city: string;
    } | null;
};

const ORDER_STEPS = [
    {
        title: "Order Placed",
        description: "Your order has been received.",
    },
    {
        title: "Picked Up",
        description: "Your delivery partner has picked up the order.",
    },
    {
        title: "Delivered",
        description: "Your order has been delivered successfully.",
    },
];

export default function OrderDetailsPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const router = useRouter();

    const [order, setOrder] = useState<OrderDetailsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const getOrderDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetchWithAuth(
                    `/api/order/${orderId}`
                );

                const result = await response.json();

                if (!response.ok || !result.status) {
                    if (response.status === 401) {
                        router.push("/user-auth?mode=login");
                        return;
                    }

                    throw new Error(
                        result.message || "Unable to load order details."
                    );
                }

                if (!cancelled) {
                    setOrder(result.data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Something went wrong."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (orderId) {
            getOrderDetails();
        }

        return () => {
            cancelled = true;
        };
    }, [orderId, router]);

    useEffect(() => {
        if (!orderId || !order) return;

        if (
            order.paymentMethod === "Razorpay" &&
            order.paymentStatus !== "Paid"
        ) {
            return;
        }

        // Don't keep tracking completed or cancelled orders.
        if (
            order.status === "Delivered" ||
            order.status === "Cancelled"
        ) {
            return;
        }

        const socket = new WebSocket(
            "ws://localhost:4001/ws"
        );

        socket.onopen = () => {
            socket.send(
                JSON.stringify({
                    type: "subscribe",
                    orderId: order.orderId,
                })
            );
        };

        socket.onmessage = (message) => {
            try {
                const event = JSON.parse(message.data);

                if (
                    event.type !== "order.status_updated" ||
                    event.data?.orderId !== order.orderId
                ) {
                    return;
                }

                const newStatus = event.data.newStatus;

                if (
                    !["Pending", "Picked Up", "Delivered", "Cancelled"]
                        .includes(newStatus)
                ) {
                    return;
                }

                setOrder((currentOrder) => {
                    if (!currentOrder) return currentOrder;

                    // Ignore duplicate or stale status events.
                    if (currentOrder.status === newStatus) {
                        return currentOrder;
                    }

                    // Only accept valid forward transitions.
                    const validTransition =
                        (currentOrder.status === "Pending" &&
                            newStatus === "Picked Up") ||
                        (currentOrder.status === "Picked Up" &&
                            newStatus === "Delivered");

                    if (!validTransition) {
                        return currentOrder;
                    }

                    return {
                        ...currentOrder,
                        status: newStatus,
                    };
                });
            } catch (error) {
                console.error(
                    "Failed to process WebSocket event:",
                    error
                );
            }
        };

        socket.onerror = (error) => {
            console.error("Order tracking WebSocket error:", error);
        };

        return () => {
            socket.close();
        };
    }, [orderId, order?.orderId, order?.status, order?.paymentMethod, order?.paymentStatus]);

    const statusStyles: Record<string, string> = {
        Pending: "bg-amber-50 text-amber-700 ring-amber-200",
        "Picked Up": "bg-blue-50 text-blue-700 ring-blue-200",
        Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        Cancelled: "bg-red-50 text-red-700 ring-red-200",
    };

    const currentStep = order
        ? order.status === "Pending"
            ? 0
            : order.status === "Picked Up"
                ? 1
                : order.status === "Delivered"
                    ? 2
                    : -1
        : -1;

    const isCancelled = order?.status === "Cancelled";

    const isRazorpayUnpaid =
        order?.paymentMethod === "Razorpay" &&
        order.paymentStatus !== "Paid";

    const paymentIssue =
        order?.paymentStatus === "Failed";

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });

    return (
        <div className="min-h-screen bg-zinc-50">
            <CustomerHeader />

            <main className="min-h-[75vh] px-4 py-8 sm:px-6 lg:py-12">
                <div className="mx-auto max-w-6xl">
                    <button
                        onClick={() => router.push("/myprofile")}
                        className="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-600 cursor-pointer transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                        <span
                            className="text-lg transition-transform duration-200 group-hover:-translate-x-0.5"
                        >
                            ←
                        </span>
                        Back to My Profile
                    </button>

                    {loading && (
                        <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center">
                            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
                            <p className="font-medium text-zinc-700">
                                Loading your order...
                            </p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-12 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-500">
                                !
                            </div>

                            <h1 className="mt-4 text-xl font-bold text-zinc-900">
                                Unable to load order
                            </h1>

                            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                                {error}
                            </p>

                            <button
                                onClick={() => window.location.reload()}
                                className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && order && (
                        <div className="space-y-6">

                            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                                <div className="h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-300" />

                                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                                                Order Details
                                            </h1>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[order.status] ||
                                                    "bg-zinc-100 text-zinc-700 ring-zinc-200"
                                                    }`}
                                            >
                                                {isRazorpayUnpaid
                                                    ? paymentIssue
                                                        ? "Payment Failed"
                                                        : "Awaiting Payment"
                                                    : order.status}
                                            </span>
                                        </div>

                                        <p className="mt-3 text-sm text-zinc-500">
                                            Order #
                                            {order.orderId.slice(-4).toUpperCase()}
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-500">
                                            Placed on {formatDate(order.createdAt)}
                                        </p>
                                    </div>

                                    <div className="flex min-h-[92px] flex-col justify-center rounded-2xl border border-orange-100 bg-orange-50/70 px-6 py-4 sm:min-w-44">
                                        <p className="text-sm font-medium text-orange-700">
                                            Total Amount
                                        </p>

                                        <p className="mt-1 text-2xl font-bold tracking-tight text-orange-600">
                                            ₹{order.amount}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-900">
                                            Order Progress
                                        </h2>
                                        <p className="mt-1 text-sm text-zinc-500">
                                            Follow your order status.
                                        </p>
                                    </div>

                                    {!isCancelled && (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
                                            <span className="h-2 w-2 rounded-full bg-orange-500" />
                                            Live order updates
                                        </span>
                                    )}
                                </div>

                                {isRazorpayUnpaid ? (
                                    <div
                                        className={`mt-6 rounded-2xl border p-5 ${paymentIssue
                                                ? "border-red-200 bg-red-50"
                                                : "border-amber-200 bg-amber-50"
                                            }`}
                                    >
                                        <h3
                                            className={`font-semibold ${paymentIssue ? "text-red-800" : "text-amber-800"
                                                }`}
                                        >
                                            {paymentIssue
                                                ? "Payment Failed"
                                                : "Payment Awaiting Confirmation"}
                                        </h3>

                                        <p
                                            className={`mt-1 text-sm ${paymentIssue ? "text-red-700" : "text-amber-700"
                                                }`}
                                        >
                                            {paymentIssue
                                                ? "Your payment was unsuccessful. This order has not been confirmed and will not proceed to delivery."
                                                : "We're waiting for confirmation from Razorpay. Your order will not proceed to delivery until payment is confirmed."}
                                        </p>
                                    </div>
                                ) : isCancelled ? (
                                    <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
                                        <h3 className="font-semibold text-red-800">
                                            This order was cancelled
                                        </h3>

                                        <p className="mt-1 text-sm text-red-700">
                                            Please refer to the payment summary below for the recorded
                                            payment status.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-8">
                                        {ORDER_STEPS.map((step, index) => {
                                            const isCompleted = index <= currentStep;
                                            const isCurrent = index === currentStep;
                                            const isActive = isCompleted;

                                            return (
                                                <div
                                                    key={step.title}
                                                    className="relative flex gap-4 pb-8 last:pb-0"
                                                >
                                                    {index < ORDER_STEPS.length - 1 && (
                                                        <div
                                                            className={`absolute left-[17px] top-9 h-[calc(100%-20px)] w-0.5 transition-colors ${index < currentStep
                                                                    ? "bg-orange-500"
                                                                    : "bg-zinc-200"
                                                                }`}
                                                        />
                                                    )}

                                                    <div
                                                        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${isActive
                                                                ? "border-orange-500 bg-orange-500 text-white"
                                                                : "border-zinc-200 bg-white text-zinc-400"
                                                            }`}
                                                    >
                                                        {isCompleted ? "✓" : index + 1}
                                                    </div>

                                                    <div className="min-w-0 flex-1 pt-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3
                                                                className={`font-semibold transition-colors ${isCurrent
                                                                        ? "text-orange-600"
                                                                        : isCompleted
                                                                            ? "text-zinc-900"
                                                                            : "text-zinc-400"
                                                                    }`}
                                                            >
                                                                {step.title}
                                                            </h3>

                                                            {isCurrent && (
                                                                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
                                                                    Current status
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mt-1 text-sm text-zinc-500">
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <p className="mt-6 border-t border-zinc-100 pt-4 text-xs text-zinc-400">
                                    The timeline updates automatically when your
                                    order status changes.
                                </p>
                            </section>

                            <div className="grid gap-6 md:grid-cols-2">

                                <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                                            🍽️
                                        </div>

                                        <div>
                                            <p className="text-sm text-zinc-500">
                                                Ordered from
                                            </p>
                                            <h2 className="mt-1 text-lg font-bold text-zinc-900">
                                                {order.restaurant?.restaurantName ||
                                                    "Restaurant"}
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-2xl bg-zinc-50 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                                            Restaurant location
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-zinc-700">
                                            {order.restaurant?.city || "Not available"}
                                        </p>
                                    </div>
                                </section>

                                <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                                            📍
                                        </div>

                                        <div>
                                            <p className="text-sm text-zinc-500">
                                                Delivering to
                                            </p>
                                            <h2 className="mt-1 text-lg font-bold text-zinc-900">
                                                Delivery Address
                                            </h2>
                                        </div>
                                    </div>

                                    <p className="mt-5 font-medium leading-6 text-zinc-800">
                                        {order.address}, {order.city}
                                    </p>

                                    {order.landmark && (
                                        <p className="mt-2 text-sm text-zinc-500">
                                            Landmark: {order.landmark}
                                        </p>
                                    )}
                                </section>
                            </div>

                            <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
                                <h2 className="text-xl font-bold text-zinc-900">
                                    Payment Summary
                                </h2>

                                <div className="mt-6 space-y-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-zinc-500">
                                            Payment Method
                                        </span>
                                        <span className="text-sm font-semibold text-zinc-800">
                                            {order.paymentMethod}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-zinc-500">
                                            Payment Status
                                        </span>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${order.paymentStatus === "Paid"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : order.paymentStatus === "Failed"
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-amber-50 text-amber-700"
                                                }`}
                                        >
                                            {order.paymentStatus}
                                        </span>
                                    </div>

                                    <div className="border-t border-dashed border-zinc-200 pt-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="font-semibold text-zinc-900">
                                                Total Amount
                                            </span>

                                            <span className="text-xl font-bold tracking-tight text-orange-600 sm:text-2xl">
                                                ₹{order.amount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </main>

            <RestaurantFooter />
        </div>
    );
}