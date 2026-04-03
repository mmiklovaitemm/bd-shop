import { useState, useCallback, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import backIcon from "@/assets/ui/product_page_back_icon.svg";
import ImageGallery from "@/pages/Product/components/ImageGallery";
import Lightbox from "@/pages/Product/components/Lightbox";
import DetailsPanel from "@/pages/Product/components/DetailsPanel";
import ProductInfo from "@/pages/Product/components/ProductInfo";
import YouMayAlsoLike from "@/pages/Product/components/YouMayAlsoLike";
import HowItWorksPanel from "@/pages/Product/components/HowItWorksPanel";
import Loader from "@/components/ui/Loader";
import useAddToCart from "@/hooks/useAddToCart";
import useBagDrawer from "@/store/useBagDrawer";
import { useProduct } from "@/hooks/useProducts";
import preventDragHandler from "@/utils/preventDrag";

function ProductView({ product }) {
  const { t } = useLanguage();
  const { addToCart } = useAddToCart();
  const openBag = useBagDrawer((s) => s.open);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // 1. Prepare colors
  const availableColors = useMemo(() => {
    const colors = Array.isArray(product?.colors) ? product.colors : [];
    return colors.length > 0 ? colors : Object.keys(product?.variants || {});
  }, [product]);

  const [selectedColor, setSelectedColor] = useState(
    availableColors[0] || "silver",
  );

  // 2. Helper function to get sizes
  const getSizesForColor = useCallback(
    (color) => {
      const v = product?.variants?.[color];
      if (Array.isArray(v) && v.length > 0)
        return v.map((item) => String(item.size));
      if (Array.isArray(product?.sizes))
        return product.sizes.map((s) => String(s));
      return [];
    },
    [product],
  );

  const effectiveAvailableSizes = useMemo(
    () => getSizesForColor(selectedColor),
    [selectedColor, getSizesForColor],
  );

  // Initial size setup
  const [selectedSize, setSelectedSize] = useState(() => {
    const color = availableColors[0] || "silver";
    const v = product?.variants?.[color];
    if (Array.isArray(v) && v.length > 0) {
      const firstAvailable = v.find((item) => Number(item.stock) > 0);
      if (firstAvailable) return String(firstAvailable.size);
      return String(v[0].size);
    }
    const sizes = getSizesForColor(color);
    return sizes.length > 0 ? sizes[0] : null;
  });

  // COLOR CHANGE LOGIC
  const handleColorChange = useCallback(
    (newColor) => {
      setSelectedColor(newColor);
      const variants = product?.variants?.[newColor];
      if (Array.isArray(variants) && variants.length > 0) {
        const firstWithStock = variants.find((v) => Number(v.stock) > 0);
        setSelectedSize(
          firstWithStock
            ? String(firstWithStock.size)
            : String(variants[0].size),
        );
      } else {
        const newSizes = getSizesForColor(newColor);
        if (newSizes.length > 0) setSelectedSize(newSizes[0]);
      }
    },
    [product, getSizesForColor],
  );

  // 3. ACCURATE STOCK CALCULATION
  const currentStock = useMemo(() => {
    if (!product?.variants || Object.keys(product.variants).length === 0) {
      return Number(product?.stockQuantity ?? product?.stock_quantity ?? 0);
    }
    const variantData = product.variants[selectedColor];
    if (!Array.isArray(variantData)) return 0;
    const selectedV = variantData.find(
      (v) => String(v.size) === String(selectedSize),
    );

    return selectedV ? Number(selectedV.stock) : 0;
  }, [product, selectedColor, selectedSize]);

  // CRITICAL: This determines if the button is disabled
  const isCurrentSelectionSoldOut = currentStock <= 0;

  // 4. Image filtering
  const images = useMemo(() => {
    if (!product) return [];
    const colorVariants = product?.variants?.[selectedColor];

    if (Array.isArray(colorVariants) && colorVariants.length > 0) {
      const variantWithImages = colorVariants.find(
        (v) => Array.isArray(v.images) && v.images.length > 0,
      );
      if (variantWithImages) return variantWithImages.images;
    }

    if (Array.isArray(product.images)) {
      const filtered = product.images.filter((img) => {
        const url = img.toLowerCase();
        const color = selectedColor.toLowerCase();
        if (color === "silver") return !url.includes("gold");
        return url.includes(color);
      });
      return filtered.length > 0 ? filtered : product.images.slice(0, 4);
    }
    return [product.thumbnail].filter(Boolean);
  }, [product, selectedColor]);

  const handleAddToBag = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault();

      if (isCurrentSelectionSoldOut || currentStock <= 0) {
        console.error("Attempted to add out-of-stock item");
        return;
      }

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
    },
    [
      product,
      isCurrentSelectionSoldOut,
      currentStock,
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
          currentStock={currentStock}
          isSoldOut={isCurrentSelectionSoldOut}
          setSelectedSize={setSelectedSize}
          setSelectedColor={handleColorChange}
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <Loader className="h-12 w-12" />
      </div>
    );
  }

  if (!product)
    return (
      <div className="p-20 text-center font-ui text-black/50">
        Product not found.
      </div>
    );

  return <ProductView key={product.id} product={product} />;
}
