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
      preloadedRef.current = false;
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
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-all duration-300 ease-out select-none pointer-events-none",
          loaded ? loadedClassName : notLoadedClassName,
          className,
        )}
      />
    </>
  );
}

function OverlayContent({ product, isRevealed }) {
  return (
    <>
      {/* Desktop: rodom per hover (tik lg+) */}
      <div className="pointer-events-none absolute inset-0 hidden lg:flex items-center justify-center px-6 text-center">
        <p
          className={cn(
            "opacity-0 translate-y-2",
            "lg:group-hover:opacity-100 lg:group-hover:translate-y-0",
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

      {/* Mobile/Tablet: rodom kai isRevealed */}
      <div className="pointer-events-none absolute inset-0 flex lg:hidden items-center justify-center px-6 text-center">
        <div
          className={cn(
            "translate-y-2",
            "transition-all duration-200 ease-out",
            "text-white max-w-[90%]",
            isRevealed ? "opacity-100 translate-y-0" : "opacity-0",
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

function BottomBar({ product, onAddToCart, isRevealed }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      {/* Default bar (name + price) */}
      <div
        className={cn(
          "bg-black/50 backdrop-blur-md px-6 h-16 text-white transition-opacity duration-200 ease-out flex items-center",
          // Desktop slepiam per hover (tik lg+)
          "lg:group-hover:opacity-0",
          // Mobile/tablet slepiam kai atidarom actions
          isRevealed ? "opacity-0 lg:opacity-100" : "opacity-100",
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

      {/* Desktop actions bar (tik lg+) */}
      <div className="pointer-events-none absolute inset-0 hidden lg:flex items-center bg-black px-6 h-16 opacity-0 transition-opacity duration-200 ease-out lg:group-hover:opacity-100">
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

      {/* Mobile/Tablet actions bar (rodom kai isRevealed) */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex lg:hidden items-center justify-center bg-black px-6 h-16 transition-opacity duration-200 ease-out",
          isRevealed ? "opacity-100" : "opacity-0",
        )}
      >
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

  // Mobile/Tablet: 1 tap atidaro actions, 2 tap veda i page
  const [isRevealed, setIsRevealed] = useState(false);

  // desktop = lg+
  const isDesktop = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches;
  }, []);

  return product ? (
    <article
      ref={cardRef}
      data-card
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onPointerLeave={() => {
        if (!isDesktop) setIsRevealed(false);
      }}
      className={cn(
        "group bg-white w-full h-full ui-interact select-none active:brightness-95",
      )}
    >
      <Link
        to={`/collections/${product.id}`}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className="block select-none"
        onClick={(e) => {
          if (isDesktop) return;
          if (!isRevealed) {
            e.preventDefault();
            setIsRevealed(true);
          }
        }}
      >
        <div
          className="relative w-full h-[340px] overflow-hidden bg-black/5 select-none"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* MAIN */}
          <ProductImage
            src={mainSrc}
            srcSet={imageMeta.srcSet}
            sizes={imageMeta.sizes}
            alt={product.name}
            loaded={loadedMain}
            onLoad={handleMainImageLoad}
            onError={handleImageError}
            className={
              hasHoverImage
                ? "lg:group-hover:opacity-0 lg:group-hover:scale-[1.02]"
                : ""
            }
          />

          {/* HOVER IMG - tik desktop per hover */}
          {hasHoverImage ? (
            <ProductImage
              src={hoverSrc}
              alt={`${product.name} - hover`}
              loaded={loadedHover}
              onLoad={handleHoverLoad}
              onError={handleImageError}
              loadedClassName="opacity-0"
              notLoadedClassName="opacity-0"
              className={cn(
                "opacity-0 lg:group-hover:opacity-100",
                "scale-100 lg:group-hover:scale-[1.04]",
                !loadedHover && "lg:group-hover:opacity-0",
              )}
            />
          ) : null}

          {/* Overlay: desktop hover, mobile kai isRevealed */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-black/55 transition-opacity duration-200 ease-out",
              "opacity-0 lg:group-hover:opacity-100",
              isRevealed ? "opacity-100 lg:opacity-0" : "",
            )}
          />

          <OverlayContent product={product} isRevealed={isRevealed} />

          <ActionButtons
            product={product}
            onAddToCart={onAddToCart}
            onAddToFavorites={onAddToFavorites}
          />

          <BottomBar
            product={product}
            onAddToCart={onAddToCart}
            isRevealed={isRevealed}
          />
        </div>
      </Link>
    </article>
  ) : null;
}
