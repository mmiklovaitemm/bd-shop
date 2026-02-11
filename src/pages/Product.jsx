// src/pages/Product.jsx
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { PRODUCTS } from "@/data/products";
import AddToBagButton from "@/components/ui/AddToBagButton";

import backIcon from "@/assets/ui/product_page_back_icon.svg";
import heartIcon from "@/assets/ui/heart.svg";
import bagIcon from "@/assets/ui/shopping-bag.svg";

import warrantyIcon from "@/assets/ui/warranty.svg";
import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";
import deliveryIcon from "@/assets/ui/delivery.svg";
import starIcon from "@/assets/ui/star.svg";
import returnIcon from "@/assets/ui/return-box.svg";

import FullWidthDivider from "@/components/ui/FullWidthDivider";

export default function Product() {
  const { id } = useParams();

  const product = useMemo(() => PRODUCTS.find((p) => p.id === id), [id]);

  // Shared hover classes for buttons
  const btnHover =
    "transition-all duration-300 ease-out will-change-transform hover:-translate-y-[2px]";
  const iconBtnHover =
    "transition-transform duration-300 ease-out hover:-translate-y-[2px] hover:scale-105";

  // UI state - using lazy initialization to avoid useEffect
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(() => {
    if (!product) return "silver";
    return product.colors?.[0] ?? "silver";
  });
  const [selectedSize, setSelectedSize] = useState(() => {
    if (!product) return null;
    return product.sizes?.[0] ?? null;
  });
  const [qty, setQty] = useState(1);

  // Images: 1 depends on selectedColor, 2 stays silver (for now)
  const images = useMemo(() => {
    if (!product) return [];

    const color = selectedColor || "silver";
    const chosenArr =
      product.variants?.[color] || product.variants?.silver || [];
    const first = chosenArr[0] || product.thumbnail || "";

    const silverArr = product.variants?.silver || [];
    const second = silverArr[1] || silverArr[0] || product.thumbnail || "";

    return [first, second].filter(Boolean);
  }, [product, selectedColor]);

  const prettyColor = (c) => {
    if (c === "silver") return "Silver";
    if (c === "gold") return "Gold";
    if (c === "soft-blue") return "Soft blue";
    if (c === "soft-green") return "Soft green";
    return c;
  };

  if (!product) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-10">
        <p className="font-ui text-[14px]">Product not found.</p>
        <Link to="/collections" className="mt-4 inline-block underline">
          Back to Collections
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full md:max-w-[1200px] lg:max-w-none px-4 md:px-1 lg:px-2 py-4 md:py-4">
      {/* Back */}
      <div className="mb-4">
        <Link
          to="/collections"
          className="group inline-flex items-center font-ui text-[14px] text-black/80"
        >
          <span className="inline-flex items-center gap-2 transition-transform duration-300 ease-out will-change-transform group-hover:translate-x-[-1px] group-hover:-translate-y-[1px]">
            <img
              src={backIcon}
              alt=""
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 ease-out"
            />
            <span>Back</span>
          </span>
        </Link>
      </div>

      {/* ====== TABLET / DESKTOP WRAPPER ====== */}
      <div className="md:grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_420px] md:gap-8 lg:gap-10 md:items-start md:mb-5">
        {/* LEFT: Gallery */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-4 lg:grid-cols-2">
          <div className="group aspect-[3/4] md:aspect-auto md:h-[280px] lg:h-[560px] overflow-hidden bg-black/5 relative">
            <img
              src={images[0]}
              alt={`${product.name} - photo 1`}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              loading="eager"
              decoding="async"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 ease-out group-hover:bg-black/5" />
          </div>

          <div className="group aspect-[3/4] md:aspect-auto md:h-[280px] lg:h-[560px] overflow-hidden bg-black/5 relative">
            <img
              src={images[1] || images[0]}
              alt={`${product.name} - photo 2`}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              loading="lazy"
              decoding="async"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 ease-out group-hover:bg-black/5" />
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="md:pt-1">
          {/* Title + Price */}
          <div className="mt-5 md:mt-0 flex items-end justify-between gap-4">
            <h1 className="font-display font-medium text-[28px] leading-none">
              “{product.name}”
            </h1>
            <p className="font-ui text-[16px] text-black/90">{product.price}</p>
          </div>

          {/* Size */}
          <div className="mt-5">
            <p className="font-ui text-[13px] text-black/70">Size:</p>

            <div className="mt-2 flex flex-wrap gap-2">
              {(product.sizes || []).length ? (
                product.sizes.map((s) => {
                  const active = selectedSize === s;

                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={[
                        "h-10 min-w-12 px-3 border font-ui text-[13px]",
                        btnHover,
                        active
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-black/40 hover:bg-black/5",
                      ].join(" ")}
                    >
                      {s}
                    </button>
                  );
                })
              ) : (
                <p className="font-ui text-[13px] text-black/50">One size</p>
              )}
            </div>
          </div>

          {/* Color */}
          <div className="mt-5">
            <p className="font-ui text-[13px] text-black/70">Color:</p>

            <div className="mt-2 flex flex-wrap gap-2">
              {(product.colors || []).map((c) => {
                const active = selectedColor === c;
                const isGold = c === "gold";
                const hasVariant = (product.variants?.[c] || []).length > 0;

                const activeCls = isGold
                  ? "bg-white text-[#c58a2a] border-[#c58a2a]"
                  : "bg-black/60 text-white border-black/60";

                return (
                  <button
                    key={c}
                    type="button"
                    disabled={!hasVariant}
                    onClick={() => setSelectedColor(c)}
                    className={[
                      "h-10 px-4 border font-ui text-[13px]",
                      btnHover,
                      !hasVariant ? "opacity-40 cursor-not-allowed" : "",
                      active
                        ? activeCls
                        : "bg-white text-black border-black/40 hover:bg-black/5",
                    ].join(" ")}
                  >
                    {prettyColor(c)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-5">
            <p className="font-ui text-[13px] text-black/70">Quantity:</p>

            <div className="mt-2 inline-flex items-center border border-black/30 h-10">
              <button
                type="button"
                className={["w-10 h-10 text-[18px]", btnHover].join(" ")}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                –
              </button>

              <div className="w-10 text-center font-ui text-[13px]">{qty}</div>

              <button
                type="button"
                className={["w-10 h-10 text-[18px]", btnHover].join(" ")}
                onClick={() => setQty((q) => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to bag + Wishlist */}
          <div className="mt-6 flex items-stretch gap-3">
            <div className="flex-1">
              <AddToBagButton
                onClick={() => {}}
                icon={bagIcon}
                label="Add to bag"
                ariaLabel={`Add ${product.name} to bag`}
                className="!w-full !h-12 !min-w-0 !justify-center !border-black !bg-black !text-white hover:!scale-[1.02] hover:!-translate-y-0.5"
              />
            </div>

            <button
              type="button"
              aria-label="Add to wishlist"
              className={[
                "h-12 w-12 border border-black/30 flex items-center justify-center bg-white",
                iconBtnHover,
              ].join(" ")}
              onClick={() => {}}
            >
              <img
                src={heartIcon}
                alt=""
                aria-hidden="true"
                className="h-4 w-4"
              />
            </button>
          </div>

          {/* Dimensions & details trigger */}
          <div className="mt-6">
            <div className="bg-black/5 px-4 py-3">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(true)}
                className={[
                  "group w-full flex items-center justify-between font-ui text-[13px] text-black",
                  btnHover,
                ].join(" ")}
              >
                <span className="underline underline-offset-4">
                  Dimensions &amp; details
                </span>

                <img
                  src={arrowUpRightIcon}
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
                />
              </button>
            </div>
          </div>

          {/* Benefits row */}
          <div className="mt-6 mb-6 border-t  border-black pt-5 grid grid-cols-2 gap-y-4 md:gap-6 gap-x-6">
            <div className="flex items-center md:mt-4 gap-2 font-ui text-[14px] text-black/80">
              <img
                src={warrantyIcon}
                alt=""
                aria-hidden="true"
                className="h-4 w-4 invert"
              />
              2 Year Warranty
            </div>

            <div className="flex items-center md:mt-4 gap-2 font-ui text-[14px] text-black/80">
              <img
                src={deliveryIcon}
                alt=""
                aria-hidden="true"
                className="h-4 w-4 invert"
              />
              Fast Delivery
            </div>

            <div className="flex items-center gap-2 font-ui text-[14px] text-black/80">
              <img
                src={starIcon}
                alt=""
                aria-hidden="true"
                className="h-4 w-4 invert"
              />
              High Quality
            </div>

            <div className="flex items-center gap-2 font-ui text-[14px] text-black/80">
              <img
                src={returnIcon}
                alt=""
                aria-hidden="true"
                className="h-4 w-4 invert"
              />
              90 - Day Return
            </div>
          </div>
        </div>
      </div>

      {/* Details slide-in panel (mobile/tablet/desktop) */}
      {isDetailsOpen ? (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Close details"
            onClick={() => setIsDetailsOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <aside
            className="
              absolute right-0 top-0 h-full
              w-[92%] max-w-[520px]
              bg-white border-l border-black
              flex flex-col
            "
          >
            <div className="h-14 px-4 flex items-center justify-between border-b border-black shrink-0">
              <h2 className="font-display text-[20px]">
                Dimensions &amp; details
              </h2>

              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="group inline-flex items-center gap-2 font-ui text-[14px] transition-all duration-300 ease-out hover:-translate-y-[2px]"
              >
                <span>Close</span>
                <img
                  src={arrowUpRightIcon}
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
                />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="font-ui text-[14px] text-black/80 space-y-4 leading-relaxed">
                <div className="space-y-2">
                  <p className="text-black/70 text-[12px]">Material options</p>
                  <p>{product.colors.join(", ")}</p>
                </div>

                {product.surface ? (
                  <div className="space-y-2">
                    <p className="text-black/70 text-[12px]">Surface</p>
                    <p>{product.surface}</p>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <p className="text-black/70 text-[12px]">Gemstones</p>
                  <p>
                    {(product.gemstones || []).length
                      ? product.gemstones.join(", ")
                      : "none"}
                  </p>
                </div>

                {typeof product.hasGem === "boolean" ? (
                  <div className="space-y-2">
                    <p className="text-black/70 text-[12px]">Has gem</p>
                    <p>{product.hasGem ? "yes" : "no"}</p>
                  </div>
                ) : null}

                {(product.sizes || []).length ? (
                  <div className="space-y-2">
                    <p className="text-black/70 text-[12px]">Available sizes</p>
                    <p>{product.sizes.join(", ")}</p>
                  </div>
                ) : null}

                {product.isBestSeller ? (
                  <div className="space-y-2">
                    <p className="text-black/70 text-[12px]">Tag</p>
                    <p>Best seller</p>
                  </div>
                ) : null}

                {product.createdAt ? (
                  <div className="space-y-2">
                    <p className="text-black/70 text-[12px]">Created</p>
                    <p>{product.createdAt}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <FullWidthDivider />
    </main>
  );
}
