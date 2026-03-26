import { memo } from "react";
import { FiHeart } from "react-icons/fi";

import useLanguage from "@/context/useLanguage";
import useFavorites from "@/context/useFavorites";

import cn from "@/utils/cn";
import preventDragHandler from "@/utils/preventDrag";

import AddToBagButton from "@/components/ui/AddToBagButton";

import bagIcon from "@/assets/ui/shopping-bag.svg";
import warrantyIcon from "@/assets/ui/warranty.svg";
import deliveryIcon from "@/assets/ui/delivery.svg";
import starIcon from "@/assets/ui/star.svg";
import returnIcon from "@/assets/ui/return-box.svg";
import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";

const BenefitItem = memo(function BenefitItem({ icon, text }) {
  return (
    <div className="flex items-center gap-2 select-none font-ui text-[14px] text-black/80">
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        draggable={false}
        onDragStart={preventDragHandler}
        className="h-4 w-4 select-none"
      />
      {text}
    </div>
  );
});

const ProductBenefits = memo(function ProductBenefits() {
  const { t } = useLanguage();

  const benefits = [
    { icon: warrantyIcon, text: t.twoYearWarranty },
    { icon: deliveryIcon, text: t.fastDelivery },
    { icon: starIcon, text: t.highQuality },
    { icon: returnIcon, text: t.ninetyDayReturn },
  ];

  return (
    <div className="mb-6 mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-black pt-5 md:gap-6">
      {benefits.map((benefit) => (
        <BenefitItem
          key={`${benefit.text}-${benefit.icon}`}
          icon={benefit.icon}
          text={benefit.text}
        />
      ))}
    </div>
  );
});

