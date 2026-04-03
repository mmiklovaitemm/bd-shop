import { useEffect, useState, useCallback } from "react";

const getCleanApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com";
  return url.replace(/\/api\/?$/, "").replace(/\/+$/, "");
};

const BASE_URL = getCleanApiUrl();

export default function useAdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const endpoint = `${BASE_URL}/api/orders/all`;

      const token = localStorage.getItem("access_token");

      const res = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message || `Failed to load orders (${res.status})`,
        );
      }

      const ordersList = Array.isArray(data.orders) ? data.orders : [];
      setOrders(ordersList);
    } catch (err) {
      console.error("useAdminOrders fetch error:", err);
      setError(err?.message || "Failed to load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    setOrders,
    loading,
    error,
    fetchOrders,
  };
}
