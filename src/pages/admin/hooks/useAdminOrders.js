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

      const cleanBase = API_ORIGIN.endsWith("/")
        ? API_ORIGIN.slice(0, -1)
        : API_ORIGIN;

      const endpoint = cleanBase.endsWith("/api")
        ? `${cleanBase}/orders/admin/all`
        : `${cleanBase}/api/orders/admin/all`;

      const res = await fetch(endpoint, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load orders.");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      console.error("useAdminOrders fetch error:", err);
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
