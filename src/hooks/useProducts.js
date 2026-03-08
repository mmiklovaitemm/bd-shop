// src/hooks/useProducts.js
import { useEffect, useMemo, useState } from "react";

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_ORIGIN}/api/products`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : Array.isArray(data?.data)
              ? data.data
              : [];

        setProducts(list);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const productsById = useMemo(() => {
    const m = new Map();
    for (const p of products) m.set(String(p.id), p);
    return m;
  }, [products]);

  const getById = (id) => productsById.get(String(id)) || null;

  return { products, loading, getById, productsById };
}

export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(() => !!id);

  useEffect(() => {
    if (!id) {
      return;
    }

    const controller = new AbortController();

    fetch(`${API_ORIGIN}/api/products/${id}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const p = data?.product ?? data?.data ?? data ?? null;
        setProduct(p);
        setLoading(false);
      })
      .catch(() => {
        setProduct(null);
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { product, loading };
}
