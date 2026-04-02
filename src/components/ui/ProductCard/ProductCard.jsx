import { useCallback, useState } from "react";
import { Link } from "react-router-dom";

import useFavorites from "@/context/useFavorites";
import useLanguage from "@/context/useLanguage";
import useAddToCart from "@/hooks/useAddToCart";
import cn from "@/utils/cn";

import useMediaQuery from "@/hooks/useMediaQuery";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import useImagePreload from "@/hooks/useImagePreload";
import usePreloadQueue from "@/hooks/usePreloadQueue";

import ProductImage from "@/components/ui/ProductCard/ProductImage";
import DesktopHoverTitle from "@/components/ui/ProductCard/DesktopHoverTitle";
import BottomBar from "@/components/ui/ProductCard/BottomBar";
import ActionButtons from "@/components/ui/ProductCard/ActionButtons";

import useProductCardMedia from "@/components/ui/ProductCard/useProductCardMedia";

const DESKTOP_BREAKPOINT = "1024px";
const IMAGE_PRELOAD_MARGIN = "120px";

export default function ProductCard({
  product,
  onAddToCart,
  onAddToFavorites,
  onImageError,
  onMediaReady,
}) {
  const { t } = useLanguage();
  const isDesktop = useMediaQuery(`(min-width: ${DESKTOP_BREAKPOINT})`);
  const { has, toggle: toggleFavorite } = useFavorites();
  const { addToCart } = useAddToCart();

  const { safeProduct, baseColor, mainSrc, hoverSrc, imageMeta } =
    useProductCardMedia(product);

  const isWishlisted = has(safeProduct?.id);
  const enqueuePreload = usePreloadQueue();
  const [cardRef, isInView] = useIntersectionObserver();

  const [loadedMain, setLoadedMain] = useState(false);
  const [loadedHover, setLoadedHover] = useState(false);

  // Synchronous State Syncing
  const [prevId, setPrevId] = useState(safeProduct?.id);

  if (safeProduct?.id !== prevId) {
    setPrevId(safeProduct?.id);
    setLoadedMain(false);
    setLoadedHover(false);
  }

  useImagePreload(
    hoverSrc,
    isDesktop && isInView,
    () => {
      enqueuePreload((done) => {
        setLoadedHover(true);
        done();
      });
    },
    IMAGE_PRELOAD_MARGIN,
  );

  const handleMainImageLoad = useCallback(
    (e) => {
      setLoadedMain(true);
      onMediaReady?.(e);
    },
    [onMediaReady],
  );

  const handleHoverLoad = useCallback(() => {
    setLoadedHover(true);
  }, []);

  const handleAddToCart = useCallback(
    (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      if (!safeProduct?.id || safeProduct?.isSoldOut) return;

      const selectedColor =
        baseColor || (safeProduct.colors ? safeProduct.colors[0] : "silver");

      const selectedSize =
        safeProduct.sizes && safeProduct.sizes.length > 0
          ? String(safeProduct.sizes[0])
          : null;

      addToCart({
        productId: String(safeProduct.id),
        name: safeProduct.name,
        price: safeProduct.price,
        color: selectedColor,
        size: selectedSize,
        quantity: 1,
        image: mainSrc || safeProduct.thumbnail || "",
        serviceOption: safeProduct.category === "personal" ? "shipping" : null,
      });

      onAddToCart?.(e);
    },
    [addToCart, safeProduct, baseColor, mainSrc, onAddToCart],
  );

  if (!safeProduct?.id) return null;

  const hasHoverImage = Boolean(hoverSrc) && hoverSrc !== mainSrc;
  const href = `/collections/${safeProduct.id}`;

  return (
    <article
      ref={cardRef}
      className={cn(
        "group bg-white w-full h-full select-none transition-all duration-500 ease-out",
        isDesktop ? "hover:-translate-y-1" : "",
      )}
    >
      <Link
        to={href}
        className="block select-none"
        aria-label={`${t.open} ${safeProduct.name}`}
      >
        <div className="relative w-full h-[340px] overflow-hidden bg-[#F5F5F5]">
          {!loadedMain && (
            <div className="absolute inset-0 z-[1] animate-pulse bg-neutral-200" />
          )}

          <div
            className={cn(
              "absolute inset-0 z-[2] transition-all duration-700 ease-in-out",
              isDesktop && hasHoverImage
                ? "lg:group-hover:opacity-0 lg:group-hover:scale-105"
                : "",
            )}
          >
            <ProductImage
              src={mainSrc}
              srcSet={imageMeta.srcSet}
              sizes={imageMeta.sizes}
              alt={safeProduct.name}
              loaded={loadedMain}
              onLoad={handleMainImageLoad}
              onError={onImageError}
              reduceMotion={!isDesktop}
              className="h-full w-full object-cover"
            />
          </div>

          {isDesktop && hasHoverImage && (
            <div className="absolute inset-0 z-[3] opacity-0 transition-all duration-700 ease-in-out lg:group-hover:opacity-100 lg:group-hover:scale-105">
              <ProductImage
                src={hoverSrc}
                alt={`${safeProduct.name} - alternate view`}
                loaded={loadedHover}
                onLoad={handleHoverLoad}
                onError={onImageError}
                reduceMotion={false}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {isDesktop && (
            <>
              <div className="pointer-events-none absolute inset-0 z-[10] bg-black/25 opacity-0 transition-opacity duration-300 ease-out lg:group-hover:opacity-100" />
              <div className="absolute inset-0 z-[11] flex items-center justify-center opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100">
                <DesktopHoverTitle product={safeProduct} />
              </div>
            </>
          )}

          {safeProduct.isSoldOut && (
            <div className="absolute left-4 top-4 z-[20] border border-black/70 bg-white/90 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.12em]">
              {t.soldOut}
            </div>
          )}

          <div className="absolute inset-0 z-[25]">
            <ActionButtons
              product={safeProduct}
              onAddToCart={handleAddToCart}
              isWishlisted={isWishlisted}
              onToggleWishlist={(e) => {
                e?.preventDefault?.();
                e?.stopPropagation?.();
                toggleFavorite(safeProduct.id);
                onAddToFavorites?.(e);
              }}
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 z-[25]">
            <BottomBar
              product={safeProduct}
              onAddToCart={handleAddToCart}
              isDesktop={isDesktop}
            />
          </div>
        </div>
      </Link>
    </article>
  );
}
