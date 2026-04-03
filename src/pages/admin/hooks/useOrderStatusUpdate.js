import { useState } from "react";

// Užtikriname, kad API_ORIGIN neturėtų pasvirojo brūkšnio gale
const API_URL = (
  import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com"
).replace(/\/+$/, "");

export default function useOrderStatusUpdate({ setOrders, fetchOrders }) {
  const [savingId, setSavingId] = useState(null);

  const handleStatusChange = async (orderId, nextStatus) => {
    if (!orderId) return;

    try {
      setSavingId(orderId);

      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || `Server error: ${response.status}`);
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: nextStatus } : order,
        ),
      );

      if (fetchOrders) fetchOrders();
    } catch (err) {
      console.error("Order status update failed:", err);
      alert(err?.message || "Failed to update status. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  return {
    savingId,
    handleStatusChange,
  };
}
