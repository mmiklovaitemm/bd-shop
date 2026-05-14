import { useMemo, useState } from "react";
import cn from "@/utils/cn";
import useLanguage from "@/context/useLanguage";

const getFinalUrl = (rawPath) => {
  if (!rawPath || typeof rawPath !== "string") return "";

  const RENDER_BACKEND = "https://bd-shop-gfva.onrender.com";
  const VERCEL_FRONTEND = "https://bd-shop-gray.vercel.app";

  // 1. CLOUDINARY, EXTERNAL LINKS
  if (
    rawPath.startsWith("http") &&
    (rawPath.includes("cloudinary.com") || !rawPath.includes("localhost"))
  ) {
    if (!rawPath.includes("localhost")) {
      return rawPath;
    }
  }

  // 2. full Vercel URL
  if (rawPath.startsWith("https://") && rawPath.includes("vercel.app")) {
    return rawPath;
  }

  // 3. clean localhost remains from database data
  let cleanPath = rawPath.replace(/http:\/\/localhost:\d+/, "");
  const purePath = cleanPath.replace(/^\/+/, "");

  // 4. ROUTING LOGIC:
  // A. Admin-uploaded images if still stored on Render server
  if (purePath.includes("uploads/")) {
    return `${RENDER_BACKEND}/${purePath}`;
  }

  // B. Static images / public assets
  if (purePath.startsWith("products/") || purePath.startsWith("assets/")) {
    return `${VERCEL_FRONTEND}/${purePath}`;
  }

  // C. Fallback: if only a filename is provided
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
