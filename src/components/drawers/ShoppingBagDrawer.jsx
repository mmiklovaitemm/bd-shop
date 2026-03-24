import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "@/lib/api";

import useBagDrawer from "@/store/useBagDrawer";
import useCart from "@/store/useCart";
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

  return colors.filter((color) => {
    const entries = product?.variants?.[color] || [];
    return entries.some((variant) => Number(variant?.stock || 0) > 0);
  });
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

  return getColorEntries(product, color)
    .filter((variant) => Number(variant?.stock || 0) > 0)
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

      const product = getProductById(pid) || item.product || null;
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
    <div
      className={[
        "fixed inset-0 z-[90] transition-opacity duration-300 ease-out select-none",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
      ].join(" ")}
      onDragStart={preventDragHandler}
    >
      <button
        type="button"
        aria-label="Close bag"
        onClick={close}
        className={[
          "absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      <aside
        data-bag-panel
        className={[
          "absolute top-0 right-0 h-full w-[min(92vw,420px)] bg-white border-l border-black",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-black">
          <p className="font-display text-[20px] leading-none">Bag</p>

          <button
            type="button"
            onClick={close}
            className="ui-close inline-flex items-center gap-2 font-ui text-[14px] select-none"
          >
            <span className="ui-close__inner">
              <span className="inline-block">Close</span>
              <img
                src={arrowUpRightIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
                onDragStart={preventDragHandler}
                className="h-3 w-3 transition-transform duration-300 ease-out select-none"
              />
            </span>
          </button>
        </div>

        <div className="flex flex-col h-[calc(100vh-64px)]">
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-6 py-10 text-center font-ui text-[14px] text-black/60">
                Your bag is empty.
              </div>
            ) : (
              items.map((item, idx) => {
                const isLast = idx === items.length - 1;

                const pid =
                  item.productId ??
                  item.id ??
                  item.product?.id ??
                  item.product?.productId ??
                  String(item.key || "").split("|")[0];

                const product = getProductById(pid) || item.product || null;

                const availableColors = getAvailableColors(product);
                const currentColor = getEffectiveColor(product, item);
                const availableSizes = getAvailableSizesForColor(
                  product,
                  currentColor,
                );
                const currentSize = getEffectiveSize(
                  product,
                  currentColor,
                  item,
                );

                const hasSizes = availableSizes.length > 0;
                const hasColors = availableColors.length > 0;

                const variantStock = getVariantStock(
                  product,
                  currentColor,
                  currentSize,
                );

                const isSoldOut = variantStock <= 0;
                const itemQuantity = Math.max(1, Number(item.quantity || 1));
                const reachedMaxStock =
                  variantStock > 0 ? itemQuantity >= variantStock : true;

                return (
                  <div
                    key={item.key}
                    className={[
                      "px-6 py-6",
                      idx !== 0 ? "border-t border-black/80" : "",
                      isLast ? "border-b border-black/80" : "",
                    ].join(" ")}
                  >
                    <div className="grid grid-cols-[90px_1fr] gap-5">
                      <div className="w-[90px] h-[110px] bg-black/5 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name || ""}
                          draggable={false}
                          onDragStart={preventDragHandler}
                          className="w-full h-full object-cover select-none"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-display text-[18px] leading-tight">
                            {item.name}
                          </p>

                          {isSoldOut ? (
                            <p className="mt-1 font-ui text-[12px] uppercase tracking-[0.08em] text-red-600">
                              Sold out
                            </p>
                          ) : (
                            <p className="mt-1 font-ui text-[12px] text-black/55">
                              In stock: {variantStock}
                            </p>
                          )}

                          {(() => {
                            const base = Number(item.price) || 0;

                            const service = String(
                              item.serviceOption || "",
                            ).toLowerCase();
                            const isShippingKit =
                              service === "shipping" ||
                              service === "shipping-kit" ||
                              service === "shipping_kit";

                            const fee = isShippingKit ? 15 : 0;
                            const unitTotal = base + fee;

                            return (
                              <div className="text-right">
                                <p className="font-ui text-[14px] whitespace-nowrap">
                                  {fmtPrice(unitTotal)}
                                </p>

                                {fee > 0 ? (
                                  <p className="mt-1 font-ui text-[12px] text-black/60 whitespace-nowrap">
                                    Shipping kit + {fmtPrice(fee)}
                                  </p>
                                ) : null}
                              </div>
                            );
                          })()}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                          {product?.category === "personal" ? (
                            <div className="bg-black/5 px-3 py-2">
                              <p className="font-ui text-[12px] text-black/50">
                                Service option
                              </p>

                              <select
                                className="mt-1 w-full bg-transparent font-ui text-[13px] text-black/80 outline-none"
                                value={item.serviceOption || "shipping"}
                                onChange={(e) =>
                                  updateServiceOption(item.key, e.target.value)
                                }
                              >
                                <option value="shipping">
                                  Shipping kit (+15€)
                                </option>
                                <option value="in_store">In-store</option>
                              </select>
                            </div>
                          ) : null}

                          <div className="bg-black/5 px-3 py-2">
                            <p className="font-ui text-[12px] text-black/50">
                              Color
                            </p>

                            {hasColors ? (
                              <select
                                className="mt-1 w-full bg-transparent font-ui text-[13px] text-black/80 outline-none"
                                value={currentColor}
                                onChange={(e) => {
                                  const nextColor = e.target.value;
                                  const nextSize = getFirstAvailableSize(
                                    product,
                                    nextColor,
                                  );
                                  const nextImage = pickVariantImage(
                                    product,
                                    nextColor,
                                    nextSize,
                                  );

                                  updateVariant(item.key, {
                                    color: nextColor,
                                    size: nextSize,
                                    image: nextImage,
                                  });
                                }}
                              >
                                {availableColors.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <p className="mt-1 font-ui text-[13px] text-black/60">
                                —
                              </p>
                            )}
                          </div>

                          <div className="bg-black/5 px-3 py-2">
                            <p className="font-ui text-[12px] text-black/50">
                              Size
                            </p>

                            {hasSizes ? (
                              <select
                                className="mt-1 w-full bg-transparent font-ui text-[13px] text-black/80 outline-none"
                                value={currentSize || ""}
                                onChange={(e) => {
                                  const nextSize = e.target.value || null;

                                  updateVariant(item.key, {
                                    color: currentColor,
                                    size: nextSize,
                                    image: pickVariantImage(
                                      product,
                                      currentColor,
                                      nextSize,
                                    ),
                                  });
                                }}
                              >
                                {availableSizes.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <p className="mt-1 font-ui text-[13px] text-black/60">
                                One size
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4">
                          <div className="inline-flex items-stretch border border-black h-10 bg-white">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              disabled={itemQuantity <= 1}
                              className="w-9 grid place-items-center font-ui text-[18px] select-none bg-black/5 lg:hover:bg-black/10 disabled:opacity-40 disabled:cursor-not-allowed"
                              onClick={(e) => {
                                e.preventDefault();
                                if (itemQuantity <= 1) return;
                                dec(item.key);
                              }}
                            >
                              –
                            </button>

                            <div className="w-9 grid place-items-center font-ui text-[13px] border-x border-black bg-white">
                              {itemQuantity}
                            </div>

                            <button
                              type="button"
                              aria-label="Increase quantity"
                              disabled={isSoldOut || reachedMaxStock}
                              className="w-9 grid place-items-center font-ui text-[18px] select-none bg-black/5 lg:hover:bg-black/10 disabled:opacity-40 disabled:cursor-not-allowed"
                              onClick={(e) => {
                                e.preventDefault();
                                if (isSoldOut || reachedMaxStock) return;
                                inc(item.key);
                              }}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            aria-label="Remove item"
                            className="p-2 select-none lg:hover:opacity-70"
                            onClick={(e) => {
                              e.preventDefault();
                              removeItem(item.key);
                            }}
                          >
                            <img
                              src={trashIcon}
                              alt=""
                              aria-hidden="true"
                              draggable={false}
                              onDragStart={preventDragHandler}
                              className="h-5 w-5 opacity-60 select-none"
                            />
                          </button>
                        </div>

                        {item.note ? (
                          <div className="mt-5 bg-black/55 text-white font-ui text-[13px] px-4 py-3">
                            {item.note}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-black p-6">
            <button
              type="button"
              className="ui-interact w-full h-12 bg-black text-white font-ui text-[14px] flex items-center justify-center gap-4 select-none disabled:opacity-50"
              onClick={(e) => {
                e.preventDefault();
                if (items.length === 0) return;

                close();
                navigate("/checkout");
              }}
              disabled={items.length === 0}
            >
              <span>Check out</span>
              <span className="inline-block h-px w-10 bg-white/90" />
              <span className="font-ui">{fmtPrice(subtotal)}</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
