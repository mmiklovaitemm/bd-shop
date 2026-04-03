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

  // 1. Spalvų paruošimas
  const availableColors = useMemo(() => {
    const colors = Array.isArray(product?.colors) ? product.colors : [];
    return colors.length > 0 ? colors : Object.keys(product?.variants || {});
  }, [product]);

  const [selectedColor, setSelectedColor] = useState(
    availableColors[0] || "silver",
  );

  // 2. DYDŽIŲ PARUOŠIMAS (Visada paverčiame į String)
  const effectiveAvailableSizes = useMemo(() => {
    const v = product?.variants?.[selectedColor];
    if (Array.isArray(v) && v.length > 0 && typeof v[0] === "object") {
      return v.map((item) => String(item.size));
    }
    if (Array.isArray(product?.sizes)) {
      return product.sizes.map((s) => String(s));
    }
    return [];
  }, [product, selectedColor]);

  // Saugus pradinio dydžio nustatymas
  const [selectedSize, setSelectedSize] = useState(() => {
    const initialV = product?.variants?.[availableColors[0] || "silver"];
    if (Array.isArray(initialV) && initialV.length > 0)
      return String(initialV[0].size);
    if (Array.isArray(product?.sizes) && product.sizes.length > 0)
      return String(product.sizes[0]);
    return null;
  });

  // 3. Likučio skaičiavimas (Stock)
  const currentStock = useMemo(() => {
    const variantData = product?.variants?.[selectedColor];
    const selectedV = Array.isArray(variantData)
      ? variantData.find((v) => String(v.size) === String(selectedSize))
      : null;

    if (selectedV && selectedV.stock !== undefined) {
      return Number(selectedV.stock);
    }
    // Jei variante stock nėra, paimame tą 10 iš stockQuantity
    return Number(product?.stockQuantity ?? product?.stock_quantity ?? 10);
  }, [product, selectedColor, selectedSize]);

  const isCurrentSelectionSoldOut = currentStock <= 0;

  // 4. Nuotraukų parinkimas
  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      const filtered = product.images.filter((img) =>
        img.toLowerCase().includes(selectedColor.toLowerCase()),
      );
      if (filtered.length > 0) return filtered;
      return product.images.slice(0, 4);
    }
    return [product.thumbnail].filter(Boolean);
  }, [product, selectedColor]);

  const handleAddToBag = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault();
      if (isCurrentSelectionSoldOut) return;

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
          setSelectedSize={setSelectedSize}
          setSelectedColor={setSelectedColor}
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
