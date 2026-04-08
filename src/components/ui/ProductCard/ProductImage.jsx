import { useMemo, useState } from "react";
import cn from "@/utils/cn";
import useLanguage from "@/context/useLanguage";

/**
 * SMART FILTER:
 * Distinguishes between Cloudinary (external), database data (localhost remains),
 * and static imports
 */
const getFinalUrl = (rawPath) => {
  if (!rawPath || typeof rawPath !== "string") return "";

  const RENDER_BACKEND = "https://bd-shop-gfva.onrender.com";
  const VERCEL_FRONTEND = "https://bd-shop-gray.vercel.app";

  // 1. CLOUDINARY & EXTERNAL LINKS
  // If the URL is already complete (Cloudinary, Google), return it immediately.
  if (
    rawPath.startsWith("http") &&
    (rawPath.includes("cloudinary.com") || !rawPath.includes("localhost"))
  ) {
    // Check if it's not a localhost URL that needs sanitizing
    if (!rawPath.includes("localhost")) {
      return rawPath;
    }
  }

  // 2. Already a full Vercel URL (e.g., from static Vite imports)
  if (rawPath.startsWith("https://") && rawPath.includes("vercel.app")) {
    return rawPath;
  }

  // 3. Sanitize localhost remains from database data
  let cleanPath = rawPath.replace(/http:\/\/localhost:\d+/, "");
  const purePath = cleanPath.replace(/^\/+/, "");

  // 4. ROUTING LOGIC:

  // A. Admin-uploaded images if still stored on Render server (non-Cloudinary)
  if (purePath.includes("uploads/")) {
    return `${RENDER_BACKEND}/${purePath}`;
  }

  // B. Static images / public assets
  if (purePath.startsWith("products/") || purePath.startsWith("assets/")) {
    return `${VERCEL_FRONTEND}/${purePath}`;
  }

  // C. Fallback: if only a filename is provided (e.g., "ring.webp")
  const fileName = purePath.split("/").pop();
  if (fileName && fileName.includes(".")) {
    return `${VERCEL_FRONTEND}/products/rings/${fileName}`;
  }

  return rawPath; // Final safeguard
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
          console.warn("Image load failed. Tried to get it from:", finalSrc);
          setStatus((prev) => ({ ...prev, errored: true }));
          if (onError) onError(e);
        }}
        {...rest}
      />
    </div>
  );
}
