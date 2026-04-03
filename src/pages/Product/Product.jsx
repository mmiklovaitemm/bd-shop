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
  // DEBUG - verify data in console on load
  useEffect(() => {
    console.log("DEBUG - Product data loaded:", product);
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

  // 2. Sizes Setup for the selected color
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

  // 3. Variant Logic to determine stock and specific images
  const selectedVariant = useMemo(() => {
    const v = product?.variants?.[selectedColor];
    if (!Array.isArray(v)) return null;
    // Find exact size match or fallback to the first available variant
    return v.find((item) => String(item.size) === String(selectedSize)) || v[0];
  }, [product, selectedColor, selectedSize]);

  const currentStock = useMemo(() => {
    if (selectedVariant && typeof selectedVariant.stock !== "undefined") {
      return Number(selectedVariant.stock);
    }
    return Number(product?.stockQuantity || product?.stock_quantity || 0);
  }, [product, selectedVariant]);

  const isCurrentSelectionSoldOut = currentStock <= 0;

  // 4. Image Filtering Logic
  const images = useMemo(() => {
    // Priority 1: Images from the specific selected variant
    if (selectedVariant?.images?.length > 0) return selectedVariant.images;

    // Priority 2: Any images from the selected color group
    const colorEntries = product?.variants?.[selectedColor];
    if (Array.isArray(colorEntries) && colorEntries.length > 0) {
      const entryWithImages = colorEntries.find((e) => e.images?.length > 0);
      if (entryWithImages) return entryWithImages.images;
    }

    // Fallback: Thumbnail or general images
    return [product?.thumbnail].filter(Boolean);
  }, [product, selectedColor, selectedVariant]);

  // 5. Add to Bag Action
  const handleAddToBag = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault();

      console.log("DEBUG - handleAddToBag triggered");

      if (isCurrentSelectionSoldOut) {
        console.warn("DEBUG - Item sold out, cannot add to bag");
        return;
      }

      try {
        const cartItem = {
          product,
          productId: String(product.id),
          name: product.name,
          price: product.price,
          color: String(selectedColor),
          size: selectedSize ? String(selectedSize) : null,
          quantity: Number(quantity),
          image: images[0] || product?.thumbnail || "",
        };

        console.log("DEBUG - Executing addToCart with:", cartItem);
        addToCart(cartItem);

        console.log("DEBUG - Opening Bag Drawer");
        openBag();
      } catch (err) {
        console.error("DEBUG - Cart error:", err);
      }
    },
    [
      product,
      isCurrentSelectionSoldOut,
      selectedColor,
      selectedSize,
      quantity,
      images,
      addToCart,
      openBag,
    ],
  );

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
            if (Array.isArray(variantEntries) && variantEntries.length > 0) {
              // Automatically pick the first available size for the new color
              const firstAvailable =
                variantEntries.find((v) => Number(v.stock) > 0) ||
                variantEntries[0];
              if (firstAvailable?.size)
                setSelectedSize(String(firstAvailable.size));
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

  return <ProductView key={product.id} product={product} />;
}