const SizeSelector = memo(function SizeSelector({
  sizes,
  availableSizes,
  selectedSize,
  onSelectSize,
  hoverBtnClass,
  usesVariantLevelStock,
}) {
  const { t } = useLanguage();

  if (!sizes?.length) {
    return (
      <p className="mt-2 font-ui text-[13px] text-black/50">{t.oneSize}</p>
    );
  }

  const normalizedSelectedSize =
    selectedSize == null ? null : String(selectedSize);

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {sizes.map((size) => {
        const normalizedSize = String(size);
        const isActive = normalizedSelectedSize === normalizedSize;
        const isAvailable = !usesVariantLevelStock
          ? true
          : availableSizes.includes(normalizedSize);

        return (
          <button
            key={normalizedSize}
            type="button"
            disabled={!isAvailable}
            onClick={() => isAvailable && onSelectSize(normalizedSize)}
            className={cn(
              "h-10 min-w-12 border px-3 font-ui text-[13px] select-none",
              hoverBtnClass,
              isActive
                ? "border-black bg-black text-white"
                : "border-black/40 bg-white text-black lg:hover:bg-black/5",
              !isAvailable ? "cursor-not-allowed opacity-35" : "",
            )}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
});

function toTitleCaseLabel(value) {
  return String(value || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const ColorSelector = memo(function ColorSelector({
  colors,
  availableColors,
  variants,
  selectedColor,
  onSelectColor,
  hoverBtnClass,
  usesVariantLevelStock,
}) {
  const { t } = useLanguage();

  const colorNames = {
    "soft-yellow": t.softYellow,
    "soft-blue": t.softBlue,
    "soft-green": t.softGreen,
    gold: t.gold,
    silver: t.silver,
    pearl: t.perlas,
  };

  const formatColorName = (color) => {
    const normalized = String(color || "")
      .trim()
      .toLowerCase();
    return colorNames[normalized] || toTitleCaseLabel(normalized);
  };

  const getVariantColorStyles = (color, isActive) => {
    const normalized = String(color || "")
      .trim()
      .toLowerCase();

    const styles = {
      "soft-yellow": {
        active: "bg-[#F2E3B6] text-black border-black/60",
        default: "bg-white text-black border-black/40 lg:hover:bg-black/5",
      },
      "soft-blue": {
        active: "bg-[#9FB6D5] text-black border-black/60",
        default: "bg-white text-black border-black/40 lg:hover:bg-black/5",
      },
      "soft-green": {
        active: "bg-[#AFC7B0] text-black border-black/60",
        default: "bg-white text-black border-black/40 lg:hover:bg-black/5",
      },
      gold: {
        active: "bg-white text-[#c58a2a] border-[#c58a2a]",
        default: "bg-white text-black border-black/40 lg:hover:bg-black/5",
      },
      silver: {
        active: "bg-black/60 text-white border-black/60",
        default: "bg-white text-black border-black/40 lg:hover:bg-black/5",
      },
      pearl: {
        active: "bg-[#F3EEE7] text-black border-black/60",
        default: "bg-white text-black border-black/40 lg:hover:bg-black/5",
      },
    };

    if (styles[normalized]) {
      return isActive ? styles[normalized].active : styles[normalized].default;
    }

    return isActive
      ? "bg-black text-white border-black"
      : "bg-white text-black border-black/40 lg:hover:bg-black/5";
  };

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {colors.map((color) => {
        const isActive = selectedColor === color;
        const hasVariant = !usesVariantLevelStock
          ? (variants?.[color] || []).length > 0
          : availableColors.includes(color);

        const colorClasses = getVariantColorStyles(color, isActive);

        return (
          <button
            key={color}
            type="button"
            disabled={!hasVariant}
            onClick={() => hasVariant && onSelectColor(color)}
            className={cn(
              "h-10 border px-4 font-ui text-[13px] select-none",
              hoverBtnClass,
              !hasVariant ? "cursor-not-allowed opacity-40" : "",
              colorClasses,
            )}
          >
            {formatColorName(color)}
          </button>
        );
      })}
    </div>
  );
});

const QuantitySelector = memo(function QuantitySelector({
  quantity,
  onQuantityChange,
  hoverBtnClass,
}) {
  const { t } = useLanguage();

  return (
    <div className="mt-2 inline-flex h-10 items-center border border-black/30 select-none">
      <button
        type="button"
        className={cn("h-10 w-10 select-none text-[18px]", hoverBtnClass)}
        onClick={() => onQuantityChange((q) => Math.max(1, q - 1))}
        aria-label={t.decreaseQuantity}
      >
        –
      </button>
      <div className="w-10 select-none text-center font-ui text-[13px]">
        {quantity}
      </div>
      <button
        type="button"
        className={cn("h-10 w-10 select-none text-[18px]", hoverBtnClass)}
        onClick={() => onQuantityChange((q) => q + 1)}
        aria-label={t.increaseQuantity}
      >
        +
      </button>
    </div>
  );
});

const ProductInfo = memo(function ProductInfo({
  product,
  selectedSize,
  selectedColor,
  availableSizes = [],
  availableColors = [],
  currentStock = 0,
  isCurrentSelectionSoldOut = false,
  usesVariantLevelStock = false,
  setSelectedSize,
  setSelectedColor,
  quantity,
  setQuantity,
  selectedService,
  setSelectedService,
  onAddToBag,
  onOpenDetails,
  onOpenHowItWorks,
  hoverClasses = { btn: "", iconBtn: "", group: "" },
}) {
  const { t } = useLanguage();
  const { has, toggle } = useFavorites();

  if (!product) return null;

  const isWishlisted = has(product.id);
  const hoverBtnClass = hoverClasses.btn;

  const isSoldOut = usesVariantLevelStock
    ? Boolean(isCurrentSelectionSoldOut)
    : Boolean(product.isSoldOut);

  const hasServiceOptions =
    product.category === "personal" &&
    (product.details?.serviceOptions?.length ?? 0) > 0;

  const hasColors = Array.isArray(product?.colors) && product.colors.length > 0;

  return (
    <div className="md:pt-1">
      <div className="mt-5 flex items-end justify-between gap-4 md:mt-0">
        <h1 className="font-display text-[28px] font-medium leading-none">
          {product.name}
        </h1>
        <p className="font-ui text-[16px] text-black/90">{product.price}</p>
      </div>

      <div className="mt-5">
        <p className="font-ui text-[13px] text-black/70">{t.size}:</p>
        <SizeSelector
          sizes={product.sizes}
          availableSizes={availableSizes}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          hoverBtnClass={hoverBtnClass}
          usesVariantLevelStock={usesVariantLevelStock}
        />
      </div>

      {hasColors ? (
        <div className="mt-5">
          <p className="font-ui text-[13px] text-black/70">{t.color}:</p>
          <ColorSelector
            colors={product.colors}
            availableColors={availableColors}
            variants={product.variants}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            hoverBtnClass={hoverBtnClass}
            usesVariantLevelStock={usesVariantLevelStock}
          />
        </div>
      ) : null}

      {usesVariantLevelStock && (
        <div className="mt-3">
          <p className="font-ui text-[12px] text-black/55">
            {isSoldOut
              ? t.selectedVariantSoldOut
              : `${t.inStock}: ${currentStock}`}
          </p>
        </div>
      )}

      {hasServiceOptions && (
        <div className="mt-5">
          <p className="font-ui text-[13px] text-black/70">
            {t.serviceOption}:
          </p>

          <div className="mt-2 grid gap-2">
            {product.details.serviceOptions.map((opt) => {
              const active = selectedService === opt.value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedService(opt.value)}
                  className={cn(
                    "w-full select-none border px-4 py-3 text-left",
                    hoverBtnClass,
                    active
                      ? "border-black bg-black text-white"
                      : "border-black/40 bg-white text-black lg:hover:bg-black/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-ui text-[13px]">
                        <span className="font-mono">{opt.label}</span>
                      </p>

                      {opt.description ? (
                        <p
                          className={cn(
                            "mt-1 font-ui text-[12px] leading-relaxed",
                            active ? "text-white/80" : "text-black/70",
                          )}
                        >
                          {opt.description}
                        </p>
                      ) : null}
                    </div>

                    <span
                      className={cn(
                        "mt-1 h-4 w-4 shrink-0 rounded-full border",
                        active ? "border-white bg-white" : "border-black/40",
                      )}
                      aria-hidden="true"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5">
        <p className="font-ui text-[13px] text-black/70">{t.quantity}:</p>

        <QuantitySelector
          quantity={quantity}
          onQuantityChange={(updater) => {
            setQuantity((prev) => {
              const next =
                typeof updater === "function" ? updater(prev) : Number(updater);

              const maxStock = usesVariantLevelStock
                ? Math.max(0, Number(currentStock) || 0)
                : Math.max(0, Number(product.stockQuantity) || 0);

              if (maxStock <= 0) return 1;

              return Math.min(maxStock, Math.max(1, next));
            });
          }}
          hoverBtnClass={hoverBtnClass}
        />
      </div>

      <div className="mt-6 flex items-stretch gap-2">
        <div className="flex-1">
          {isSoldOut ? (
            <button
              type="button"
              disabled
              className="
                h-12 w-full min-w-0 cursor-not-allowed border border-black/20
                bg-black/10 px-4 font-ui text-[13px] uppercase tracking-[0.08em]
                text-black/45
              "
            >
              {t.soldOut}
            </button>
          ) : (
            <AddToBagButton
              onClick={onAddToBag}
              icon={bagIcon}
              label={t.addToBag}
              ariaLabel={`${t.add} ${product.name} ${t.toBag}`}
              className="
                !w-full !h-12 !min-w-0 !justify-center
                !border-black !bg-black !text-white
                lg:hover:!scale-[1.02] lg:hover:!-translate-y-0.5
                active:!scale-[0.99]
              "
            />
          )}
        </div>

        <button
          type="button"
          aria-label={isWishlisted ? t.removeFromWishlist : t.addToWishlist}
          className={cn(
            "flex h-12 w-12 items-center justify-center border-[0.5px] border-black/25 bg-white select-none",
            hoverClasses.iconBtn,
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product.id);
          }}
        >
          <FiHeart
            className={cn(
              "h-5 w-5 transition-colors duration-200",
              isWishlisted ? "fill-red-600 text-red-600" : "text-black/25",
            )}
            strokeWidth={1.5}
          />
        </button>
      </div>

      <div className="mt-6">
        <div className="bg-black/5 px-4 py-3">
          <button
            type="button"
            onClick={onOpenDetails}
            className={cn(
              "group flex w-full items-center justify-between select-none font-ui text-[13px] text-black",
              hoverBtnClass,
            )}
          >
            <span className="underline underline-offset-4">
              {t.dimensionsAndDetails}
            </span>
            <img
              src={arrowUpRightIcon}
              alt=""
              aria-hidden="true"
              draggable={false}
              onDragStart={preventDragHandler}
              className="h-4 w-4 select-none transition-transform duration-200 ease-out lg:group-hover:translate-x-[1px] lg:group-hover:-translate-y-[1px]"
            />
          </button>
        </div>
      </div>

      {product.category === "personal" && (
        <div className="mt-2">
          <div className="bg-black/5 px-4 py-3">
            <button
              type="button"
              onClick={onOpenHowItWorks}
              className={cn(
                "group flex w-full items-center justify-between select-none font-ui text-[13px] text-black",
                hoverBtnClass,
              )}
            >
              <span className="underline underline-offset-4">
                {t.personalJewelleryHowItWorks}
              </span>

              <img
                src={arrowUpRightIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
                onDragStart={preventDragHandler}
                className="h-4 w-4 select-none transition-transform duration-200 ease-out lg:group-hover:translate-x-[1px] lg:group-hover:-translate-y-[1px]"
              />
            </button>
          </div>
        </div>
      )}

      <ProductBenefits />
    </div>
  );
});

export default ProductInfo;
