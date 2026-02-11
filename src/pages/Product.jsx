// src/pages/Product.jsx
import { useMemo, useState, useEffect, useCallback } from "react";
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

import arrowLeftIcon from "@/assets/ui/arrow-left.svg";
import arrowRightIcon from "@/assets/ui/arrow-right.svg";

import FullWidthDivider from "@/components/ui/FullWidthDivider";

// ===== Constants =====
const COLOR_NAMES = {
  silver: "Silver",
  gold: "Gold",
  "soft-blue": "Soft blue",
  "soft-green": "Soft green",
};

const COLOR_VARIANTS = {
  gold: {
    active: "bg-white text-[#c58a2a] border-[#c58a2a]",
    default: "bg-white text-black border-black/40 hover:bg-black/5",
  },
  default: {
    active: "bg-black/60 text-white border-black/60",
    default: "bg-white text-black border-black/40 hover:bg-black/5",
  },
};

const HOVER_CLASSES = {
  btn: "transition-all duration-300 ease-out will-change-transform hover:-translate-y-[2px]",
  iconBtn:
    "transition-transform duration-300 ease-out hover:-translate-y-[2px] hover:scale-105",
  group:
    "transition-transform duration-300 ease-out will-change-transform group-hover:translate-x-[-1px] group-hover:-translate-y-[1px]",
};

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");
const formatColor = (color) => COLOR_NAMES[color] || color;
const getVariantColorStyles = (color, isActive) => {
  const variant =
    color === "gold" ? COLOR_VARIANTS.gold : COLOR_VARIANTS.default;
  return isActive ? variant.active : variant.default;
};

