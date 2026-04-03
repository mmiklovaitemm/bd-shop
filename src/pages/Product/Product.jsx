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
  // DEBUG - padės pamatyti, ar duomenys ateina teisingi
  useEffect(() => {
    console.log("DEBUG - Produkto duomenys puslapyje:", product);
  }, [product]);

  const { t } = useLanguage();
  const { addToCart } = useAddToCart();
  const openBag = useBagDrawer((s) => s.open);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // 1. Spalvų nustatymas
  const availableColors = useMemo(() => {
    const colors = Array.isArray(product?.colors) ? product.colors : [];
    return colors.length > 0 ? colors : Object.keys(product?.variants || {});
  }, [product]);

  const [selectedColor, setSelectedColor] = useState(
    availableColors[0] || "silver",
  );

  // 2. Dydžių nustatymas pasirinktai spalvai
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

  // 3. Varianto ir sandėlio nustatymas
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

  // 4. Nuotraukų galerija
  const images = useMemo(() => {
    if (selectedVariant?.images?.length) return selectedVariant.images;
    if (Array.isArray(product?.images) && product.images.length > 0)
      return product.images;
    return [product?.thumbnail].filter(Boolean);
  }, [product, selectedVariant]);

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
            // Automatiškai parenkame pirmą prieinamą dydį naujai spalvai
            const newSizes =
              product?.variants?.[color]?.map((i) => String(i.size)) || [];
            if (newSizes.length > 0) setSelectedSize(newSizes[0]);
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
    return <div className="p-20 text-center font-ui">Kraunama...</div>;
  if (!product)
    return <div className="p-20 text-center font-ui">Prekė nerasta.</div>;

  return <ProductView product={product} />;
}
