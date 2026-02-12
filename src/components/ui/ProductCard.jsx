// src/components/ui/ProductCard.jsx
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import IconButton from "@/components/ui/IconButton";
import AddToBagButton from "@/components/ui/AddToBagButton";

import heartIcon from "@/assets/ui/heart.svg";
import bagIcon from "@/assets/ui/shopping-bag.svg";

// UTILITY FUNCTIONS
import cn from "@/utils/cn";

// UTILITY HOOKS
import useMediaQuery from "@/hooks/useMediaQuery";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import useImagePreload from "@/hooks/useImagePreload";

// CONSTANTS
const CARD_HEIGHT = 340;
const DESKTOP_BREAKPOINT = "1024px";
const IMAGE_PRELOAD_MARGIN = "300px";
const MOBILE_REVEAL_TIMEOUT = 2500;

// SUB-COMPONENTS

// ProductImage handles image display with loading states
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

// OverlayContent displays product information on hover/reveal
function OverlayContent({ product, isRevealed }) {
  const textStyle = {
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  return (
    <>
      {/* Desktop hover title */}
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

      {/* Mobile/Tablet revealed */}
      <div className="pointer-events-none absolute inset-0 flex lg:hidden items-center justify-center px-6 text-center">
        <div
          className={cn(
            "translate-y-2 transition-all duration-200 ease-out text-white max-w-[90%]",
            isRevealed ? "opacity-100 translate-y-0" : "opacity-0",
          )}
        >
          <p
            className="font-display text-[20px] leading-tight"
            style={textStyle}
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

// BottomBar displays price and action buttons
function BottomBar({ product, onAddToCart, isRevealed }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      {/* Default bar */}
      <div
        className={cn(
          "bg-black/50 backdrop-blur-md px-6 h-16 text-white transition-opacity duration-200 ease-out flex items-center",
          "lg:group-hover:opacity-0",
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

      {/* Desktop actions bar */}
      <div className="pointer-events-none absolute inset-0 hidden lg:flex items-center bg-black px-6 h-16 opacity-0 transition-opacity duration-200 ease-out lg:group-hover:opacity-100">
        <div className="flex w-full items-center justify-between gap-6">
          <p className="font-ui font-normal text-[14px] leading-none whitespace-nowrap text-white">
            {product.price}
          </p>
          <div className="pointer-events-auto">
            <AddToBagButton
              onClick={(e) => {
                e?.stopPropagation?.();
                onAddToCart?.(e);
              }}
              icon={bagIcon}
              ariaLabel={`Add ${product.name} to bag`}
            />
          </div>
        </div>
      </div>

      {/* Mobile/Tablet actions bar */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 hidden xs:flex lg:hidden items-center justify-center bg-black px-6 h-16 transition-opacity duration-200 ease-out",
          isRevealed ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="pointer-events-auto">
          <AddToBagButton
            onClick={(e) => {
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

// ActionButtons handles cart and favorites actions
function ActionButtons({ product, onAddToCart, onAddToFavorites }) {
  const handleCartClick = useCallback(
    (e) => {
      e.stopPropagation();
      onAddToCart?.(e);
    },
    [onAddToCart],
  );

  const handleFavoriteClick = useCallback(
    (e) => {
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

// MAIN COMPONENT
export default function ProductCard({
  product,
  onAddToCart,
  onAddToFavorites,
  onImageError,
  onMediaReady,
}) {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(`(min-width: ${DESKTOP_BREAKPOINT})`);

  // Safe product access with defaults
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
  const href = `/collections/${product?.id}`;

  // Mobile/Tablet: 1 tap reveal, 2 tap navigate
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (isDesktop) return;
    if (!isRevealed) return;
    const t = setTimeout(() => setIsRevealed(false), MOBILE_REVEAL_TIMEOUT);
    return () => clearTimeout(t);
  }, [isRevealed, isDesktop]);

  const handleMobileCardTap = useCallback(() => {
    if (!product) return;
    if (!isRevealed) {
      setIsRevealed(true);
      return;
    }
    navigate(href);
  }, [isRevealed, navigate, href, product]);

  // Desktop: 1 click -> show 2nd image, 2 click -> navigate
  const [desktopPreview, setDesktopPreview] = useState(false);

  const resetDesktopPreview = useCallback(() => {
    setDesktopPreview(false);
  }, []);

  const handleDesktopLinkClick = useCallback(
    (e) => {
      if (!hasHoverImage) return;

      // 1 click -> prevent navigate + show hover image
      if (!desktopPreview) {
        e.preventDefault();
        setDesktopPreview(true);
        return;
      }

      // 2 click -> allow Link to navigate
    },
    [desktopPreview, hasHoverImage],
  );

  if (!product) return null;

  const CardInner = (
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
        className={cn(
          hasHoverImage
            ? "lg:group-hover:opacity-0 lg:group-hover:scale-[1.02]"
            : "",
          desktopPreview && hasHoverImage ? "opacity-0 scale-[1.02]" : "",
        )}
      />

      {/* HOVER IMG */}
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
            desktopPreview ? "opacity-100 scale-[1.04]" : "",
          )}
        />
      ) : null}

      {/* Overlay */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-black/55 transition-opacity duration-200 ease-out",
          "opacity-0 lg:group-hover:opacity-100",
          !isDesktop && isRevealed ? "opacity-100" : "",
        )}
      />

      <OverlayContent product={product} isRevealed={!isDesktop && isRevealed} />

      <ActionButtons
        product={product}
        onAddToCart={onAddToCart}
        onAddToFavorites={onAddToFavorites}
      />

      <BottomBar
        product={product}
        onAddToCart={onAddToCart}
        isRevealed={!isDesktop && isRevealed}
      />
    </div>
  );

  return (
    <article
      ref={cardRef}
      data-card
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onMouseLeave={resetDesktopPreview}
      className={cn(
        "group bg-white w-full h-full ui-interact select-none active:brightness-95",
      )}
    >
      {isDesktop ? (
        <Link
          to={href}
          className="block select-none"
          onClick={handleDesktopLinkClick}
        >
          {CardInner}
        </Link>
      ) : (
        <button
          type="button"
          className="block w-full text-left select-none"
          onClick={handleMobileCardTap}
          aria-label={`Open ${product.name}`}
        >
          {CardInner}
        </button>
      )}
    </article>
  );
}
