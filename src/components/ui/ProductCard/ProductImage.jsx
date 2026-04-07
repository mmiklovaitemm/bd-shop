import { useMemo, useState } from "react";
import cn from "@/utils/cn";
import useLanguage from "@/context/useLanguage";

/**
 * STRATEGY:
 * We force all images to point to the Render backend explicitly.
 */
const getFinalImageUrl = (path) => {
  if (!path || typeof path !== "string") return "";

  const RENDER_BASE = "https://bd-shop-gfva.onrender.com";

  // 1. Handle development localhost paths
  if (path.includes("localhost")) {
    const filename = path.split("/").pop();
    return `${RENDER_BASE}/products/rings/${filename}`;
  }

  // 2. Upgrade to HTTPS
  if (path.startsWith("http")) {
    return path.replace("http://", "https://");
  }

  // 3. Absolute path construction
  const cleanPath = path.replace(/^\/+/, "");
  return `${RENDER_BASE}/${cleanPath}`;
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

  // We store the LAST source we tried to load.
  // This replaces the problematic useEffect.
  const [status, setStatus] = useState({ currentSrc: src, errored: false });

  // If the 'src' prop changes, we update our internal status immediately during render.
  // This is a standard React pattern for resetting state based on props.
  if (src !== status.currentSrc) {
    setStatus({ currentSrc: src, errored: false });
  }

  const finalSrc = useMemo(() => {
    if (!src) return "";
    return getFinalImageUrl(src);
  }, [src]);

  const showLoader = !loaded && !status.errored;

  // Render fallback if errored
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
        key={src} // Forcing a fresh element when src changes
        src={finalSrc}
        srcSet={status.errored ? undefined : srcSet}
        sizes={status.errored ? undefined : sizes}
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
          console.error("Image failed to load at:", finalSrc);
          setStatus((prev) => ({ ...prev, errored: true }));
          if (onError) onError(e);
        }}
        {...rest}
      />
    </div>
  );
}