// ===== Sub-Components =====
const ImageGallery = ({ images, product, openLightbox, btnHover }) => {
  if (!images.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-4 lg:grid-cols-2">
      {images.slice(0, 2).map((src, index) => (
        <button
          key={index}
          type="button"
          onClick={() => openLightbox(index)}
          aria-label={`Open image ${index + 1}`}
          className={joinClasses(
            "group aspect-[3/4] md:aspect-auto md:h-[280px] lg:h-[560px] overflow-hidden bg-black/5 relative text-left",
            btnHover,
          )}
        >
          <img
            src={src}
            alt={`${product.name} - photo ${index + 1}`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 ease-out group-hover:bg-black/5" />
        </button>
      ))}
    </div>
  );
};

const ProductInfo = ({
  product,
  selectedSize,
  selectedColor,
  setSelectedSize,
  setSelectedColor,
  qty,
  setQty,
  btnHover,
  iconBtnHover,
  onAddToBag,
  onAddToWishlist,
  onOpenDetails,
}) => {
  return (
    <div className="md:pt-1">
      {/* Title + Price */}
      <div className="mt-5 md:mt-0 flex items-end justify-between gap-4">
        <h1 className="font-display font-medium text-[28px] leading-none">
          "{product.name}"
        </h1>
        <p className="font-ui text-[16px] text-black/90">{product.price}</p>
      </div>

      {/* Size Selector */}
      <div className="mt-5">
        <p className="font-ui text-[13px] text-black/70">Size:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(product.sizes || []).length ? (
            product.sizes.map((size) => {
              const active = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={joinClasses(
                    "h-10 min-w-12 px-3 border font-ui text-[13px]",
                    btnHover,
                    active
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black/40 hover:bg-black/5",
                  )}
                >
                  {size}
                </button>
              );
            })
          ) : (
            <p className="font-ui text-[13px] text-black/50">One size</p>
          )}
        </div>
      </div>

      {/* Color Selector */}
      <div className="mt-5">
        <p className="font-ui text-[13px] text-black/70">Color:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(product.colors || []).map((color) => {
            const active = selectedColor === color;
            const hasVariant = (product.variants?.[color] || []).length > 0;
            const colorClasses = getVariantColorStyles(color, active);

            return (
              <button
                key={color}
                type="button"
                disabled={!hasVariant}
                onClick={() => setSelectedColor(color)}
                className={joinClasses(
                  "h-10 px-4 border font-ui text-[13px]",
                  btnHover,
                  !hasVariant ? "opacity-40 cursor-not-allowed" : "",
                  colorClasses,
                )}
              >
                {formatColor(color)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="mt-5">
        <p className="font-ui text-[13px] text-black/70">Quantity:</p>
        <div className="mt-2 inline-flex items-center border border-black/30 h-10">
          <button
            type="button"
            className={joinClasses("w-10 h-10 text-[18px]", btnHover)}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            –
          </button>
          <div className="w-10 text-center font-ui text-[13px]">{qty}</div>
          <button
            type="button"
            className={joinClasses("w-10 h-10 text-[18px]", btnHover)}
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-stretch gap-3">
        <div className="flex-1">
          <AddToBagButton
            onClick={onAddToBag}
            icon={bagIcon}
            label="Add to bag"
            ariaLabel={`Add ${product.name} to bag`}
            className="!w-full !h-12 !text-[13px] !min-w-0 !justify-center !border-black !bg-black !text-white hover:!scale-[1.02] hover:!-translate-y-0.5"
          />
        </div>
        <button
          type="button"
          aria-label="Add to wishlist"
          className={joinClasses(
            "h-12 w-12 border border-black/30 flex items-center justify-center bg-white",
            iconBtnHover,
          )}
          onClick={onAddToWishlist}
        >
          <img src={heartIcon} alt="" aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      {/* Details Trigger */}
      <div className="mt-6">
        <div className="bg-black/5 px-4 py-3">
          <button
            type="button"
            onClick={onOpenDetails}
            className={joinClasses(
              "group w-full flex items-center justify-between font-ui text-[13px] text-black",
              btnHover,
            )}
          >
            <span className="underline underline-offset-4">
              Dimensions & details
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

      {/* Benefits */}
      <div className="mt-6 mb-6 border-t border-black pt-5 grid grid-cols-2 gap-y-4 md:gap-6 gap-x-6">
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
  );
};

const DetailsPanel = ({ isOpen, onClose, product }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <aside className="absolute right-0 top-0 h-full w-[92%] max-w-[520px] bg-white border-l border-black flex flex-col">
        <div className="h-14 px-4 flex items-center justify-between border-b border-black shrink-0">
          <h2 className="font-display text-[20px]">Dimensions & details</h2>
          <button
            type="button"
            onClick={onClose}
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
          <DetailsContent product={product} />
        </div>
      </aside>
    </div>
  );
};

const DetailsContent = ({ product }) => {
  const details = useMemo(() => {
    const items = [];
    if (product.colors?.length)
      items.push({
        label: "Material options",
        value: product.colors.join(", "),
      });
    if (product.surface)
      items.push({ label: "Surface", value: product.surface });
    items.push({
      label: "Gemstones",
      value: product.gemstones?.length ? product.gemstones.join(", ") : "none",
    });
    if (typeof product.hasGem === "boolean")
      items.push({ label: "Has gem", value: product.hasGem ? "yes" : "no" });
    if (product.sizes?.length)
      items.push({ label: "Available sizes", value: product.sizes.join(", ") });
    if (product.isBestSeller)
      items.push({ label: "Tag", value: "Best seller" });
    if (product.createdAt)
      items.push({ label: "Created", value: product.createdAt });
    return items;
  }, [product]);

  return (
    <div className="font-ui text-[14px] text-black/80 space-y-4 leading-relaxed">
      {details.map((item, index) => (
        <div key={index} className="space-y-2">
          <p className="text-black/70 text-[12px]">{item.label}</p>
          <p>{item.value}</p>
        </div>
      ))}
    </div>
  );
};

const Lightbox = ({
  isOpen,
  onClose,
  images,
  activeImgIndex,
  setActiveImgIndex,
  product,
}) => {
  const hasManyImages = images.length > 1;

  const goPrev = useCallback(
    () => setActiveImgIndex((i) => (i - 1 + images.length) % images.length),
    [images.length, setActiveImgIndex],
  );
  const goNext = useCallback(
    () => setActiveImgIndex((i) => (i + 1) % images.length),
    [images.length, setActiveImgIndex],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !hasManyImages) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasManyImages, onClose, goPrev, goNext]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close image preview"
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />
      <div className="absolute inset-0 flex flex-col">
        <div className="h-14 px-4 md:px-6 flex items-center justify-between border-b border-white/15 text-white bg-black">
          <div className="font-ui text-[13px] text-white/80">
            {activeImgIndex + 1} / {images.length}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="group inline-flex items-center gap-2 font-ui text-[14px] cursor-pointer"
          >
            <span className="inline-flex items-center gap-2 transition-transform duration-300 ease-out will-change-transform group-hover:translate-x-[1px] group-hover:-translate-y-[1px]">
              <span className="inline-block">Close</span>
              <img
                src={arrowUpRightIcon}
                alt=""
                aria-hidden="true"
                className="h-3 w-3 invert transition-transform duration-300 ease-out"
              />
            </span>
          </button>
        </div>
        <div className="relative flex-1 flex items-center justify-center p-4 md:p-6">
          {hasManyImages && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous image"
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-11 w-11 md:h-12 md:w-12 border border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 ease-out hover:-translate-y-[calc(50%+2px)] hover:scale-105"
            >
              <img
                src={arrowLeftIcon}
                alt=""
                aria-hidden="true"
                className="h-4 w-4 invert"
              />
            </button>
          )}
          <img
            src={images[activeImgIndex]}
            alt={`${product.name} - zoom`}
            className="max-h-[78vh] md:max-h-[82vh] max-w-[92vw] object-contain select-none"
            draggable="false"
          />
          {hasManyImages && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next image"
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-11 w-11 md:h-12 md:w-12 border border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 ease-out hover:-translate-y-[calc(50%+2px)] hover:scale-105"
            >
              <img
                src={arrowRightIcon}
                alt=""
                aria-hidden="true"
                className="h-4 w-4 invert"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== Main Component =====
export default function Product() {
  const { id } = useParams();
  const product = useMemo(() => PRODUCTS.find((p) => p.id === id), [id]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    () => product?.colors?.[0] || "silver",
  );
  const [selectedSize, setSelectedSize] = useState(
    () => product?.sizes?.[0] || null,
  );

  // Images: 1 depends on selectedColor, 2 stays silver
  const images = useMemo(() => {
    if (!product) return [];
    const color = selectedColor || "silver";
    const chosenArr =
      product.variants?.[color] || product.variants?.silver || [];
    const first = chosenArr[0] || product.thumbnail || "";
    const silverArr = product.variants?.silver || [];
    const second = silverArr[1] || chosenArr[1] || silverArr[0] || first;
    return [first, second].filter(Boolean);
  }, [product, selectedColor]);

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const openLightbox = (index) => {
    setActiveImgIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => setIsLightboxOpen(false);

  // Handlers
  const handleAddToBag = () => {
    console.log("Add to bag:", {
      product: product?.name,
      color: selectedColor,
      size: selectedSize,
      quantity: qty,
    });
  };

  const handleAddToWishlist = () => {
    console.log("Add to wishlist:", product?.name);
  };

  // Not found state
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
          <span
            className={joinClasses(
              "inline-flex items-center gap-2",
              HOVER_CLASSES.group,
            )}
          >
            <img
              src={backIcon}
              alt=""
              aria-hidden="true"
              className="h-3 w-3 transition-transform duration-300 ease-out"
            />
            <span>Back</span>
          </span>
        </Link>
      </div>

      {/* Product Layout */}
      <div className="md:grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_420px] md:gap-8 lg:gap-10 md:items-start md:mb-5">
        <ImageGallery
          images={images}
          product={product}
          openLightbox={openLightbox}
          btnHover={HOVER_CLASSES.btn}
        />
        <ProductInfo
          product={product}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          setSelectedSize={setSelectedSize}
          setSelectedColor={setSelectedColor}
          qty={qty}
          setQty={setQty}
          btnHover={HOVER_CLASSES.btn}
          iconBtnHover={HOVER_CLASSES.iconBtn}
          onAddToBag={handleAddToBag}
          onAddToWishlist={handleAddToWishlist}
          onOpenDetails={() => setIsDetailsOpen(true)}
        />
      </div>

      <DetailsPanel
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        product={product}
      />
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
        images={images}
        activeImgIndex={activeImgIndex}
        setActiveImgIndex={setActiveImgIndex}
        product={product}
      />

      <FullWidthDivider />
    </main>
  );
}
