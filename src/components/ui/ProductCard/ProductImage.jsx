import { useMemo, useState } from "react";
import cn from "@/utils/cn";
import useLanguage from "@/context/useLanguage";

/**
 * Ensures the URL is absolute, secure (HTTPS), and points to the production server.
 * Replaces localhost or relative paths with the Render backend URL.
 */
const getCleanUrl = (path) => {
  if (!path || typeof path !== "string") return "";

  // 1. Handle cases where the path contains localhost (common in development DB)
  if (path.includes("localhost")) {
    const parts = path.split("/products/");
    const fileName = parts.length > 1 ? parts[1] : path.split("/").pop();
    return `https://bd-shop-gfva.onrender.com/products/${fileName}`;
  }

  // 2. Handle relative paths starting with /products
  if (path.startsWith("/products")) {
    return `https://bd-shop-gfva.onrender.com${path}`;
  }

  // 3. Ensure HTTPS for external URLs
  if (path.startsWith("http")) {
    return path.replace("http://", "https://");
  }

  // 4. Default case: append base URL to the path
  const BASE = "https://bd-shop-gfva.onrender.com";
  return `${BASE}/${path.replace(/^\/+/, "")}`;
};

const withLocalBase = (path) =>
  `${import.meta.env.BASE_URL}${String(path || "").replace(/^\/+/, "")}`;

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
  const [errored, setErrored] = useState(false);

  // Memoize the cleaned URL
  const finalSrc = useMemo(() => {
    if (errored || !src) return withLocalBase("products/fallback.png");
    return getCleanUrl(src);
  }, [src, errored]);

  // Using 'src' as a key ensures the image component resets state
  // when the source changes, avoiding the need for a reset useEffect.
  const imgKey = src || "no-src";

  const showLoader = !loaded && !errored;

  return (
    <div className="absolute inset-0 bg-neutral-100">
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
        key={imgKey}
        src={finalSrc}
        srcSet={errored ? undefined : srcSet}
        sizes={errored ? undefined : sizes}
        alt={alt || t.productImage || "Product"}
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
          // Prevent infinite loops if fallback image also fails
          if (!errored) {
            setErrored(true);
          }
          if (onError) onError(e);
        }}
        {...rest}
      />

      {errored && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-[10px] text-black/40 italic">
          {t.noImage || "No image"}
        </div>
      )}
    </div>
  );
}
