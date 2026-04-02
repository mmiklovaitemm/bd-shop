// src/store/useCart.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const clampQty = (n) => Math.max(1, Number(n) || 1);

const normalizeColor = (color) => color || "silver";

const normalizeSize = (size) =>
  size == null || size === "" ? null : String(size);

const normalizeServiceOption = (serviceOption) => serviceOption || null;

const toKeySizePart = (size) =>
  size == null || size === "" ? "nosize" : String(size);

const toKeyServicePart = (serviceOption) =>
  serviceOption == null || serviceOption === "" ? "no-service" : serviceOption;

const getKeyParts = (key) => {
  const [
    productId = "",
    color = "silver",
    size = "nosize",
    service = "no-service",
  ] = String(key || "").split("|");

  return {
    productId,
    color,
    size: size === "nosize" ? null : size,
    service: service === "no-service" ? null : service,
  };
};

const buildCartKey = ({ productId, color, size, serviceOption }) => {
  return [
    String(productId || ""),
    normalizeColor(color),
    toKeySizePart(normalizeSize(size)),
    toKeyServicePart(normalizeServiceOption(serviceOption)),
  ].join("|");
};

const getProductIdFromItem = (item) => {
  if (item?.productId != null) return String(item.productId);
  return getKeyParts(item?.key).productId;
};

const mergeQuantities = (a, b) => clampQty((Number(a) || 1) + (Number(b) || 1));

export default create(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const productId = getProductIdFromItem(item);
          if (!productId) return state;

          const normalizedItem = {
            ...item,
            productId,
            color: normalizeColor(item?.color),
            size: normalizeSize(item?.size),
            serviceOption: normalizeServiceOption(item?.serviceOption),
            quantity: clampQty(item?.quantity),
          };

          const key = buildCartKey({
            productId,
            color: normalizedItem.color,
            size: normalizedItem.size,
            serviceOption: normalizedItem.serviceOption,
          });

          normalizedItem.key = key;

          const existingIdx = state.items.findIndex((x) => x.key === key);

          if (existingIdx >= 0) {
            const copy = [...state.items];
            const current = copy[existingIdx];

            copy[existingIdx] = {
              ...current,
              quantity: mergeQuantities(
                current.quantity,
                normalizedItem.quantity,
              ),
            };

            return { items: copy };
          }

          return {
            items: [...state.items, normalizedItem],
          };
        }),

      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((x) => x.key !== key),
        })),

      inc: (key) =>
        set((state) => ({
          items: state.items.map((x) =>
            x.key === key
              ? { ...x, quantity: (Number(x.quantity) || 1) + 1 }
              : x,
          ),
        })),

      dec: (key) =>
        set((state) => ({
          items: state.items.map((x) =>
            x.key === key
              ? { ...x, quantity: Math.max(1, (Number(x.quantity) || 1) - 1) }
              : x,
          ),
        })),

      updateVariant: (oldKey, next) =>
        set((state) => {
          const items = state.items;
          const idx = items.findIndex((x) => x.key === oldKey);
          if (idx < 0) return state;

          const current = items[idx];
          const productId = getProductIdFromItem(current);

          const nextColor = normalizeColor(next?.color ?? current.color);
          const nextSize = normalizeSize(next?.size ?? current.size);
          const nextServiceOption = normalizeServiceOption(
            current.serviceOption,
          );

          const nextKey = buildCartKey({
            productId,
            color: nextColor,
            size: nextSize,
            serviceOption: nextServiceOption,
          });

          const updatedItem = {
            ...current,
            key: nextKey,
            color: nextColor,
            size: nextSize,
            image: next?.image ?? current.image,
          };

          const copy = [...items];

          if (nextKey !== oldKey) {
            const existingIdx = items.findIndex((x) => x.key === nextKey);
            if (existingIdx >= 0) {
              const existing = copy[existingIdx];
              copy[existingIdx] = {
                ...existing,
                quantity: mergeQuantities(existing.quantity, current.quantity),
              };
              copy.splice(idx, 1);
              return { items: copy };
            }
          }

          copy[idx] = updatedItem;
          return { items: copy };
        }),

      updateServiceOption: (oldKey, serviceOption) =>
        set((state) => {
          const idx = state.items.findIndex((x) => x.key === oldKey);
          if (idx < 0) return state;

          const current = state.items[idx];
          const nextServiceOption = normalizeServiceOption(serviceOption);

          const nextKey = buildCartKey({
            productId: getProductIdFromItem(current),
            color: current.color,
            size: current.size,
            serviceOption: nextServiceOption,
          });

          const copy = [...state.items];
          copy[idx] = {
            ...current,
            key: nextKey,
            serviceOption: nextServiceOption,
          };
          return { items: copy };
        }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    },
  ),
);
