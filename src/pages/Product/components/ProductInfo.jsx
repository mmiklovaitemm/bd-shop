import { memo } from "react";
import { FiHeart } from "react-icons/fi";

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

const COLOR_NAMES = {
  "soft-yellow": "Soft yellow",
  "soft-blue": "Soft blue",
  "soft-green": "Soft green",
  gold: "Gold",
  silver: "Silver",
};

const formatColorName = (color) => COLOR_NAMES[color] || color;

const getVariantColorStyles = (color, isActive) => {
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
  };

  const key = styles[color] ? color : "silver";
  return isActive ? styles[key].active : styles[key].default;
};

const BenefitItem = memo(function BenefitItem({ icon, text }) {
  return (
    <div className="flex items-center gap-2 font-ui text-[14px] text-black/80 select-none">
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        draggable={false}
        onDragStart={preventDragHandler}
        className="h-4 w-4 invert select-none"
      />
      {text}
    </div>
  );
});

const ProductBenefits = memo(function ProductBenefits() {
  const benefits = [
    { icon: warrantyIcon, text: "2 Year Warranty" },
    { icon: deliveryIcon, text: "Fast Delivery" },
    { icon: starIcon, text: "High Quality" },
    { icon: returnIcon, text: "90 - Day Return" },
  ];

  return (
    <div className="mt-6 mb-6 border-t border-black pt-5 grid grid-cols-2 gap-y-4 md:gap-6 gap-x-6">
      {benefits.map((benefit, index) => (
        <BenefitItem key={index} icon={benefit.icon} text={benefit.text} />
      ))}
    </div>
  );
});

const SizeSelector = memo(function SizeSelector({
  sizes,
  selectedSize,
  onSelectSize,
  hoverBtnClass,
}) {
  if (!sizes?.length) {
    return <p className="font-ui text-[13px] text-black/50 mt-2">One size</p>;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {sizes.map((size) => {
        const isActive = selectedSize === size;
        return (
          <button
            key={size}
            type="button"
            onClick={() => onSelectSize(size)}
            className={cn(
              "h-10 min-w-12 px-3 border font-ui text-[13px] select-none",
              hoverBtnClass,
              isActive
                ? "bg-black text-white border-black"
                : "bg-white text-black border-black/40 lg:hover:bg-black/5",
            )}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
});

const ColorSelector = memo(function ColorSelector({
  colors,
  variants,
  selectedColor,
  onSelectColor,
  hoverBtnClass,
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {colors.map((color) => {
        const isActive = selectedColor === color;
        const hasVariant = (variants?.[color] || []).length > 0;
        const colorClasses = getVariantColorStyles(color, isActive);

        return (
          <button
            key={color}
            type="button"
            disabled={!hasVariant}
            onClick={() => hasVariant && onSelectColor(color)}
            className={cn(
              "h-10 px-4 border font-ui text-[13px] select-none",
              hoverBtnClass,
              !hasVariant ? "opacity-40 cursor-not-allowed" : "",
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
  return (
    <div className="mt-2 inline-flex items-center border border-black/30 h-10 select-none">
      <button
        type="button"
        className={cn("w-10 h-10 text-[18px] select-none", hoverBtnClass)}
        onClick={() => onQuantityChange((q) => Math.max(1, q - 1))}
        aria-label="Decrease quantity"
      >
        –
      </button>
      <div className="w-10 text-center font-ui text-[13px] select-none">
        {quantity}
      </div>
      <button
        type="button"
        className={cn("w-10 h-10 text-[18px] select-none", hoverBtnClass)}
        onClick={() => onQuantityChange((q) => q + 1)}
        aria-label="Increase quantity"
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
  setSelectedSize,
  setSelectedColor,
  quantity,
  setQuantity,
  onAddToBag,
  onOpenDetails,
  hoverClasses = { btn: "", iconBtn: "", group: "" },
}) {
  const { has, toggle } = useFavorites();

  if (!product) return null;

  const isWishlisted = has(product.id);
  const hoverBtnClass = hoverClasses.btn;

  return (
    <div className="md:pt-1">
      <div className="mt-5 md:mt-0 flex items-end justify-between gap-4">
        <h1 className="font-display font-medium text-[28px] leading-none">
          {product.name}
        </h1>
        <p className="font-ui text-[16px] text-black/90">{product.price}</p>
      </div>

      <div className="mt-5">
        <p className="font-ui text-[13px] text-black/70">Size:</p>
        <SizeSelector
          sizes={product.sizes}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          hoverBtnClass={hoverBtnClass}
        />
      </div>

      <div className="mt-5">
        <p className="font-ui text-[13px] text-black/70">Color:</p>
        <ColorSelector
          colors={product.colors}
          variants={product.variants}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          hoverBtnClass={hoverBtnClass}
        />
      </div>

      <div className="mt-5">
        <p className="font-ui text-[13px] text-black/70">Quantity:</p>
        <QuantitySelector
          quantity={quantity}
          onQuantityChange={setQuantity}
          hoverBtnClass={hoverBtnClass}
        />
      </div>

      <div className="mt-6 flex items-stretch gap-2">
        <div className="flex-1">
          <AddToBagButton
            onClick={onAddToBag}
            icon={bagIcon}
            label="Add to bag"
            ariaLabel={`Add ${product.name} to bag`}
            className="
              !w-full !h-12 !min-w-0 !justify-center
              !border-black !bg-black !text-white
              lg:hover:!scale-[1.02] lg:hover:!-translate-y-0.5
              active:!scale-[0.99]
            "
          />
        </div>

        <button
          type="button"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "h-12 w-12 border-[0.5px] border-black/25 flex items-center justify-center bg-white select-none",
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
              isWishlisted ? "text-red-600 fill-red-600" : "text-black/25",
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
              "group w-full flex items-center justify-between font-ui text-[13px] text-black select-none",
              hoverBtnClass,
            )}
          >
            <span className="underline underline-offset-4">
              Dimensions & details
            </span>
            <img
              src={arrowUpRightIcon}
              alt=""
              aria-hidden="true"
              draggable={false}
              onDragStart={preventDragHandler}
              className="h-4 w-4 transition-transform duration-200 ease-out lg:group-hover:translate-x-[1px] lg:group-hover:-translate-y-[1px] select-none"
            />
          </button>
        </div>
      </div>

      <ProductBenefits />
    </div>
  );
});

export default ProductInfo;
