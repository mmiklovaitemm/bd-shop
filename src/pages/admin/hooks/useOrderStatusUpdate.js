import { useState } from "react";

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function useOrderStatusUpdate({ setOrders, fetchOrders }) {
  const [savingId, setSavingId] = useState(null);

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      setSavingId(orderId);

      const res = await fetch(`${API_ORIGIN}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update status.");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: nextStatus } : order,
        ),
      );

      fetchOrders();
    } catch (err) {
      alert(err?.message || "Failed to update status.");
    } finally {
      setSavingId(null);
    }
  };

  return {
    savingId,
    handleStatusChange,
  };
}
