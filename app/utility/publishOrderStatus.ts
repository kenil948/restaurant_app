type OrderStatusEvent = {
    id: string;
    event: "order.status_updated";
    createdAt: string;
    data: {
        orderId: string;
        previousStatus: string;
        newStatus: string;
    };
};

export const publishOrderStatus = async (
    event: OrderStatusEvent
) => {
    const publishUrl =
        process.env.WS_PUBLISH_URL ||
        "http://127.0.0.1:4001/publish";

    const secret = process.env.WS_INTERNAL_SECRET;

    if (!secret) {
        throw new Error(
            "WS_INTERNAL_SECRET is not configured"
        );
    }

    const response = await fetch(publishUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-WS-Secret": secret,
        },
        body: JSON.stringify(event),
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            `WebSocket publishing failed: ${
                result.message || response.statusText
            }`
        );
    }

    return result;
};