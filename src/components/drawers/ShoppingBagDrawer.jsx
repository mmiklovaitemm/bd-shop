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

function isVariantObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray(value.images)
  );
}

function usesVariantLevelStock(product) {
  return Object.values(product?.variants || {}).some(
    (value) =>
      Array.isArray(value) && value.length > 0 && isVariantObject(value[0]),
  );
}

function getAvailableColors(product) {
  const colors = product?.colors || [];

  if (!usesVariantLevelStock(product)) {
    return colors.filter(
      (color) => (product?.variants?.[color] || []).length > 0,
    );
  }

  const inStockColors = colors.filter((color) => {
    const entries = product?.variants?.[color] || [];
    return entries.some((variant) => Number(variant?.stock || 0) > 0);
  });

  return inStockColors.length ? inStockColors : colors;
}

function getColorEntries(product, color) {
  if (!product) return [];

  return Array.isArray(product?.variants?.[color])
    ? product.variants[color]
    : [];
}

function getAvailableSizesForColor(product, color) {
  if (!product) return [];

  if (!usesVariantLevelStock(product)) {
    return (product?.sizes || []).map(String);
  }

  const inStockSizes = getColorEntries(product, color)
    .filter((variant) => Number(variant?.stock || 0) > 0)
    .map((variant) => String(variant?.size))
    .filter(Boolean);

  if (inStockSizes.length) {
    return inStockSizes;
  }

  return getColorEntries(product, color)
    .map((variant) => String(variant?.size))
    .filter(Boolean);
}

function getFirstAvailableColor(product) {
  const availableColors = getAvailableColors(product);
  return availableColors[0] || product?.colors?.[0] || "silver";
}

function getFirstAvailableSize(product, color) {
  const availableSizes = getAvailableSizesForColor(product, color);

  if (availableSizes.length > 0) {
    return availableSizes[0];
  }

  return product?.sizes?.[0] ? String(product.sizes[0]) : null;
}

function getSelectedVariant(product, color, size) {
  if (!product || !usesVariantLevelStock(product)) return null;

  const entries = getColorEntries(product, color);

  return (
    entries.find((variant) => String(variant?.size) === String(size)) || null
  );
}

function getVariantStock(product, color, size) {
  if (!product) return 0;

  if (!usesVariantLevelStock(product)) {
    return Math.max(0, Number(product?.stockQuantity) || 0);
  }

  const selectedVariant = getSelectedVariant(product, color, size);
  return Math.max(0, Number(selectedVariant?.stock) || 0);
}

function pickVariantImage(product, color, size = null) {
  if (!product) return "";

  const fallbackColor = color || getFirstAvailableColor(product);

  if (!usesVariantLevelStock(product)) {
    return (
      product?.variants?.[fallbackColor]?.[0] ||
      product?.variants?.[product?.colors?.[0]]?.[0] ||
      product?.thumbnail ||
      ""
    );
  }

  const exactVariant = getSelectedVariant(product, fallbackColor, size);
  if (exactVariant?.images?.length) {
    return exactVariant.images[0] || product?.thumbnail || "";
  }

  const firstAvailableVariant = getColorEntries(product, fallbackColor).find(
    (variant) =>
      Number(variant?.stock || 0) > 0 &&
      Array.isArray(variant?.images) &&
      variant.images.length > 0,
  );

  if (firstAvailableVariant?.images?.length) {
    return firstAvailableVariant.images[0] || product?.thumbnail || "";
  }

  const firstImageVariant = getColorEntries(product, fallbackColor).find(
    (variant) => Array.isArray(variant?.images) && variant.images.length > 0,
  );

  if (firstImageVariant?.images?.length) {
    return firstImageVariant.images[0] || product?.thumbnail || "";
  }

  return product?.thumbnail || "";
}

function getEffectiveColor(product, item) {
  const availableColors = getAvailableColors(product);
  const currentColor = item?.color || product?.colors?.[0] || "silver";

  if (availableColors.includes(currentColor)) {
    return currentColor;
  }

  return getFirstAvailableColor(product);
}

