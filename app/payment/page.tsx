"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const PaymentPage = () => {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const [paymentType, setPaymentType] =
        useState<"UPI" | "CARD">("UPI");

    const [upiId, setUpiId] = useState("");

    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");


    const [pendingOrder, setPendingOrder] = useState<string | null>(null);
    const [totalAmount, setTotalAmount] = useState<number>(0);

    useEffect(() => {
        const savedOrder = localStorage.getItem("pendingOrder");

        if (!savedOrder) {
            toast.error("Order data not found. Please checkout again.");
            router.replace("/checkout");
            return;
        }

        try {
            const orderData = JSON.parse(savedOrder);

            if (typeof orderData.amount !== "number" || !Number.isFinite(orderData.amount)) {
                toast.error("Invalid order amount. Please checkout again.");
                router.replace("/checkout");
                return;
            }

            setPendingOrder(savedOrder);
            setTotalAmount(orderData.amount);
        } catch (error) {
            console.error("Invalid pending order:", error);
            toast.error("Invalid order data. Please checkout again.");
            router.replace("/checkout");
        }
    }, [router]);

    const handlePayment = async () => {
        if (paymentType === "UPI" && !upiId.trim()) {
            toast.error("Please enter UPI ID");
            return;
        }

        if (paymentType === "CARD") {
            if (!cardNumber || !expiry || !cvv) {
                toast.error("Please fill all card details");
                return;
            }
        }

        setLoading(true);

        try {

            if (!pendingOrder) {
                toast.error("Order data not found. Please checkout again.");
                return;
            }

            let orderData;

            try {
                orderData = JSON.parse(pendingOrder);
            } catch {
                toast.error("Invalid order data. Please checkout again.");
                return;
            }

            const res = await fetch("/api/webhook/payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    paymentId: crypto.randomUUID(),
                    paymentStatus: "Paid",
                    orderData
                })
            })

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Payment failed");
                return;
            }

            localStorage.removeItem("cart");
            localStorage.removeItem("pendingOrder");

            toast.success("Payment successful");
            router.push(`/payment/success/${data.data._id}`);

        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-100 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg border border-zinc-200 p-8">

                <h1 className="text-4xl font-bold text-zinc-900">
                    Secure Payment
                </h1>

                <p className="text-zinc-500 mt-2">
                    Complete your payment to place the order.
                </p>

                {/* Amount */}

                <div className="mt-8 p-5 rounded-2xl border border-orange-200 bg-orange-50">

                    <p className="text-zinc-500 text-sm">
                        Amount To Pay
                    </p>

                    <h2 className="text-4xl font-bold text-orange-500 mt-1">
                        ₹{totalAmount}
                    </h2>

                </div>

                {/* Payment Method */}

                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-zinc-900 mb-4">
                        Payment Method
                    </h3>

                    <div className="space-y-4">

                        {/* UPI */}

                        <label
                            onClick={() => setPaymentType("UPI")}
                            className={`block rounded-2xl border cursor-pointer transition ${paymentType === "UPI"
                                ? "border-orange-500 bg-orange-50"
                                : "border-zinc-200 bg-white"
                                }`}
                        >
                            <div className="flex items-center gap-4 p-5">

                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentType === "UPI"
                                        ? "border-orange-500"
                                        : "border-zinc-300"
                                        }`}
                                >
                                    {paymentType === "UPI" && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                    )}
                                </div>

                                <div>
                                    <h4 className="font-semibold text-lg">
                                        UPI Payment
                                    </h4>

                                    <p className="text-zinc-500 text-sm">
                                        Google Pay, PhonePe, Paytm, BHIM
                                    </p>
                                </div>

                            </div>
                        </label>

                        {paymentType === "UPI" && (
                            <input
                                type="text"
                                placeholder="example@paytm"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="w-full border border-zinc-300 rounded-2xl px-4 py-4 outline-none focus:border-orange-500"
                            />
                        )}

                        {/* Card */}

                        <label
                            onClick={() => setPaymentType("CARD")}
                            className={`block rounded-2xl border cursor-pointer transition ${paymentType === "CARD"
                                ? "border-orange-500 bg-orange-50"
                                : "border-zinc-200 bg-white"
                                }`}
                        >
                            <div className="flex items-center gap-4 p-5">

                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentType === "CARD"
                                        ? "border-orange-500"
                                        : "border-zinc-300"
                                        }`}
                                >
                                    {paymentType === "CARD" && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                    )}
                                </div>

                                <div>
                                    <h4 className="font-semibold text-lg">
                                        Credit / Debit Card
                                    </h4>

                                    <p className="text-zinc-500 text-sm">
                                        Visa, Mastercard, RuPay
                                    </p>
                                </div>

                            </div>
                        </label>

                        {paymentType === "CARD" && (
                            <div className="space-y-4">

                                <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    className="w-full border border-zinc-300 rounded-2xl px-4 py-4 outline-none focus:border-orange-500"
                                />

                                <div className="grid grid-cols-2 gap-4">

                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={expiry}
                                        onChange={(e) => setExpiry(e.target.value)}
                                        className="border border-zinc-300 rounded-2xl px-4 py-4 outline-none focus:border-orange-500"
                                    />

                                    <input
                                        type="password"
                                        placeholder="CVV"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value)}
                                        className="border border-zinc-300 rounded-2xl px-4 py-4 outline-none focus:border-orange-500"
                                    />

                                </div>
                            </div>
                        )}
                    </div>
                </div>


                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-semibold text-lg transition disabled:opacity-60"
                >
                    {loading
                        ? "Processing Payment..."
                        : `Pay ₹${totalAmount}`}
                </button>

                <p className="text-center text-zinc-400 text-sm mt-5">
                    🔒 Demo Payment Gateway (Webhook Learning)
                </p>

            </div>

        </div>
    );
};

export default PaymentPage;