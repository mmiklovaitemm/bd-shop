import { useEffect, useMemo, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com/api";

const getUrl = (path) => {
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const url = getUrl("/products?view=listing");

    fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
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
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Klaida kraunant produktus:", err);
          setProducts([]);
          setLoading(false);
        }
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
    if (!id) return;

    const controller = new AbortController();
    const url = getUrl(`/products/${id}`);

    fetch(url, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const p = data?.product ?? data?.data ?? data ?? null;
        setProduct(p);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setProduct(null);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [id]);

  return { product, loading };
}
