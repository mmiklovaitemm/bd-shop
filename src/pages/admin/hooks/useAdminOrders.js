import { useEffect, useState } from "react";

const API_ORIGIN =
  import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com";

export default function useAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await fetch(`${API_ORIGIN}/api/orders/admin/all`, {
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load orders.");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(err?.message || "Failed to load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    setOrders,
    loading,
    error,
    fetchOrders,
  };
}
