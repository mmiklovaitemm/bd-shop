// src/components/ProductCard.jsx
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import IconButton from "@/components/ui/IconButton";
import AddToBagButton from "@/components/ui/AddToBagButton";

import heartIcon from "@/assets/ui/heart.svg";
import bagIcon from "@/assets/ui/shopping-bag.svg";

function useIntersectionObserver(options = {}) {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px", ...options },
    );

    observer.observe(element);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [elementRef, isInView];
}

function useImagePreload(src, shouldPreload, onLoaded) {
  const preloadedRef = useRef(false);

  useEffect(() => {
    if (!src || !shouldPreload || preloadedRef.current) return;

    preloadedRef.current = true;
    const img = new Image();
    img.src = src;

    img.onload = () => onLoaded?.();
    img.onerror = () => {
      preloadedRef.current = false; // allow retry
    };
  }, [src, shouldPreload, onLoaded]);
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ProductImage({
  src,
  alt,
  sizes,
  srcSet,
  priority,
  loaded,
  onLoad,
  onError,
  className,
  loadedClassName = "opacity-100",
  notLoadedClassName = "opacity-0",
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
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-all duration-300 ease-out",
          loaded ? loadedClassName : notLoadedClassName,
          className,
        )}
      />
    </>
  );
}

function OverlayContent({ product }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 hidden md:flex items-center justify-center px-6 text-center">
        <p
          className={cn(
            "opacity-0 translate-y-2",
            "group-hover:opacity-100 group-hover:translate-y-0",
            "transition-all duration-200 ease-out",
            "text-white font-display text-[20px] leading-tight",
            "max-w-[90%]",
          )}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-0 flex md:hidden items-center justify-center px-6 text-center">
        <div
          className={cn(
            "opacity-0 translate-y-2",
            "group-hover:opacity-100 group-hover:translate-y-0",
            "transition-all duration-200 ease-out",
            "text-white",
            "max-w-[90%]",
          )}
        >
          <p
            className="font-display text-[20px] leading-tight"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.name}
          </p>
          <p className="mt-2 font-ui text-[14px] text-white/90">
            {product.price}
          </p>
        </div>
      </div>
    </>
  );
}

function BottomBar({ product, onAddToCart }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <div className="bg-black/50 backdrop-blur-md px-6 h-16 text-white transition-opacity duration-200 ease-out group-hover:opacity-0 flex items-center">
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

      <div className="pointer-events-none absolute inset-0 hidden md:flex items-center bg-black px-6 h-16 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
        <div className="flex w-full items-center justify-between gap-6">
          <p className="font-ui font-normal text-[14px] leading-none whitespace-nowrap text-white">
            {product.price}
          </p>
          <div className="pointer-events-auto">
            <AddToBagButton
              onClick={(e) => {
                e?.preventDefault?.();
                e?.stopPropagation?.();
                onAddToCart?.(e);
              }}
              icon={bagIcon}
              ariaLabel={`Add ${product.name} to bag`}
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 flex md:hidden items-center justify-center bg-black px-6 h-16 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
        <div className="pointer-events-auto">
          <AddToBagButton
            onClick={(e) => {
              e?.preventDefault?.();
              e?.stopPropagation?.();
              onAddToCart?.(e);
            }}
            icon={bagIcon}
            ariaLabel={`Add ${product.name} to bag`}
          />
        </div>
      </div>
    </div>
  );
}

function ActionButtons({ product, onAddToCart, onAddToFavorites }) {
  const handleCartClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onAddToCart?.(e);
    },
    [onAddToCart],
  );

  const handleFavoriteClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onAddToFavorites?.(e);
    },
    [onAddToFavorites],
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
        icon={heartIcon}
        onClick={handleFavoriteClick}
        aria-label={`Add ${product.name} to favorites`}
        className="right-3"
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
  priority = false,
}) {
  const safeProduct = product ?? { variants: {}, colors: [], thumbnail: "" };

  const baseColor = useMemo(() => {
    const colors = safeProduct.colors || [];
    const variants = safeProduct.variants || {};
    const found = colors.find((c) => (variants?.[c]?.length ?? 0) > 0);
    return found || "silver";
  }, [safeProduct.colors, safeProduct.variants]);

  const { mainSrc, hoverSrc } = useMemo(() => {
    const variants = safeProduct.variants || {};
    const arr = variants?.[baseColor] || [];

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

  useImagePreload(hoverSrc, isInView, () => setLoadedHover(true));

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

  const hasHoverImage = Boolean(hoverSrc);

  return product ? (
    <article
      ref={cardRef}
      data-card
      className={cn(
        "group bg-white w-full h-full",
        "transition-transform duration-200 ease-out",
        "will-change-transform",
        "hover:scale-[1.02]",
      )}
    >
      <Link to={`/collections/${product.id}`} className="block">
        <div className="relative w-full h-[340px] overflow-hidden bg-black/5">
          {/* MAIN (1 nuotrauka) */}
          <ProductImage
            src={mainSrc}
            srcSet={imageMeta.srcSet}
            sizes={imageMeta.sizes}
            alt={product.name}
            priority={priority}
            loaded={loadedMain}
            onLoad={handleMainImageLoad}
            onError={handleImageError}
            className={
              hasHoverImage
                ? "group-hover:opacity-0 group-hover:scale-[1.02]"
                : ""
            }
          />

          {/* HOVER (2 nuotrauka tik per hover) */}
          {hasHoverImage ? (
            <ProductImage
              src={hoverSrc}
              alt={`${product.name} - hover`}
              loaded={loadedHover}
              onLoad={handleHoverLoad}
              onError={handleImageError}
              // svarbiausia dalis: net kai loaded, likti hidden iki hover
              loadedClassName="opacity-0"
              notLoadedClassName="opacity-0"
              className={cn(
                "opacity-0 group-hover:opacity-100",
                "scale-100 group-hover:scale-[1.04]",
                !loadedHover && "group-hover:opacity-0",
              )}
            />
          ) : null}

          <div className="pointer-events-none absolute inset-0 bg-black/55 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />

          <OverlayContent product={product} />

          <ActionButtons
            product={product}
            onAddToCart={onAddToCart}
            onAddToFavorites={onAddToFavorites}
          />

          <BottomBar product={product} onAddToCart={onAddToCart} />
        </div>
      </Link>
    </article>
  ) : null;
}
