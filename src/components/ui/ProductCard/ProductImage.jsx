import { useMemo, useState } from "react";
import cn from "@/utils/cn";
import useLanguage from "@/context/useLanguage";

/**
 * 1. If path has "uploads" -> it's from Admin panel (Render server).
 * 2. If path has "products/" -> it's static (Vercel server).
 * 3. We clean any "localhost" remains.
 */
const getFinalUrl = (rawPath) => {
  if (!rawPath || typeof rawPath !== "string") return "";

  const RENDER_BACKEND = "https://bd-shop-gfva.onrender.com";
  const VERCEL_FRONTEND = "https://bd-shop-gray.vercel.app";

  let cleanPath = rawPath.replace(/http:\/\/localhost:\d+/, "");

  const purePath = cleanPath.replace(/^\/+/, "");

  if (purePath.includes("uploads/")) {
    return `${RENDER_BACKEND}/${purePath}`;
  }

  if (purePath.startsWith("products/")) {
    return `${VERCEL_FRONTEND}/${purePath}`;
  }

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
          console.warn("Failed at:", finalSrc);
          setStatus((prev) => ({ ...prev, errored: true }));
          if (onError) onError(e);
        }}
        {...rest}
      />
    </div>
  );
}
