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

// Hooks
import useAddToCart from "@/hooks/useAddToCart";
import useBagDrawer from "@/store/useBagDrawer";

// Utils
import cn from "@/utils/cn";
import preventDragHandler from "@/utils/preventDrag";

function ProductView({ product }) {
  const { addToCart } = useAddToCart();
  const openBag = useBagDrawer((s) => s.open);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Product selection state
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    product?.colors?.[0] || "silver",
  );
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || null);

  // Memoized images based on selected color
  const images = useMemo(() => {
    if (!product) return [];

    const defaultColor = product.colors?.[0] || "silver";

    const base = (product.variants?.[defaultColor] || []).filter(Boolean);
    const selectedArr = (product.variants?.[selectedColor] || []).filter(
      Boolean,
    );

    const merged = base.map((img, idx) => selectedArr[idx] || img);
    const extras = selectedArr.slice(base.length);

    return [...merged, ...extras].filter(Boolean);
  }, [product, selectedColor]);

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
      if (!product) return;

      const img =
        product?.variants?.[selectedColor]?.[0] ||
        product?.variants?.[product?.colors?.[0]]?.[0] ||
        product?.thumbnail ||
        "";

      addToCart({
        product,
        color: selectedColor || "silver",
        size: selectedSize || null,
        quantity: quantity || 1,
        image: img,
      });

      openBag();
    },
    [addToCart, openBag, product, selectedColor, selectedSize, quantity],
  );

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
          quantity={quantity}
          setQuantity={setQuantity}
          onAddToBag={handleAddToBag}
          onOpenDetails={() => setIsDetailsOpen(true)}
          hoverClasses={HOVER_CLASSES}
        />
      </div>

      {/* Modals */}
      <DetailsPanel
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        product={product}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
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

export default function Product() {
  const { id } = useParams();

  const product = useMemo(() => {
    if (!id) return null;
    return PRODUCTS.find((p) => p.id === id) || null;
  }, [id]);

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

  return <ProductView key={product.id} product={product} />;
}
