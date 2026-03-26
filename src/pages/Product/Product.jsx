// src/pages/Product.jsx
import { useState, useCallback, useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";

// Icons
import backIcon from "@/assets/ui/product_page_back_icon.svg";

// Components
import ImageGallery from "@/pages/Product/components/ImageGallery";
import Lightbox from "@/pages/Product/components/Lightbox";
import DetailsPanel from "@/pages/Product/components/DetailsPanel";
import ProductInfo from "@/pages/Product/components/ProductInfo";
import YouMayAlsoLike from "@/pages/Product/components/YouMayAlsoLike";
import HowItWorksPanel from "@/pages/Product/components/HowItWorksPanel";

// Constants
import { HOVER_CLASSES } from "@/pages/Product/constants";

// Hooks
import useAddToCart from "@/hooks/useAddToCart";
import useBagDrawer from "@/store/useBagDrawer";
import { useProduct } from "@/hooks/useProducts";

// Utils
import cn from "@/utils/cn";
import preventDragHandler from "@/utils/preventDrag";

// Helpers
function isVariantObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray(value.images)
  );
}

function hasVariantLevelStock(product) {
  return Object.values(product?.variants || {}).some(
    (value) =>
      Array.isArray(value) && value.length > 0 && isVariantObject(value[0]),
  );
}

function getAllColors(product) {
  return Array.isArray(product?.colors) ? product.colors.filter(Boolean) : [];
}

function getFallbackColor(product) {
  return getAllColors(product)[0] || null;
}

function getAvailableColors(product, usesVariantLevelStock) {
  const colors = getAllColors(product);

  if (!usesVariantLevelStock) return colors;

  const inStockColors = colors.filter((color) => {
    const entries = product?.variants?.[color] || [];
    return entries.some((variant) => Number(variant?.stock || 0) > 0);
  });

  return inStockColors.length ? inStockColors : colors;
}

function getAvailableSizesForColor(product, color, usesVariantLevelStock) {
  if (!product) return [];

  if (!usesVariantLevelStock) {
    return (product?.sizes || []).map(String);
  }

  const entries = Array.isArray(product?.variants?.[color])
    ? product.variants[color]
    : [];

  return entries
    .filter((variant) => Number(variant?.stock || 0) > 0)
    .map((variant) => String(variant?.size))
    .filter(Boolean);
}

function getFirstAvailableColor(product, usesVariantLevelStock) {
  const availableColors = getAvailableColors(product, usesVariantLevelStock);
  return availableColors[0] || getFallbackColor(product);
}

function getFirstAvailableSize(product, color, usesVariantLevelStock) {
  const availableSizes = getAvailableSizesForColor(
    product,
    color,
    usesVariantLevelStock,
  );

  if (availableSizes.length > 0) {
    return availableSizes[0];
  }

  return product?.sizes?.[0] ? String(product.sizes[0]) : null;
}