function getEffectiveSize(product, color, item) {
  const currentSize = item?.size == null ? null : String(item.size);
  const availableSizes = getAvailableSizesForColor(product, color);

  if (availableSizes.includes(currentSize)) {
    return currentSize;
  }

  return getFirstAvailableSize(product, color);
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

  const items = useCart((s) => s.items);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const removeItem = useCart((s) => s.removeItem);
  const updateVariant = useCart((s) => s.updateVariant);
  const updateServiceOption = useCart((s) => s.updateServiceOption);

  const { t } = useLanguage();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();

    apiGet("/api/products", { signal: controller.signal })
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : [];
        setProducts(list);
      })
      .catch(() => setProducts([]));

    return () => controller.abort();
  }, [isOpen]);

  const productsById = useMemo(() => {
    const m = new Map();
    for (const p of products) {
      m.set(String(p.id), p);
    }
    return m;
  }, [products]);

  const getProductById = useCallback(
    (id) => productsById.get(String(id)) || null,
    [productsById],
  );

  useEffect(() => {
    if (!isOpen) return;

    items.forEach((item) => {
      const pid =
        item.productId ??
        item.id ??
        item.product?.id ??
        item.product?.productId ??
        String(item.key || "").split("|")[0];

      const resolvedProduct = getProductById(pid);
      const product = resolvedProduct || item.product || null;
      if (!product) return;

      const nextColor = getEffectiveColor(product, item);
      const nextSize = getEffectiveSize(product, nextColor, item);
      const nextImage = pickVariantImage(product, nextColor, nextSize);

      const normalizedItemSize = item?.size == null ? null : String(item.size);
      const currentImage = item?.image || "";

      const shouldUpdate =
        item.color !== nextColor ||
        normalizedItemSize !== nextSize ||
        currentImage !== nextImage;

      if (shouldUpdate) {
        updateVariant(item.key, {
          color: nextColor,
          size: nextSize,
          image: nextImage,
        });
      }
    });
  }, [isOpen, items, getProductById, updateVariant]);

  useEffect(() => {
    if (!isOpen) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const allowInsideDrawer = (e) => {
      if (e.target.closest("[data-bag-panel]")) return;
      e.preventDefault();
    };

    document.addEventListener("touchmove", allowInsideDrawer, {
      passive: false,
    });

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.removeEventListener("touchmove", allowInsideDrawer);
    };
  }, [isOpen]);

  const SHIPPING_KIT_FEE = 15;

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const base = Number(item.price) || 0;
        const qty = item.quantity || 1;

        const service = String(item?.serviceOption || "").toLowerCase();
        const isShippingKit =
          service === "shipping" ||
          service === "shipping-kit" ||
          service === "shipping_kit";

        const fee = isShippingKit ? SHIPPING_KIT_FEE : 0;

        return sum + (base + fee) * qty;
      }, 0),
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
            transition={{ duration: 0.3 }}
            onClick={close}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <motion.aside
            data-bag-panel
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-[min(92vw,420px)] border-l border-black bg-white shadow-2xl"
          >
            <div className="flex h-16 items-center justify-between border-b border-black px-6">
              <p className="font-display text-[20px] leading-none uppercase tracking-tight">
                {t.bag}
              </p>

              <button
                type="button"
                onClick={close}
                className="ui-close inline-flex select-none items-center gap-2 font-ui text-[14px] group"
              >
                <span className="ui-close__inner">
                  <span className="inline-block">{t.close}</span>
                  <img
                    src={arrowUpRightIcon}
                    alt=""
                    aria-hidden="true"
                    className="h-3 w-3 select-none transition-transform duration-300 ease-out group-hover:rotate-45"
                  />
                </span>
              </button>
            </div>

            <div className="flex h-[calc(100vh-64px)] flex-col">
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-6 py-10 text-center font-ui text-[14px] text-black/60 italic"
                  >
                    {t.bagEmpty}
                  </motion.div>
                ) : (
                  <div className="divide-y divide-black/5">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => {
                        const pid =
                          item.productId ??
                          item.id ??
                          item.product?.id ??
                          item.product?.productId ??
                          String(item.key || "").split("|")[0];
                        const resolvedProduct = getProductById(pid);
                        const product = resolvedProduct || item.product || null;
                        const availableColors = getAvailableColors(product);
                        const currentColor = getEffectiveColor(product, item);
                        const currentSize = getEffectiveSize(
                          product,
                          currentColor,
                          item,
                        );
                        const variantStock = resolvedProduct
                          ? getVariantStock(product, currentColor, currentSize)
                          : null;
                        const isSoldOut = resolvedProduct
                          ? variantStock <= 0
                          : false;
                        const itemQuantity = Math.max(
                          1,
                          Number(item.quantity || 1),
                        );
                        const reachedMaxStock = resolvedProduct
                          ? variantStock > 0
                            ? itemQuantity >= variantStock
                            : true
                          : false;

                        return (
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={item.key}
                            className="px-6 py-6"
                          >
                            <div className="grid grid-cols-[90px_1fr] gap-5">
                              <div className="h-[110px] w-[90px] overflow-hidden bg-black/5">
                                <img
                                  src={item.image}
                                  alt={item.name || ""}
                                  className="h-full w-full select-none object-cover"
                                  loading="lazy"
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <p className="font-display text-[18px] leading-tight">
                                    {item.name}
                                  </p>
                                  <div className="text-right">
                                    <p className="whitespace-nowrap font-ui text-[14px]">
                                      {fmtPrice(
                                        (Number(item.price) || 0) +
                                          (String(item?.serviceOption)
                                            .toLowerCase()
                                            .includes("shipping")
                                            ? 15
                                            : 0),
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3">
                                  {product?.category === "personal" && (
                                    <div className="bg-black/5 px-3 py-2">
                                      <p className="font-ui text-[12px] text-black/50">
                                        {t.serviceOption}
                                      </p>
                                      <select
                                        className="mt-1 w-full bg-transparent font-ui text-[13px] outline-none"
                                        value={item.serviceOption || "shipping"}
                                        onChange={(e) =>
                                          updateServiceOption(
                                            item.key,
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value="shipping">
                                          {t.shippingKit} (+15€)
                                        </option>
                                        <option value="in_store">
                                          {t.inStore}
                                        </option>
                                      </select>
                                    </div>
                                  )}
                                  <div className="bg-black/5 px-3 py-2">
                                    <p className="font-ui text-[12px] text-black/50">
                                      {t.color}
                                    </p>
                                    <select
                                      className="mt-1 w-full bg-transparent font-ui text-[13px] outline-none"
                                      value={currentColor}
                                      onChange={(e) => {
                                        const nextColor = e.target.value;
                                        const nextSize = getFirstAvailableSize(
                                          product,
                                          nextColor,
                                        );
                                        updateVariant(item.key, {
                                          color: nextColor,
                                          size: nextSize,
                                          image: pickVariantImage(
                                            product,
                                            nextColor,
                                            nextSize,
                                          ),
                                        });
                                      }}
                                    >
                                      {availableColors.map((c) => (
                                        <option key={c} value={c}>
                                          {c}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between gap-4">
                                  <div className="inline-flex h-10 items-stretch border border-black bg-white">
                                    <button
                                      className="grid w-9 place-items-center bg-black/5 disabled:opacity-30"
                                      disabled={itemQuantity <= 1}
                                      onClick={() => dec(item.key)}
                                    >
                                      –
                                    </button>
                                    <div className="grid w-9 place-items-center border-x border-black font-ui text-[13px]">
                                      {itemQuantity}
                                    </div>
                                    <button
                                      className="grid w-9 place-items-center bg-black/5 disabled:opacity-30"
                                      disabled={isSoldOut || reachedMaxStock}
                                      onClick={() => inc(item.key)}
                                    >
                                      +
                                    </button>
                                  </div>

                                  <button
                                    className="p-2 transition-opacity hover:opacity-50"
                                    onClick={() => removeItem(item.key)}
                                  >
                                    <img
                                      src={trashIcon}
                                      alt=""
                                      className="h-5 w-5 opacity-60"
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Checkout */}
              <div className="border-t border-black p-6 bg-white">
                <button
                  type="button"
                  className="ui-interact flex h-12 w-full items-center justify-center gap-4 bg-black font-ui text-[14px] text-white transition-transform active:scale-[0.98] disabled:opacity-50"
                  onClick={() => {
                    close();
                    navigate("/checkout");
                  }}
                  disabled={items.length === 0}
                >
                  <span>{t.checkout}</span>
                  <span className="inline-block h-px w-10 bg-white/90" />
                  <span className="font-ui">{fmtPrice(subtotal)}</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
