// src/components/ui/ProductCard.jsx
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import useFavorites from "@/context/useFavorites";
import useAddToCart from "@/hooks/useAddToCart";

import IconButton from "@/components/ui/IconButton";
import AddToBagButton from "@/components/ui/AddToBagButton";

import heartIcon from "@/assets/ui/heart.svg";
import heartWhiteFillIcon from "@/assets/ui/heart-white-fill.svg";
import bagIcon from "@/assets/ui/shopping-bag.svg";

import cn from "@/utils/cn";

import useMediaQuery from "@/hooks/useMediaQuery";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import useImagePreload from "@/hooks/useImagePreload";

const DESKTOP_BREAKPOINT = "1024px";
const IMAGE_PRELOAD_MARGIN = "300px";

function ProductImage({
  src,
  alt,
  sizes,
  srcSet,
  loaded,
  onLoad,
  onError,
  className,
  loadedClassName = "opacity-100",
  notLoadedClassName = "opacity-0",
  reduceMotion = false,
}) {
  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-black/10" />
      )}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className={cn(
          "absolute inset-0 h-full w-full object-cover select-none pointer-events-none",
          reduceMotion
            ? "transition-none"
            : "transition-all duration-300 ease-out",
          loaded ? loadedClassName : notLoadedClassName,
          className,
        )}
      />
    </>
  );
}

function DesktopHoverTitle({ product }) {
  const textStyle = {
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:flex items-center justify-center px-6 text-center">
      <p
        className={cn(
          "opacity-0 translate-y-2",
          "lg:group-hover:opacity-100 lg:group-hover:translate-y-0",
          "transition-all duration-200 ease-out",
          "text-white font-display text-[20px] leading-tight",
          "max-w-[90%]",
        )}
        style={textStyle}
      >
        {product.name}
      </p>
    </div>
  );
}

function BottomBar({ product, onAddToCart, isDesktop }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <div
        className={cn(
          "bg-black/50 backdrop-blur-md px-6 h-16 text-white flex items-center",
          isDesktop
            ? "transition-opacity duration-200 ease-out lg:group-hover:opacity-0"
            : "transition-none",
        )}
      >
        <div className="flex w-full items-center gap-4 justify-center">
          <p className="min-w-0 font-display font-normal text-[14px] leading-none truncate">
            {product.name}
          </p>
          <div className="h-px w-[25%] bg-white/90 flex-none" />
          <p className="flex-none whitespace-nowrap font-ui font-normal text-[14px] leading-none">
            {product.price}
          </p>
        </div>
      </div>

      {isDesktop ? (
        <div className="pointer-events-none absolute inset-0 hidden lg:flex items-center bg-black px-6 h-16 opacity-0 transition-opacity duration-200 ease-out lg:group-hover:opacity-100">
          <div className="flex w-full items-center justify-between gap-6">
            <p className="font-ui font-normal text-[14px] leading-none whitespace-nowrap text-white">
              {product.price}
            </p>
            <div className="pointer-events-auto">
              <AddToBagButton
                onClick={(e) => {
                  e?.stopPropagation?.();
                  e?.preventDefault?.();
                  onAddToCart?.(e);
                }}
                icon={bagIcon}
                ariaLabel={`Add ${product.name} to bag`}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ActionButtons({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) {
  const handleCartClick = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      onAddToCart?.(e);
    },
    [onAddToCart],
  );

  const handleFavoriteClick = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      onToggleWishlist?.(e);
    },
    [onToggleWishlist],
  );

  return (
    <>
      <IconButton
        variant="overlay"
        icon={bagIcon}
        onClick={handleCartClick}
        aria-label={`Add ${product.name} to cart`}
        className="left-3"
      />

      <IconButton
        variant="overlay"
        icon={isWishlisted ? heartWhiteFillIcon : heartIcon}
        onClick={handleFavoriteClick}
        aria-label={
          isWishlisted
            ? `Remove ${product.name} from favorites`
            : `Add ${product.name} to favorites`
        }
        className={cn("right-3", isWishlisted && "[&>img]:filter-none")}
      />
    </>
  );
}

export default function ProductCard({
  product,
  onAddToCart,
  onAddToFavorites,
  onImageError,
  onMediaReady,
}) {
  // HOOK’AI VISADA KVIEČIAMI (jokių early return čia!)
  const isDesktop = useMediaQuery(`(min-width: ${DESKTOP_BREAKPOINT})`);
  const { has, toggle: toggleFavorite } = useFavorites();
  const { addToCart } = useAddToCart();

  const safeProduct = useMemo(
    () => ({
      variants: {},
      colors: [],
      thumbnail: "",
      image: null,
      name: "",
      price: "",
      id: null,
      ...product,
    }),
    [product],
  );

  const isWishlisted = has(safeProduct?.id);

  const baseColor = useMemo(() => {
    const colors = safeProduct.colors || [];
    const variants = safeProduct.variants || {};
    const found = colors.find((c) => (variants?.[c]?.length ?? 0) > 0);
    return found || "silver";
  }, [safeProduct.colors, safeProduct.variants]);

  const { mainSrc, hoverSrc } = useMemo(() => {
    const variants = safeProduct.variants || {};
    const arr = variants[baseColor] || [];

    const main =
      arr[0] ||
      safeProduct.thumbnail ||
      (typeof safeProduct.image === "string"
        ? safeProduct.image
        : safeProduct.image?.src) ||
      "";

    const hover = arr[1] || null;

    return { mainSrc: main, hoverSrc: hover };
  }, [
    safeProduct.variants,
    safeProduct.thumbnail,
    safeProduct.image,
    baseColor,
  ]);

  const imageMeta = useMemo(() => {
    if (typeof safeProduct.image === "string") {
      return { srcSet: undefined, sizes: undefined };
    }
    return {
      srcSet: safeProduct.image?.srcSet,
      sizes: safeProduct.image?.sizes,
    };
  }, [safeProduct.image]);

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

  // DABAR (po hook’ų) galim daryti early return
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
