import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiGet } from "@/lib/api";

import useBagDrawer from "@/store/useBagDrawer";
import useCart from "@/store/useCart";
import useLanguage from "@/context/useLanguage";
import preventDragHandler from "@/utils/preventDrag";

import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";
import trashIcon from "@/assets/ui/trash.svg";

const fmtPrice = (n) =>
  new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

// --- Logic Helpers ---
function isVariantObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray(value.images)
  );
}

function usesVariantLevelStock(product) {
  if (!product?.variants) return false;
  return Object.values(product.variants).some(
    (value) =>
      Array.isArray(value) && value.length > 0 && isVariantObject(value[0]),
  );
}

function getAvailableColors(product) {
  if (!product) return [];
  const colors = product.colors || [];
  if (!usesVariantLevelStock(product)) {
    return colors.filter(
      (color) => (product.variants?.[color] || []).length > 0,
    );
  }
  const inStockColors = colors.filter((color) => {
    const entries = product.variants?.[color] || [];
    return entries.some((variant) => Number(variant?.stock || 0) > 0);
  });
  return inStockColors.length ? inStockColors : colors;
}

function getColorEntries(product, color) {
  if (!product || !color) return [];
  return Array.isArray(product.variants?.[color])
    ? product.variants[color]
    : [];
}

function getAvailableSizesForColor(product, color) {
  if (!product || !color) return [];
  if (!usesVariantLevelStock(product)) return (product.sizes || []).map(String);
  const inStockSizes = getColorEntries(product, color)
    .filter((variant) => Number(variant?.stock || 0) > 0)
    .map((variant) => String(variant?.size))
    .filter(Boolean);
  return inStockSizes.length
    ? inStockSizes
    : getColorEntries(product, color)
        .map((v) => String(v?.size))
        .filter(Boolean);
}

function getFirstAvailableSize(product, color) {
  const availableSizes = getAvailableSizesForColor(product, color);
  return availableSizes.length > 0
    ? availableSizes[0]
    : product?.sizes?.[0]
      ? String(product.sizes[0])
      : null;
}

function getVariantStock(product, color, size) {
  if (!product) return 0;
  if (!usesVariantLevelStock(product))
    return Math.max(0, Number(product.stockQuantity) || 0);
  const entries = getColorEntries(product, color);
  const variant = entries.find((v) => String(v?.size) === String(size));
  return Math.max(0, Number(variant?.stock) || 0);
}

const drawerVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", damping: 27, stiffness: 200 },
  },
  exit: { x: "100%", transition: { ease: "easeInOut", duration: 0.3 } },
};

export default function ShoppingBagDrawer() {
  const navigate = useNavigate();
  const isOpen = useBagDrawer((s) => s.isOpen);
  const close = useBagDrawer((s) => s.close);

  // REAL DATA FROM STORE
  const items = useCart((s) => s.items);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const removeItem = useCart((s) => s.removeItem);
  const updateVariant = useCart((s) => s.updateVariant);

  const { t } = useLanguage();
  const [products, setProducts] = useState([]);

  // Fetch real products from SQL API
  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    apiGet("/api/products", { signal: controller.signal })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.products || [];
        setProducts(list);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("API Error:", err);
      });
    return () => controller.abort();
  }, [isOpen]);

  const productsById = useMemo(() => {
    const m = new Map();
    for (const p of products) {
      if (p?.id) m.set(String(p.id), p);
    }
    return m;
  }, [products]);

  // Robust product lookup (handles String vs Number IDs)
  const getProductById = useCallback(
    (id) => {
      return productsById.get(String(id)) || null;
    },
    [productsById],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.price) * (item.quantity || 1),
        0,
      ),
    [items],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[90] select-none overflow-hidden"
          onDragStart={preventDragHandler}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          <motion.aside
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-0 h-full w-[min(92vw,420px)] border-l border-black bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-black px-6 shrink-0">
              <p className="font-display text-[20px] uppercase tracking-tight">
                {t.bag}
              </p>
              <button
                onClick={close}
                className="flex items-center gap-2 font-ui text-[14px]"
              >
                Close <img src={arrowUpRightIcon} alt="" className="h-3 w-3" />
              </button>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-6 py-10 text-center font-ui text-[14px] text-black/60 italic">
                  {t.bagEmpty}
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {items.map((item) => {
                    const pid =
                      item.productId ??
                      item.id ??
                      String(item.key || "").split("|")[0];
                    const product = getProductById(pid);
                    const availableColors = getAvailableColors(product);
                    const availableSizes = getAvailableSizesForColor(
                      product,
                      item.color,
                    );
                    const variantStock = getVariantStock(
                      product,
                      item.color,
                      item.size,
                    );

                    return (
                      <motion.div key={item.key} layout className="px-6 py-6">
                        <div className="grid grid-cols-[90px_1fr] gap-5">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-[110px] w-[90px] object-cover bg-black/5"
                          />

                          <div className="min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-display text-[18px] leading-tight">
                                {item.name}
                              </p>
                              <p className="font-ui text-[14px]">
                                {fmtPrice(item.price)}
                              </p>
                            </div>

                            {/* Selectors Section */}
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {availableColors.length > 0 && (
                                <div className="bg-black/5 px-2 py-1.5">
                                  <p className="text-[10px] uppercase text-black/40 font-ui mb-1">
                                    Color
                                  </p>
                                  <select
                                    value={item.color}
                                    className="w-full bg-transparent font-ui text-[12px] outline-none capitalize cursor-pointer"
                                    onChange={(e) =>
                                      updateVariant(item.key, {
                                        color: e.target.value,
                                        size: getFirstAvailableSize(
                                          product,
                                          e.target.value,
                                        ),
                                      })
                                    }
                                  >
                                    {availableColors.map((c) => (
                                      <option key={c} value={c}>
                                        {c}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {availableSizes.length > 0 && (
                                <div className="bg-black/5 px-2 py-1.5">
                                  <p className="text-[10px] uppercase text-black/40 font-ui mb-1">
                                    Size
                                  </p>
                                  <select
                                    value={item.size}
                                    className="w-full bg-transparent font-ui text-[12px] outline-none cursor-pointer"
                                    onChange={(e) =>
                                      updateVariant(item.key, {
                                        size: e.target.value,
                                      })
                                    }
                                  >
                                    {availableSizes.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>

                            {/* Actions: Qty & Delete */}
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex border border-black h-8 items-stretch">
                                <button
                                  onClick={() => dec(item.key)}
                                  className="w-8 bg-black/5 disabled:opacity-20"
                                  disabled={item.quantity <= 1}
                                >
                                  –
                                </button>
                                <div className="px-3 flex items-center font-ui text-[12px] border-x border-black">
                                  {item.quantity}
                                </div>
                                <button
                                  onClick={() => inc(item.key)}
                                  className="w-8 bg-black/5 disabled:opacity-20"
                                  disabled={
                                    product && item.quantity >= variantStock
                                  }
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.key)}
                                className="p-1 hover:opacity-50 transition-opacity"
                              >
                                <img
                                  src={trashIcon}
                                  alt="Remove"
                                  className="h-4 w-4 opacity-60"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-black p-6 bg-white shrink-0">
              <button
                onClick={() => {
                  close();
                  navigate("/checkout");
                }}
                disabled={items.length === 0}
                className="flex h-12 w-full items-center justify-center gap-4 bg-black font-ui text-[14px] text-white active:scale-[0.98] transition-transform disabled:opacity-40"
              >
                Check out — {fmtPrice(subtotal)}
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
