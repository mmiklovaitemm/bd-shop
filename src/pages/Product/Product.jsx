// src/pages/Product.jsx
import { useMemo, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";

import { PRODUCTS } from "@/data/products";

import FullWidthDivider from "@/components/ui/FullWidthDivider";

// Icons
import backIcon from "@/assets/ui/product_page_back_icon.svg";

// Components (extracted)
import ImageGallery from "@/pages/Product/components/ImageGallery";
import Lightbox from "@/pages/Product/components/Lightbox";
import DetailsPanel from "@/pages/Product/components/DetailsPanel";
import ProductInfo from "@/pages/Product/components/ProductInfo";
import YouMayAlsoLike from "@/pages/Product/components/YouMayAlsoLike";

// Constants
import { HOVER_CLASSES } from "@/pages/Product/constants";

// Utils
import cn from "@/utils/cn";
import preventDragHandler from "@/utils/preventDrag";

export default function Product() {
  const { id } = useParams();

  const product = useMemo(() => {
    if (!id) return null;
    return PRODUCTS.find((p) => p.id === id) || null;
  }, [id]);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Product selection state (initialized from product)
  const [productState, setProductState] = useState(() => ({
    quantity: 1,
    isWishlisted: false,
    selectedColor: product?.colors?.[0] || "silver",
    selectedSize: product?.sizes?.[0] || null,
  }));

  const { quantity, isWishlisted, selectedColor, selectedSize } = productState;

  // Safe setters that support function updates (like setState)
  const setQuantity = (value) =>
    setProductState((prev) => ({
      ...prev,
      quantity: typeof value === "function" ? value(prev.quantity) : value,
    }));

  const setIsWishlisted = (value) =>
    setProductState((prev) => ({
      ...prev,
      isWishlisted:
        typeof value === "function" ? value(prev.isWishlisted) : value,
    }));

  const setSelectedColor = (value) =>
    setProductState((prev) => ({
      ...prev,
      selectedColor:
        typeof value === "function" ? value(prev.selectedColor) : value,
    }));

  const setSelectedSize = (value) =>
    setProductState((prev) => ({
      ...prev,
      selectedSize:
        typeof value === "function" ? value(prev.selectedSize) : value,
    }));

  // Memoized images based on selected color
  const images = useMemo(() => {
    if (!product) return [];

    const color = selectedColor || product.colors?.[0];
    const arr = product.variants?.[color] || [];

    return arr.filter(Boolean);
  }, [product, selectedColor]);

  // Handlers
  const handleAddToBag = useCallback(() => {
    if (!product) return;

    console.log("Add to bag:", {
      productId: product.id,
      productName: product.name,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
  }, [product, selectedColor, selectedSize, quantity]);

  const handleToggleWishlist = useCallback(() => {
    if (!product) return;

    setIsWishlisted((prev) => !prev);
    console.log("Toggle wishlist:", product.name);
  }, [product]);

  const openLightbox = useCallback((index) => {
    setActiveImgIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  // Loading/Error state
  if (!product) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-10">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <p className="font-ui text-[14px] text-black/60">
            {id ? "Product not found." : "Invalid product URL."}
          </p>
          <Link
            to="/collections"
            className="mt-4 inline-block font-ui text-[14px] text-black underline hover:text-black/70 transition-colors"
          >
            Back to Collections
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="mx-auto w-full md:max-w-[1200px] lg:max-w-none px-4 md:px-1 lg:px-2 py-4 md:py-4 select-none"
      onDragStart={preventDragHandler}
    >
      {/* Back Navigation */}
      <div className="mb-4">
        <Link
          to="/collections"
          className="group inline-flex items-center font-ui text-[14px] text-black/80 select-none"
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
              className="h-3 w-3 transition-transform duration-200 ease-out select-none"
            />
            <span>Back</span>
          </span>
        </Link>
      </div>

      {/* Product Layout */}
      {/* key={product.id} => reset local selection state when switching products */}
      <div
        key={product.id}
        className="md:grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_420px] md:gap-8 lg:gap-10 md:items-start md:mb-5"
      >
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
          quantity={quantity}
          setQuantity={setQuantity}
          isWishlisted={isWishlisted}
          onAddToBag={handleAddToBag}
          onToggleWishlist={handleToggleWishlist}
          onOpenDetails={() => setIsDetailsOpen(true)}
          hoverClasses={HOVER_CLASSES}
        />
      </div>

      {/* Modals */}
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
      <YouMayAlsoLike currentProduct={product} />
    </main>
  );
}
