// src/store/useCart.js
import { create } from "zustand";

const clampQty = (n) => Math.max(1, Number(n) || 1);

const normalizeColor = (color) => color || "silver";

const normalizeSize = (size) => (size == null ? null : String(size));

const normalizeServiceOption = (serviceOption) => serviceOption || null;

const toKeySizePart = (size) => (size == null ? "nosize" : String(size));

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
    size,
    service,
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

const mergeQuantities = (a, b) => clampQty((a || 1) + (b || 1));

export default create((set) => ({
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

      const key =
        normalizedItem.key ||
        buildCartKey({
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
          ...normalizedItem,
          quantity: mergeQuantities(current.quantity, normalizedItem.quantity),
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
        x.key === key ? { ...x, quantity: clampQty((x.quantity || 1) + 1) } : x,
      ),
    })),

  dec: (key) =>
    set((state) => ({
      items: state.items.map((x) =>
        x.key === key ? { ...x, quantity: clampQty((x.quantity || 1) - 1) } : x,
      ),
    })),

  updateVariant: (oldKey, next) =>
    set((state) => {
      const items = state.items;
      const idx = items.findIndex((x) => x.key === oldKey);
      if (idx < 0) return state;

      const current = items[idx];

      const productId = getProductIdFromItem(current);
      if (!productId) return state;

      const nextColor = normalizeColor(next?.color ?? current.color);
      const nextSize = normalizeSize(next?.size ?? current.size);
      const nextServiceOption = normalizeServiceOption(
        current.serviceOption ?? getKeyParts(current.key).service,
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
        productId,
        color: nextColor,
        size: nextSize,
        serviceOption: nextServiceOption,
        image: next?.image ?? current.image,
      };

      if (nextKey === oldKey) {
        const copy = [...items];
        copy[idx] = updatedItem;
        return { items: copy };
      }

      const existingIdx = items.findIndex((x) => x.key === nextKey);
      const copy = [...items];

      if (existingIdx >= 0) {
        const existing = copy[existingIdx];

        copy[existingIdx] = {
          ...existing,
          image: updatedItem.image ?? existing.image,
          color: nextColor,
          size: nextSize,
          serviceOption: nextServiceOption,
          quantity: mergeQuantities(existing.quantity, current.quantity),
        };

        copy.splice(idx, 1);
        return { items: copy };
      }

      copy[idx] = updatedItem;
      return { items: copy };
    }),

  updateServiceOption: (oldKey, serviceOption) =>
    set((state) => {
      const items = state.items;
      const idx = items.findIndex((x) => x.key === oldKey);
      if (idx < 0) return state;

      const current = items[idx];

      const productId = getProductIdFromItem(current);
      if (!productId) return state;

      const nextColor = normalizeColor(current.color);
      const nextSize = normalizeSize(current.size);
      const nextServiceOption = normalizeServiceOption(serviceOption);

      const nextKey = buildCartKey({
        productId,
        color: nextColor,
        size: nextSize,
        serviceOption: nextServiceOption,
      });

      const updatedItem = {
        ...current,
        key: nextKey,
        productId,
        color: nextColor,
        size: nextSize,
        serviceOption: nextServiceOption,
      };

      if (nextKey === oldKey) {
        const copy = [...items];
        copy[idx] = updatedItem;
        return { items: copy };
      }

      const existingIdx = items.findIndex((x) => x.key === nextKey);
      const copy = [...items];

      if (existingIdx >= 0) {
        const existing = copy[existingIdx];

        copy[existingIdx] = {
          ...existing,
          quantity: mergeQuantities(existing.quantity, current.quantity),
          serviceOption: nextServiceOption,
        };

        copy.splice(idx, 1);
        return { items: copy };
      }

      copy[idx] = updatedItem;
      return { items: copy };
    }),

  clearCart: () => set({ items: [] }),
}));
