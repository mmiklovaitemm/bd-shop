import { useEffect, useState } from "react";

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function useAdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_ORIGIN}/api/products`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load products.");
      }

      setProducts(data || []);
      setError("");
    } catch (err) {
      setError(err.message);
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
