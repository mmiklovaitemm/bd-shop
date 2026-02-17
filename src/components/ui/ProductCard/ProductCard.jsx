import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import useFavorites from "@/context/useFavorites";
import useAddToCart from "@/hooks/useAddToCart";

import cn from "@/utils/cn";

import useMediaQuery from "@/hooks/useMediaQuery";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import useImagePreload from "@/hooks/useImagePreload";

import ProductImage from "@/components/ui/ProductCard/ProductImage";
import DesktopHoverTitle from "@/components/ui/ProductCard/DesktopHoverTitle";
import BottomBar from "@/components/ui/ProductCard/BottomBar";
import ActionButtons from "@/components/ui/ProductCard/ActionButtons";

import useProductCardMedia from "@/components/ui/ProductCard/useProductCardMedia";

const DESKTOP_BREAKPOINT = "1024px";
const IMAGE_PRELOAD_MARGIN = "300px";

export default function ProductCard({
  product,
  onAddToCart,
  onAddToFavorites,
  onImageError,
  onMediaReady,
}) {
  const isDesktop = useMediaQuery(`(min-width: ${DESKTOP_BREAKPOINT})`);
  const { has, toggle: toggleFavorite } = useFavorites();
  const { addToCart } = useAddToCart();

  const { safeProduct, baseColor, mainSrc, hoverSrc, imageMeta } =
    useProductCardMedia(product);

  const isWishlisted = has(safeProduct?.id);

  const [cardRef, isInView] = useIntersectionObserver();

  const [loadedMain, setLoadedMain] = useState(false);
  const [loadedHover, setLoadedHover] = useState(false);

  const prevMainSrc = useRef(mainSrc);
  const prevHoverSrc = useRef(hoverSrc);

  useLayoutEffect(() => {
    if (mainSrc !== prevMainSrc.current) {
      prevMainSrc.current = mainSrc;
      setTimeout(() => setLoadedMain(false), 0);
    }
    if (hoverSrc !== prevHoverSrc.current) {
      prevHoverSrc.current = hoverSrc;
      setTimeout(() => setLoadedHover(false), 0);
    }
  }, [mainSrc, hoverSrc]);

  useImagePreload(
    hoverSrc,
    isDesktop && isInView,
    () => setLoadedHover(true),
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

  const handleImageError = useCallback(
    (e) => {
      onImageError?.(e);
    },
    [onImageError],
  );

  const handleAddToCart = useCallback(
    (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();

      if (!safeProduct?.id) return;

      addToCart({
        product: safeProduct,
        color: baseColor || "silver",
        size: null,
        quantity: 1,
        image: mainSrc || safeProduct.thumbnail || "",
      });

      onAddToCart?.(e);
    },
    [addToCart, safeProduct, baseColor, mainSrc, onAddToCart],
  );

  if (!safeProduct?.id) return null;

  const hasHoverImage = Boolean(hoverSrc);
  const href = `/collections/${safeProduct.id}`;
  const reduceMotion = !isDesktop;

  return (
    <article
      ref={cardRef}
      data-card
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      className={cn(
        "group bg-white w-full h-full select-none",
        isDesktop
          ? "active:brightness-95"
          : "active:brightness-100 focus:outline-none focus:ring-0",
      )}
    >
      <Link
        to={href}
        className={cn(
          "block select-none",
          !isDesktop && "active:bg-transparent focus:outline-none",
        )}
        style={
          !isDesktop ? { WebkitTapHighlightColor: "transparent" } : undefined
        }
        aria-label={`Open ${safeProduct.name}`}
      >
        <div
          className="relative w-full h-[340px] overflow-hidden bg-black/5 select-none"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        >
          <ProductImage
            src={mainSrc}
            srcSet={imageMeta.srcSet}
            sizes={imageMeta.sizes}
            alt={safeProduct.name}
            loaded={loadedMain}
            onLoad={handleMainImageLoad}
            onError={handleImageError}
            reduceMotion={reduceMotion}
            className={cn(
              isDesktop && hasHoverImage
                ? "lg:group-hover:opacity-0 lg:group-hover:scale-[1.02]"
                : "",
            )}
          />

          {isDesktop && hasHoverImage ? (
            <ProductImage
              src={hoverSrc}
              alt={`${safeProduct.name} - hover`}
              loaded={loadedHover}
              onLoad={handleHoverLoad}
              onError={handleImageError}
              reduceMotion={false}
              loadedClassName="opacity-0"
              notLoadedClassName="opacity-0"
              className={cn(
                "opacity-0 lg:group-hover:opacity-100",
                "scale-100 lg:group-hover:scale-[1.04]",
                !loadedHover && "lg:group-hover:opacity-0",
              )}
            />
          ) : null}

          {isDesktop ? (
            <div className="pointer-events-none absolute inset-0 bg-black/55 opacity-0 transition-opacity duration-200 ease-out lg:group-hover:opacity-100" />
          ) : null}

          {isDesktop ? <DesktopHoverTitle product={safeProduct} /> : null}

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

          <BottomBar
            product={safeProduct}
            onAddToCart={handleAddToCart}
            isDesktop={isDesktop}
          />
        </div>
      </Link>
    </article>
  );
}
