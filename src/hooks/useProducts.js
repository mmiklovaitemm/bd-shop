import { useEffect, useMemo, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com/api";

const getUrl = (path) => {
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

function ensureParsed(item) {
  if (!item) return item;

  const fieldsToParse = [
    "variants",
    "colors",
    "sizes",
    "images",
    "details",
    "gemstones",
  ];
  const newItem = { ...item };

  fieldsToParse.forEach((field) => {
    if (typeof newItem[field] === "string") {
      try {
        newItem[field] = JSON.parse(newItem[field]);
      } catch (e) {
        console.warn(`Nepavyko suvirškinti ${field} lauko:`, e);
      }
    }
  });

  return newItem;
}

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

        setProducts(list.map(ensureParsed));
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
        const rawP = data?.product ?? data?.data ?? data ?? null;
        setProduct(rawP ? ensureParsed(rawP) : null);
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