function ProductView({ product }) {
  const { t } = useLanguage();
  const { addToCart } = useAddToCart();
  const openBag = useBagDrawer((s) => s.open);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const [quantity, setQuantity] = useState(1);

  const usesVariantLevelStock = useMemo(
    () => hasVariantLevelStock(product),
    [product],
  );

  const availableColors = useMemo(
    () => getAvailableColors(product, usesVariantLevelStock),
    [product, usesVariantLevelStock],
  );

  const initialColor = useMemo(
    () => getFirstAvailableColor(product, usesVariantLevelStock),
    [product, usesVariantLevelStock],
  );

  const [selectedColor, setSelectedColor] = useState(initialColor);

  const initialSize = useMemo(
    () => getFirstAvailableSize(product, initialColor, usesVariantLevelStock),
    [product, initialColor, usesVariantLevelStock],
  );

  const [selectedSize, setSelectedSize] = useState(initialSize);

  const [selectedService, setSelectedService] = useState(
    product?.details?.serviceOptions?.[0]?.value || null,
  );

  const effectiveSelectedColor = useMemo(() => {
    if (selectedColor && availableColors.includes(selectedColor)) {
      return selectedColor;
    }

    return getFirstAvailableColor(product, usesVariantLevelStock);
  }, [availableColors, product, selectedColor, usesVariantLevelStock]);

  const effectiveColorEntries = useMemo(() => {
    if (!usesVariantLevelStock || !effectiveSelectedColor) return [];

    return Array.isArray(product?.variants?.[effectiveSelectedColor])
      ? product.variants[effectiveSelectedColor]
      : [];
  }, [product, effectiveSelectedColor, usesVariantLevelStock]);

  const effectiveAvailableSizes = useMemo(() => {
    return getAvailableSizesForColor(
      product,
      effectiveSelectedColor,
      usesVariantLevelStock,
    );
  }, [product, effectiveSelectedColor, usesVariantLevelStock]);

  const effectiveSelectedSize = useMemo(() => {
    const normalizedSelectedSize =
      selectedSize == null ? null : String(selectedSize);

    if (effectiveAvailableSizes.includes(normalizedSelectedSize)) {
      return normalizedSelectedSize;
    }

    return getFirstAvailableSize(
      product,
      effectiveSelectedColor,
      usesVariantLevelStock,
    );
  }, [
    effectiveAvailableSizes,
    effectiveSelectedColor,
    product,
    selectedSize,
    usesVariantLevelStock,
  ]);

  const selectedVariant = useMemo(() => {
    if (!usesVariantLevelStock) return null;

    return (
      effectiveColorEntries.find(
        (variant) => String(variant?.size) === String(effectiveSelectedSize),
      ) || null
    );
  }, [effectiveColorEntries, effectiveSelectedSize, usesVariantLevelStock]);

  const currentStock = useMemo(() => {
    if (!usesVariantLevelStock) {
      return Math.max(0, Number(product?.stockQuantity) || 0);
    }

    return Math.max(0, Number(selectedVariant?.stock) || 0);
  }, [product, selectedVariant, usesVariantLevelStock]);

  const isCurrentSelectionSoldOut = currentStock <= 0;

  const images = useMemo(() => {
    if (!product) return [];

    if (usesVariantLevelStock) {
      if (selectedVariant?.images?.length) {
        return selectedVariant.images.filter(Boolean);
      }

      const fallbackColor =
        getFirstAvailableColor(product, true) || getFallbackColor(product);

      const fallbackVariant = (product?.variants?.[fallbackColor] || []).find(
        (variant) =>
          Array.isArray(variant?.images) && variant.images.length > 0,
      );

      return fallbackVariant?.images?.filter(Boolean) || [];
    }

    const fallbackColor = getFallbackColor(product);

    const base = (product?.variants?.[fallbackColor] || []).filter(Boolean);
    const selectedArr = (
      product?.variants?.[effectiveSelectedColor] || []
    ).filter(Boolean);

    const merged = base.map((img, idx) => selectedArr[idx] || img);
    const extras = selectedArr.slice(base.length);

    return [...merged, ...extras].filter(Boolean);
  }, [product, effectiveSelectedColor, selectedVariant, usesVariantLevelStock]);

  const openLightbox = useCallback((index) => {
    setActiveImgIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const handleAddToBag = useCallback(
    (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();

      if (!product || isCurrentSelectionSoldOut) return;

      const fallbackColor = getFallbackColor(product);

      const img = usesVariantLevelStock
        ? selectedVariant?.images?.[0] || product?.thumbnail || ""
        : product?.variants?.[effectiveSelectedColor]?.[0] ||
          product?.variants?.[fallbackColor]?.[0] ||
          product?.thumbnail ||
          "";

      if (product.category === "personal" && !selectedService) {
        alert(t.pleaseChooseServiceOption);
        return;
      }

      addToCart({
        product,
        category: product.category,
        color: effectiveSelectedColor || fallbackColor || null,
        size: effectiveSelectedSize || null,
        quantity: quantity || 1,
        image: img,
        serviceOption: selectedService || null,
      });

      openBag();
    },
    [
      addToCart,
      effectiveSelectedColor,
      effectiveSelectedSize,
      isCurrentSelectionSoldOut,
      openBag,
      product,
      quantity,
      selectedService,
      selectedVariant,
      t.pleaseChooseServiceOption,
      usesVariantLevelStock,
    ],
  );

  const handleSelectColor = useCallback(
    (color) => {
      const nextColor = color;
      const nextSize = getFirstAvailableSize(
        product,
        nextColor,
        usesVariantLevelStock,
      );

      setSelectedColor(nextColor);
      setSelectedSize(nextSize);
      setQuantity(1);
    },
    [product, usesVariantLevelStock],
  );

  const handleSelectSize = useCallback((size) => {
    setSelectedSize(size == null ? null : String(size));
    setQuantity(1);
  }, []);

  return (
    <main
      className="mx-auto w-full select-none px-4 py-4 md:max-w-[1200px] md:px-1 md:py-4 lg:max-w-none lg:px-2"
      onDragStart={preventDragHandler}
    >
      <div className="mb-4">
        <Link
          to="/collections"
          className="group inline-flex select-none items-center font-ui text-[14px] text-black/80"
        >
          <span
            className={cn(
              "inline-flex items-center gap-2",
              HOVER_CLASSES.group,
            )}
          >
            <img
              src={backIcon}
              alt=""
              aria-hidden="true"
              draggable={false}
              onDragStart={preventDragHandler}
              className="h-3 w-3 select-none transition-transform duration-200 ease-out"
            />
            <span>{t.back}</span>
          </span>
        </Link>
      </div>

      <div className="md:mb-5 md:grid md:grid-cols-[1fr_360px] md:items-start md:gap-8 lg:grid-cols-[1fr_420px] lg:gap-10">
        <ImageGallery
          images={images}
          product={product}
          openLightbox={openLightbox}
          btnHover={HOVER_CLASSES.btn}
        />

        <ProductInfo
          product={product}
          selectedSize={effectiveSelectedSize}
          selectedColor={effectiveSelectedColor}
          availableSizes={effectiveAvailableSizes}
          availableColors={availableColors}
          currentStock={currentStock}
          isCurrentSelectionSoldOut={isCurrentSelectionSoldOut}
          usesVariantLevelStock={usesVariantLevelStock}
          setSelectedSize={handleSelectSize}
          setSelectedColor={handleSelectColor}
          quantity={quantity}
          setQuantity={setQuantity}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          onAddToBag={handleAddToBag}
          onOpenDetails={() => setIsDetailsOpen(true)}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
          hoverClasses={HOVER_CLASSES}
        />
      </div>

      <DetailsPanel
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        product={product}
        selectedColor={effectiveSelectedColor}
        selectedSize={effectiveSelectedSize}
      />

      {product?.category === "personal" && (
        <HowItWorksPanel
          isOpen={isHowItWorksOpen}
          onClose={() => setIsHowItWorksOpen(false)}
        />
      )}

      <Lightbox
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
        images={images}
        activeImgIndex={activeImgIndex}
        setActiveImgIndex={setActiveImgIndex}
        product={product}
      />

      <FullWidthDivider />
      <YouMayAlsoLike currentProduct={product} />
    </main>
  );
}

export default function Product() {
  const { t } = useLanguage();
  const { id } = useParams();
  const { product, loading } = useProduct(id);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-10 md:px-6">
        <div className="flex min-h-[50vh] flex-col items-center justify-center">
          <p className="font-ui text-[14px] text-black/60">{t.loading}</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-10 md:px-6">
        <div className="flex min-h-[50vh] flex-col items-center justify-center">
          <p className="font-ui text-[14px] text-black/60">
            {id ? t.productNotFound : t.invalidProductUrl}
          </p>
          <Link
            to="/collections"
            className="mt-4 inline-block font-ui text-[14px] text-black underline transition-colors hover:text-black/70"
          >
            {t.backToCollections}
          </Link>
        </div>
      </main>
    );
  }

  return <ProductView key={product.id} product={product} />;
}
