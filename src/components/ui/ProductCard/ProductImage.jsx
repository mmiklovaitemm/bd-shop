import { useMemo, useState } from "react";
import cn from "@/utils/cn";
import useLanguage from "@/context/useLanguage";

/**
 * SMART FILTER:
 * Distinguishes between database data (which may contain localhost)
 * and static imports (which contain Vite-generated hashes).
 */
const getFinalUrl = (rawPath) => {
  if (!rawPath || typeof rawPath !== "string") return "";

  const RENDER_BACKEND = "https://bd-shop-gfva.onrender.com";
  const VERCEL_FRONTEND = "https://bd-shop-gray.vercel.app";

  // 1. If the path is already a full Vercel URL (e.g., from Best Sellers static import),
  // we return it as-is to preserve Vite-generated hashes (-CwBIXg4R.webp).
  if (rawPath.startsWith("https://") && rawPath.includes("vercel.app")) {
    return rawPath;
  }

  // 2. Sanitize localhost remains from the development environment
  let cleanPath = rawPath.replace(/http:\/\/localhost:\d+/, "");
  const purePath = cleanPath.replace(/^\/+/, "");

  // 3. ROUTING LOGIC BASED ON DIRECTORY:

  // A. Admin-uploaded images (hosted on Render backend)
  if (purePath.includes("uploads/")) {
    return `${RENDER_BACKEND}/${purePath}`;
  }

  // B. Static images from the DB or developer imports
  // Checks if the path includes /products/ or starts with /assets/
  if (purePath.startsWith("products/") || purePath.startsWith("assets/")) {
    return `${VERCEL_FRONTEND}/${purePath}`;
  }

  // C. Fallback: If only the filename is provided (e.g., "ring.webp")
  const fileName = purePath.split("/").pop();
  return `${VERCEL_FRONTEND}/products/rings/${fileName}`;
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

  // Sync internal state if the src prop changes
  if (src !== status.currentSrc) {
    setStatus({ currentSrc: src, errored: false });
  }

  const finalSrc = useMemo(() => getFinalUrl(src), [src]);

  const showLoader = !loaded && !status.errored;

  // Render fallback placeholder if an error occurs or src is missing
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
        alt={alt || "Product"}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "h-full w-full object-cover transition-all duration-500",
          !loaded ? "opacity-0 blur-lg" : "opacity-100 blur-0",
          className,
        )}
        onLoad={onLoad}
        onError={(e) => {
          // Log error and update state to show "No Image" placeholder
          console.warn("Image load failed. Tried to get it from:", finalSrc);
          setStatus((prev) => ({ ...prev, errored: true }));
          if (onError) onError(e);
        }}
        {...rest}
      />
    </div>
  );
}
