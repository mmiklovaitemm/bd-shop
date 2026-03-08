import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "@/lib/api";

import useBagDrawer from "@/store/useBagDrawer";
import useCart from "@/store/useCart";
import preventDragHandler from "@/utils/preventDrag";

import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";
import trashIcon from "@/assets/ui/trash.svg";

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:4000";

const fmtPrice = (n) =>
  new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

const pickVariantImage = (product, color) => {
  if (!product) return "";
  const c = color || product.colors?.[0] || "silver";
  return (
    product?.variants?.[c]?.[0] ||
    product?.variants?.[product?.colors?.[0]]?.[0] ||
    product?.thumbnail ||
    ""
  );
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

  const [products, setProducts] = useState([]);

  useEffect(() => {
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
  }, []);

  const productsById = useMemo(() => {
    const m = new Map();
    for (const p of products) m.set(String(p.id), p);
    return m;
  }, [products]);

  const getProductById = useCallback(
    (id) => productsById.get(String(id)) || null,
    [productsById],
  );
  useEffect(() => {
    items.forEach((item) => {
      const pid =
        item.productId ??
        item.id ??
        item.product?.id ??
        item.product?.productId ??
        String(item.key || "").split("|")[0];

      const product = getProductById(pid) || item.product || null;
      const availableSizes = product?.sizes || [];

      if (!item.size && availableSizes.length > 0) {
        updateVariant(item.key, {
          color: item.color || product?.colors?.[0] || "silver",
          size: availableSizes[0],
          image: pickVariantImage(
            product,
            item.color || product?.colors?.[0] || "silver",
          ),
        });
      }
    });
  }, [items, getProductById, updateVariant]);

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
      {/* overlay */}
      <button
        type="button"
        aria-label="Close bag"
        onClick={close}
        className={[
          "absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      {/* panel */}
      <aside
        data-bag-panel
        className={[
          "absolute top-0 right-0 h-full w-[min(92vw,420px)] bg-white border-l border-black",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* HEADER */}
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

        {/* BODY */}
        <div className="flex flex-col h-[calc(100vh-64px)]">
          {/* ITEMS */}
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
                const availableColors = product?.colors || [];
                const availableSizes = product?.sizes || [];
                const currentColor =
                  item.color || availableColors[0] || "silver";

                const currentSize =
                  item.size ||
                  (availableSizes.length ? availableSizes[0] : null);

                const hasSizes = availableSizes.length > 0;
                const hasColors = availableColors.length > 0;

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
                      {/* image */}
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

                      {/* content */}
                      <div className="min-w-0">
                        {/* top row */}
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-display text-[18px] leading-tight">
                            {item.name}
                          </p>
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

                        {/* VARIANT CONTROLS */}
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          {product?.category === "personal" ? (
                            <div className=" bg-black/5 px-3 py-2">
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

                          {/* COLOR */}
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
                                  const nextImage = pickVariantImage(
                                    product,
                                    nextColor,
                                  );

                                  updateVariant(item.key, {
                                    color: nextColor,
                                    size: currentSize,
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

                          {/* SIZE */}
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

                        {/* qty + trash */}
                        <div className="mt-4 flex items-center justify-between gap-4">
                          {/* qty control */}
                          <div className="inline-flex items-stretch border border-black h-10 bg-white">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              className="w-9 grid place-items-center font-ui text-[18px] select-none bg-black/5 lg:hover:bg-black/10"
                              onClick={(e) => {
                                e.preventDefault();
                                dec(item.key);
                              }}
                            >
                              –
                            </button>

                            <div className="w-9 grid place-items-center font-ui text-[13px] border-x border-black bg-white">
                              {item.quantity || 1}
                            </div>

                            <button
                              type="button"
                              aria-label="Increase quantity"
                              className="w-9 grid place-items-center font-ui text-[18px] select-none bg-black/5 lg:hover:bg-black/10"
                              onClick={(e) => {
                                e.preventDefault();
                                inc(item.key);
                              }}
                            >
                              +
                            </button>
                          </div>

                          {/* trash */}
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

                        {/* optional note bar */}
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

          {/* FOOTER */}
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
