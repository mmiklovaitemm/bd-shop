import { useMemo, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

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
import HowItWorksPanel from "@/pages/Product/components/HowItWorksPanel";

// Constants
import { HOVER_CLASSES } from "@/pages/Product/constants";

// Hooks
import useAddToCart from "@/hooks/useAddToCart";
import useBagDrawer from "@/store/useBagDrawer";

// Utils
import cn from "@/utils/cn";
import preventDragHandler from "@/utils/preventDrag";

// Helper
function getCurrentAbsoluteUrl() {
  // Works on client-side (Netlify/GH Pages)
  return window.location.href;
}

function ProductView({ product }) {
  const { addToCart } = useAddToCart();
  const openBag = useBagDrawer((s) => s.open);

  // UI state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Product selection state
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    product?.colors?.[0] || "silver",
  );
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || null);

  const [selectedService, setSelectedService] = useState(
    product?.details?.serviceOptions?.[0]?.value || null,
  );

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

      if (product.category === "personal" && !selectedService) {
        alert("Please choose service option.");
        return;
      }

      addToCart({
        product,
        category: product.category,
        color: selectedColor || "silver",
        size: selectedSize || null,
        quantity: quantity || 1,
        image: img,
        serviceOption: selectedService || null,
      });

      openBag();
    },
    [
      addToCart,
      openBag,
      product,
      selectedColor,
      selectedSize,
      quantity,
      selectedService,
    ],
  );

  // SEO text
  const seoTitle = useMemo(() => {
    const name = product?.name || "Product";
    return `${name} | UM Studio`;
  }, [product]);

  const seoDescription = useMemo(() => {
    const fromSeo = product?.seoDescription;
    if (fromSeo && String(fromSeo).trim().length > 0) return fromSeo;

    const fromDesc = product?.description;
    if (fromDesc && String(fromDesc).trim().length > 0) return fromDesc;

    const name = product?.name || "handmade jewelry";
    return `Discover ${name} by UM Studio – handmade silver jewelry crafted with love. Minimalist design, perfect for gifts and everyday elegance.`;
  }, [product]);

  // Canonical/og:url
  const canonicalUrl = useMemo(() => getCurrentAbsoluteUrl(), []);

  // OG image
  const ogImage = "https://um-studio-bd.netlify.app/og-image.png";

  return (
    <main
      className="mx-auto w-full md:max-w-[1200px] lg:max-w-none px-4 md:px-1 lg:px-2 py-4 md:py-4 select-none"
      onDragStart={preventDragHandler}
    >
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:site_name" content="UM Studio" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="UM Studio handmade jewelry – silver rings and earrings on a neutral background"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

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
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          onAddToBag={handleAddToBag}
          onOpenDetails={() => setIsDetailsOpen(true)}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
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
