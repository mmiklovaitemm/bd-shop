import { useEffect, useState } from "react";

const API_ORIGIN =
  import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com";

export default function useAdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const cleanBase = API_ORIGIN.endsWith("/")
        ? API_ORIGIN.slice(0, -1)
        : API_ORIGIN;

      const endpoint = cleanBase.endsWith("/api")
        ? `${cleanBase}/products`
        : `${cleanBase}/api/products`;

      const token = localStorage.getItem("access_token");

      const res = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load products.");
      }

      setProducts(data || []);
      setError("");
    } catch (err) {
      console.error("useAdminProducts fetch error:", err);
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    setProducts,
    loading,
    error,
    fetchProducts,
  };
}
