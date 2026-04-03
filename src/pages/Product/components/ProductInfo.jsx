import { memo } from "react";
import { FiHeart } from "react-icons/fi";
import useLanguage from "@/context/useLanguage";
import useFavorites from "@/context/useFavorites";
import cn from "@/utils/cn";
import preventDragHandler from "@/utils/preventDrag";
import bagIcon from "@/assets/ui/shopping-bag.svg";
import warrantyIcon from "@/assets/ui/warranty.svg";
import deliveryIcon from "@/assets/ui/delivery.svg";
import starIcon from "@/assets/ui/star.svg";
import returnIcon from "@/assets/ui/return-box.svg";
import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";

const BenefitItem = memo(({ icon, text }) => (
  <div className="flex items-center gap-2 select-none font-ui text-[14px] text-black/80">
    <img
      src={icon}
      alt=""
      className="h-4 w-4"
      draggable={false}
      onDragStart={preventDragHandler}
    />
    {text}
  </div>
));

const ProductBenefits = memo(() => {
  const { t } = useLanguage();
  const benefits = [
    { icon: warrantyIcon, text: t.twoYearWarranty },
    { icon: deliveryIcon, text: t.fastDelivery },
    { icon: starIcon, text: t.highQuality },
    { icon: returnIcon, text: t.ninetyDayReturn },
  ];
  return (
    <div className="mb-6 mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-black pt-5">
      {benefits.map((b) => (
        <BenefitItem key={b.text} icon={b.icon} text={b.text} />
      ))}
    </div>
  );
});

const SizeSelector = memo(
  ({ sizes, availableSizes, selectedSize, onSelectSize }) => {
    const { t } = useLanguage();
    if (!sizes?.length)
      return (
        <p className="mt-2 font-ui text-[13px] text-black/50">{t.oneSize}</p>
      );
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {sizes.map((size) => {
          const normalizedSize = String(size);
          const isActive = String(selectedSize) === normalizedSize;
          const isAvailable = availableSizes.includes(normalizedSize);
          return (
            <button
              key={normalizedSize}
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectSize(normalizedSize)}
              className={cn(
                "h-10 min-w-12 border px-3 font-ui text-[13px] transition-colors",
                isActive
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black/40 hover:bg-black/5",
                !isAvailable && "opacity-30 cursor-not-allowed",
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    );
  },
);

const ColorSelector = memo(
  ({ colors, availableColors, selectedColor, onSelectColor }) => {
    const { t } = useLanguage();
    const colorNames = { gold: t.gold, silver: t.silver, pearl: t.perlas };
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {colors.map((color) => {
          const isActive = selectedColor === color;
          const isAvailable =
            availableColors.length === 0 || availableColors.includes(color);
          return (
            <button
              key={color}
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectColor(color)}
              className={cn(
                "h-10 border px-4 font-ui text-[13px] transition-colors",
                isActive
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black/40 hover:bg-black/5",
                !isAvailable && "opacity-30 cursor-not-allowed",
              )}
            >
              {colorNames[color] || color}
            </button>
          );
        })}
      </div>
    );
  },
);

const ProductInfo = memo(
  ({
    product,
    selectedSize,
    selectedColor,
    availableSizes,
    availableColors,
    currentStock,
    setSelectedSize,
    setSelectedColor,
    quantity,
    setQuantity,
    onAddToBag,
    onOpenDetails,
    onOpenHowItWorks,
  }) => {
    const { t } = useLanguage();
    const { has, toggle } = useFavorites();
    const isWishlisted = has(product?.id);

    // GRIEŽTA LOGIKA: Jei currentStock yra 10 (kaip tavo konsolėje), isSoldOut privalo būti FALSE
    const isSoldOut = Number(currentStock) <= 0;

    if (!product) return null;

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
          />
        </div>

        <div className="mt-5">
          <p className="font-ui text-[13px] text-black/70">{t.color}:</p>
          <ColorSelector
            colors={product.colors}
            availableColors={availableColors}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />
        </div>

        <div className="mt-3">
          <p className="font-ui text-[12px] text-black/55">
            {isSoldOut
              ? t.selectedVariantSoldOut
              : `${t.inStock}: ${currentStock}`}
          </p>
        </div>

        <div className="mt-5">
          <p className="font-ui text-[13px] text-black/70">{t.quantity}:</p>
          <div className="mt-2 inline-flex h-10 items-center border border-black/30">
            <button
              type="button"
              className="w-10 h-full hover:bg-black/5"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              –
            </button>
            <div className="w-10 text-center font-ui text-[13px]">
              {quantity}
            </div>
            <button
              type="button"
              className="w-10 h-full hover:bg-black/5"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-stretch gap-2">
          <div className="flex-1">
            {isSoldOut ? (
              <button
                disabled
                className="h-12 w-full border border-black/10 bg-black/5 text-black/40 uppercase text-[13px] cursor-not-allowed"
              >
                {t.soldOut}
              </button>
            ) : (
              <button
                type="button"
                onClick={onAddToBag}
                className="flex h-12 w-full items-center justify-center gap-3 bg-black text-white uppercase text-[13px] tracking-widest transition-transform hover:scale-[1.01]"
              >
                <img src={bagIcon} alt="" className="h-4 w-4 invert" />
                {t.addToBag}
              </button>
            )}
          </div>
          <button
            onClick={() => toggle(product.id)}
            className="flex h-12 w-12 items-center justify-center border border-black/20"
          >
            <FiHeart
              className={cn(
                "h-5 w-5",
                isWishlisted ? "fill-red-600 text-red-600" : "text-black/30",
              )}
            />
          </button>
        </div>

        <div
          className="mt-6 bg-black/5 px-4 py-3 cursor-pointer group"
          onClick={onOpenDetails}
        >
          <div className="flex items-center justify-between font-ui text-[13px]">
            <span className="underline underline-offset-4">
              {t.dimensionsAndDetails}
            </span>
            <img
              src={arrowUpRightIcon}
              alt=""
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>

        {product.category === "personal" && (
          <div
            className="mt-2 bg-black/5 px-4 py-3 cursor-pointer group"
            onClick={onOpenHowItWorks}
          >
            <div className="flex items-center justify-between font-ui text-[13px]">
              <span className="underline underline-offset-4">
                {t.personalJewelleryHowItWorks}
              </span>
              <img
                src={arrowUpRightIcon}
                alt=""
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </div>
          </div>
        )}
        <ProductBenefits />
      </div>
    );
  },
);

export default ProductInfo;
