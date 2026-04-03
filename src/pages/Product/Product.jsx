import { useState, useCallback, useMemo, useEffect } from "react";
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

// Hooks
import useAddToCart from "@/hooks/useAddToCart";
import useBagDrawer from "@/store/useBagDrawer";
import { useProduct } from "@/hooks/useProducts";

// Utils
import preventDragHandler from "@/utils/preventDrag";

function ProductView({ product }) {
  // DEBUG - Helps verify if data arrives correctly
  useEffect(() => {
    console.log("DEBUG - Product data in page:", product);
  }, [product]);

  const { t } = useLanguage();
  const { addToCart } = useAddToCart();
  const openBag = useBagDrawer((s) => s.open);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // 1. Color Setup
  const availableColors = useMemo(() => {
    const colors = Array.isArray(product?.colors) ? product.colors : [];
    return colors.length > 0 ? colors : Object.keys(product?.variants || {});
  }, [product]);

  const [selectedColor, setSelectedColor] = useState(
    availableColors[0] || "silver",
  );

  // 2. Sizes Setup for selected color
  const effectiveAvailableSizes = useMemo(() => {
    const v = product?.variants?.[selectedColor];
    if (Array.isArray(v)) {
      return v.map((item) => String(item.size || item));
    }
    return Array.isArray(product?.sizes) ? product.sizes.map(String) : [];
  }, [product, selectedColor]);

  const [selectedSize, setSelectedSize] = useState(
    effectiveAvailableSizes[0] || null,
  );

  // 3. Variant and Stock determination
  const selectedVariant = useMemo(() => {
    const v = product?.variants?.[selectedColor];
    if (!Array.isArray(v)) return null;
    return v.find((item) => String(item.size) === String(selectedSize)) || v[0];
  }, [product, selectedColor, selectedSize]);

  const currentStock = useMemo(() => {
    if (selectedVariant && typeof selectedVariant.stock !== "undefined") {
      return Number(selectedVariant.stock);
    }
    return Number(product?.stockQuantity || product?.stock_quantity || 0);
  }, [product, selectedVariant]);

  const isCurrentSelectionSoldOut = currentStock <= 0;

  // 4. Image Gallery Logic
  const images = useMemo(() => {
    // A. Priority: Images from the specifically selected variant (color + size)
    if (selectedVariant?.images?.length > 0) {
      return selectedVariant.images;
    }

    // B. Secondary: Images from any variant of the same color
    const colorEntries = product?.variants?.[selectedColor];
    if (Array.isArray(colorEntries) && colorEntries.length > 0) {
      // Find first entry in that color that has images
      const entryWithImages = colorEntries.find((e) => e.images?.length > 0);
      if (entryWithImages) return entryWithImages.images;

      // If the array is just strings (fallback for different DB structures)
      if (typeof colorEntries[0] === "string") return colorEntries;
    }

    // C. Third: General product images array (from DB images column)
    if (Array.isArray(product?.images) && product.images.length > 0) {
      // If we are in 'gold' mode, try to find images containing 'gold' in filename
      if (selectedColor === "gold") {
        const goldImages = product.images.filter((img) =>
          img.toLowerCase().includes("gold"),
        );
        if (goldImages.length > 0) return goldImages;
      }
      // Otherwise return first two (usually the default color)
      return product.images.slice(0, 2);
    }

    // D. Final Fallback: Thumbnail
    return [product?.thumbnail].filter(Boolean);
  }, [product, selectedColor, selectedVariant]);

  const handleAddToBag = useCallback(() => {
    if (isCurrentSelectionSoldOut) return;

    addToCart({
      product,
      productId: String(product.id),
      name: product.name,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
      quantity,
      image: images[0] || product?.thumbnail,
    });

    openBag();
  }, [
    product,
    isCurrentSelectionSoldOut,
    selectedColor,
    selectedSize,
    quantity,
    images,
    addToCart,
    openBag,
  ]);

  return (
    <main
      className="mx-auto w-full px-4 py-4 md:max-w-[1200px]"
      onDragStart={preventDragHandler}
    >
      <div className="mb-4">
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 text-[14px] text-black/80 hover:text-black"
        >
          <img src={backIcon} alt="" className="h-3 w-3" />
          <span>{t.back}</span>
        </Link>
      </div>

      <div className="md:grid md:grid-cols-[1fr_360px] md:gap-8 lg:grid-cols-[1fr_420px] lg:gap-10">
        <ImageGallery
          images={images}
          product={product}
          openLightbox={(index) => {
            setActiveImgIndex(index);
            setIsLightboxOpen(true);
          }}
        />

        <ProductInfo
          product={product}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          availableSizes={effectiveAvailableSizes}
          availableColors={availableColors}
          currentStock={currentStock}
          isCurrentSelectionSoldOut={isCurrentSelectionSoldOut}
          setSelectedSize={setSelectedSize}
          setSelectedColor={(color) => {
            setSelectedColor(color);
            const variantEntries = product?.variants?.[color];
            if (Array.isArray(variantEntries)) {
              const firstSize = variantEntries[0]?.size;
              if (firstSize) setSelectedSize(String(firstSize));
            }
          }}
          quantity={quantity}
          setQuantity={setQuantity}
          onAddToBag={handleAddToBag}
          onOpenDetails={() => setIsDetailsOpen(true)}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        />
      </div>

      <DetailsPanel
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        product={product}
      />

      {product?.category === "personal" && (
        <HowItWorksPanel
          isOpen={isHowItWorksOpen}
          onClose={() => setIsHowItWorksOpen(false)}
        />
      )}

      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        activeImgIndex={activeImgIndex}
        setActiveImgIndex={setActiveImgIndex}
      />

      <FullWidthDivider />
      <YouMayAlsoLike currentProduct={product} />
    </main>
  );
}

export default function Product() {
  const { id } = useParams();
  const { product, loading } = useProduct(id);

  if (loading)
    return <div className="p-20 text-center font-ui">Loading...</div>;
  if (!product)
    return <div className="p-20 text-center font-ui">Product not found.</div>;

  return <ProductView product={product} />;
}
