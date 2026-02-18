// src/store/useCart.js
import { create } from "zustand";

const clampQty = (n) => Math.max(1, Number(n || 1));

export default create((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const key = item?.key;
      if (!key) return state;

      const idx = state.items.findIndex((x) => x.key === key);
      if (idx >= 0) {
        const copy = [...state.items];
        const current = copy[idx];
        copy[idx] = {
          ...current,
          quantity: clampQty((current.quantity || 1) + (item.quantity || 1)),
        };
        return { items: copy };
      }

      return {
        items: [
          ...state.items,
          {
            ...item,
            quantity: clampQty(item.quantity || 1),
          },
        ],
      };
    }),

  removeItem: (key) =>
    set((state) => ({
      items: state.items.filter((x) => x.key !== key),
    })),

  inc: (key) =>
    set((state) => ({
      items: state.items.map((x) =>
        x.key === key ? { ...x, quantity: clampQty((x.quantity || 1) + 1) } : x,
      ),
    })),

  dec: (key) =>
    set((state) => ({
      items: state.items
        .map((x) =>
          x.key === key
            ? { ...x, quantity: clampQty((x.quantity || 1) - 1) }
            : x,
        )
        .filter((x) => (x.quantity || 1) >= 1),
    })),

  updateVariant: (oldKey, next) =>
    set((state) => {
      const items = state.items;
      const idx = items.findIndex((x) => x.key === oldKey);
      if (idx < 0) return state;

      const current = items[idx];

      const productId = current.productId;
      const nextColor = next?.color ?? current.color ?? "silver";
      const nextSize = next?.size ?? current.size ?? null;

      const nextKey = `${productId}|${nextColor || "silver"}|${
        nextSize || "nosize"
      }`;

      if (nextKey === oldKey) {
        const copy = [...items];
        copy[idx] = {
          ...current,
          color: nextColor,
          size: nextSize,
          image: next?.image ?? current.image,
        };
        return { items: copy };
      }

      const existingIdx = items.findIndex((x) => x.key === nextKey);
      const copy = [...items];

      if (existingIdx >= 0) {
        const existing = copy[existingIdx];
        copy[existingIdx] = {
          ...existing,
          quantity: clampQty(
            (existing.quantity || 1) + (current.quantity || 1),
          ),
          image: next?.image ?? existing.image,
          color: nextColor,
          size: nextSize,
        };

        copy.splice(idx, 1);
        return { items: copy };
      }

      copy[idx] = {
        ...current,
        key: nextKey,
        color: nextColor,
        size: nextSize,
        image: next?.image ?? current.image,
      };

      return { items: copy };
    }),

  updateServiceOption: (key, serviceOption) =>
    set((state) => ({
      items: state.items.map((x) =>
        x.key === key ? { ...x, serviceOption: serviceOption || null } : x,
      ),
    })),
}));
