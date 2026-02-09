import { useCallback, useRef, useState } from "react";
import IconButton from "@/components/ui/IconButton";
import AddToBagButton from "@/components/ui/AddToBagButton";

import heartIcon from "@/assets/ui/heart.svg";
import bagIcon from "@/assets/ui/shopping-bag.svg";

export default function ProductCard({
  product,
  onAddToCart,
  onAddToFavorites,
  onImageError,
  onMediaReady,
  priority = false,
}) {
  const [loadedMain, setLoadedMain] = useState(false);
  const [loadedHover, setLoadedHover] = useState(false);

  // MAIN image
  const imgSrc =
    typeof product.image === "string" ? product.image : product.image?.src;
  const imgSrcSet =
    typeof product.image === "string" ? undefined : product.image?.srcSet;
  const imgSizes =
    typeof product.image === "string" ? undefined : product.image?.sizes;

  // HOVER image (…-2.png)
  const hoverSrc = product?.variants?.silver?.[1];

  // Hover preload
  const preloadedRef = useRef(false);
  const preloadHover = useCallback(() => {
    if (!hoverSrc) return;
    if (preloadedRef.current || loadedHover) return;

    preloadedRef.current = true;

    const img = new Image();
    img.src = hoverSrc;
    img.onload = () => setLoadedHover(true);
  }, [hoverSrc, loadedHover]);

  return (
    <article
      data-card
      onPointerEnter={preloadHover}
      className="
        group bg-white w-full h-full
        transition-transform duration-200 ease-out
        will-change-transform
        hover:scale-[1.02]
      "
    >
      <div className="relative w-full h-[340px] overflow-hidden bg-black/5">
        {!loadedMain && (
          <div className="absolute inset-0 animate-pulse bg-black/10" />
        )}

        {/* MAIN image */}
        <img
          src={imgSrc}
          srcSet={imgSrcSet}
          sizes={imgSizes}
          alt={product.name}
          className={[
            "absolute inset-0 h-full w-full object-cover transition-all duration-300 ease-out",
            loadedMain ? "opacity-100" : "opacity-0",
            hoverSrc ? "group-hover:opacity-0 group-hover:scale-[1.02]" : "",
          ].join(" ")}
          onError={onImageError}
          onLoad={(e) => {
            setLoadedMain(true);
            onMediaReady?.(e);
          }}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchpriority={priority ? "high" : "auto"}
        />

        {/* HOVER image */}
        {hoverSrc ? (
          <img
            src={hoverSrc}
            alt={`${product.name} - hover`}
            className={[
              "absolute inset-0 h-full w-full object-cover transition-all duration-300 ease-out",
              "opacity-0 group-hover:opacity-100",
              "scale-100 group-hover:scale-[1.04]",
              loadedHover ? "" : "group-hover:opacity-0",
            ].join(" ")}
            onLoad={() => setLoadedHover(true)}
            onError={onImageError}
            loading="lazy"
            decoding="async"
          />
        ) : null}

        {/* Hover dark overlay */}
        <div className="pointer-events-none absolute inset-0 bg-black/55 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />

        {/* CENTER (Desktop/Tablet): title only */}
        <div className="pointer-events-none absolute inset-0 hidden md:flex items-center justify-center px-6 text-center">
          <p
            className="
              opacity-0 translate-y-2
              group-hover:opacity-100 group-hover:translate-y-0
              transition-all duration-200 ease-out
              text-white font-display text-[20px] leading-tight
              max-w-[90%]
            "
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

        {/* CENTER (Mobile): title + price */}
        <div className="pointer-events-none absolute inset-0 flex md:hidden items-center justify-center px-6 text-center">
          <div
            className="
              opacity-0 translate-y-2
              group-hover:opacity-100 group-hover:translate-y-0
              transition-all duration-200 ease-out
              text-white
              max-w-[90%]
            "
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

        <IconButton
          variant="overlay"
          icon={bagIcon}
          onClick={onAddToCart}
          aria-label={`Add ${product.name} to cart`}
          className="left-3"
        />

        <IconButton
          variant="overlay"
          icon={heartIcon}
          onClick={onAddToFavorites}
          aria-label={`Add ${product.name} to favorites`}
          className="right-3"
        />

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          {/* DEFAULT */}
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

          {/* HOVER - Desktop/Tablet */}
          <div className="pointer-events-none absolute inset-0 hidden md:flex items-center bg-black px-6 h-16 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
            <div className="flex w-full items-center justify-between gap-6">
              <p className="font-ui font-normal text-[14px] leading-none whitespace-nowrap text-white">
                {product.price}
              </p>
              <div className="pointer-events-auto">
                <AddToBagButton
                  onClick={onAddToCart}
                  icon={bagIcon}
                  ariaLabel={`Add ${product.name} to bag`}
                />
              </div>
            </div>
          </div>

          {/* HOVER - Mobile */}
          <div className="pointer-events-none absolute inset-0 flex md:hidden items-center justify-center bg-black px-6 h-16 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
            <div className="pointer-events-auto">
              <AddToBagButton
                onClick={onAddToCart}
                icon={bagIcon}
                ariaLabel={`Add ${product.name} to bag`}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
