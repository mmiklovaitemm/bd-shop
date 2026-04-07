import { useMemo, useState } from "react";
import cn from "@/utils/cn";
import useLanguage from "@/context/useLanguage";

const getCleanAssetUrl = (rawPath) => {
  if (!rawPath || typeof rawPath !== "string") return "";

  // The images are hosted on your frontend server (Vercel)
  const VERCEL_BASE = "https://bd-shop-gray.vercel.app/assets";

  // Extract just the filename (e.g., "bond-bracelet-2.webp")
  // This removes "http://localhost:5173/products/rings/" part from DB
  const fileName = rawPath.split("/").pop();

  // Combine to create: https://bd-shop-gray.vercel.app/assets/bond-bracelet-2.webp
  return `${VERCEL_BASE}/${fileName}`;
};

export default function ProductImage({
  src,
  srcSet,
  sizes,
  alt,
  loaded,
  onLoad,
  onError,
  reduceMotion = false,
  className,
  priority = false,
  ...rest
}) {
  const { t } = useLanguage();
  const [status, setStatus] = useState({ currentSrc: src, errored: false });

  // Sync state if src changes
  if (src !== status.currentSrc) {
    setStatus({ currentSrc: src, errored: false });
  }

  const finalSrc = useMemo(() => {
    return getCleanAssetUrl(src);
  }, [src]);

  const showLoader = !loaded && !status.errored;

  if (status.errored || !finalSrc) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-[#F5F5F5] text-[10px] text-black/20 uppercase tracking-widest",
          className,
        )}
      >
        {t.noImage || "No image"}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F5F5F5]">
      {showLoader && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
          <div
            className={cn(
              "h-5 w-5 animate-spin rounded-full border-2 border-black/10 border-t-black",
              reduceMotion && "animate-none",
            )}
          />
        </div>
      )}

      <img
        key={finalSrc}
        src={finalSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt || "Product image"}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className={cn(
          "h-full w-full object-cover select-none transition-all duration-500",
          !loaded ? "opacity-0 blur-lg" : "opacity-100 blur-0",
          className,
        )}
        onLoad={onLoad}
        onError={(e) => {
          console.warn("Failed to load image from Vercel assets:", finalSrc);
          setStatus((prev) => ({ ...prev, errored: true }));
          if (onError) onError(e);
        }}
        {...rest}
      />
    </div>
  );
}
