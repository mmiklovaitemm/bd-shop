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

  // 2. Sizes Setup
  const effectiveAvailableSizes = useMemo(() => {
    const v = product?.variants?.[selectedColor];
    if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object") {
      return v.map((item) => String(item.size || ""));
    }
    return Array.isArray(product?.sizes) ? product.sizes.map(String) : [];
  }, [product, selectedColor]);

  const [selectedSize, setSelectedSize] = useState(
    effectiveAvailableSizes[0] || null,
  );

  // 3. Variant & Stock Logic (FIXED FOR SOLD OUT ISSUE)
  const selectedVariant = useMemo(() => {
    const v = product?.variants?.[selectedColor];
    if (!Array.isArray(v)) return null;
    return v.find((item) => String(item.size) === String(selectedSize)) || v[0];
  }, [product, selectedColor, selectedSize]);

  const currentStock = useMemo(() => {
    // Priority 1: stock defined in the specific variant
    if (
      selectedVariant &&
      typeof selectedVariant.stock !== "undefined" &&
      selectedVariant.stock !== null
    ) {
      return Number(selectedVariant.stock);
    }
    // Priority 2: global stock quantity from database (I see '10' in your console)
    return Number(product?.stockQuantity || product?.stock_quantity || 0);
  }, [product, selectedVariant]);

  const isCurrentSelectionSoldOut = currentStock <= 0;

  // 4. Image Filtering Logic (FIXED FOR MISSING SECOND IMAGE)
  const images = useMemo(() => {
    let result = [];

    // Priority 1: Images from the variant
    if (selectedVariant?.images?.length > 0) {
      result = selectedVariant.images;
    }
    // Priority 2: Images from the color group
    else {
      const colorEntries = product?.variants?.[selectedColor];
      if (Array.isArray(colorEntries)) {
        if (typeof colorEntries[0] === "string") result = colorEntries;
        else if (colorEntries[0]?.images) result = colorEntries[0].images;
      }
    }

    // Priority 3: Fallback to general images array
    if (result.length === 0 && Array.isArray(product?.images)) {
      result = product.images;
    }

    return result.length > 0 ? result : [product?.thumbnail].filter(Boolean);
  }, [product, selectedColor, selectedVariant]);

  // 5. Add to Bag Action
  const handleAddToBag = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault();
      if (isCurrentSelectionSoldOut) return;

      try {
        addToCart({
          product,
          productId: String(product.id),
          name: product.name,
          price: product.price,
          color: String(selectedColor),
          size: selectedSize ? String(selectedSize) : null,
          quantity: Number(quantity),
          image: images[0] || product?.thumbnail || "",
        });
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
          openLightbox={(i) => {
            setActiveImgIndex(i);
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
            const v = product?.variants?.[color];
            if (Array.isArray(v) && v.length > 0 && v[0]?.size) {
              setSelectedSize(String(v[0].size));
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
