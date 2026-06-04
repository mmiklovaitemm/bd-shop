// Static products - no backend needed
import { useMemo } from "react";
import { PRODUCTS } from "@/data/products";

export function useProducts() {
  const productsById = useMemo(() => {
    const m = new Map();
    for (const p of PRODUCTS) m.set(String(p.id), p);
    return m;
  }, []);

  const getById = (id) => productsById.get(String(id)) || null;

  return { products: PRODUCTS, loading: false, getById, productsById };
}

export function useProduct(id) {
  const product = useMemo(() => {
    if (!id) return null;
    return PRODUCTS.find((p) => String(p.id) === String(id)) || null;
  }, [id]);

  return { product, loading: false };
}
