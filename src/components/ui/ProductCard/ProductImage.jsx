import { useMemo, useState } from "react";
import cn from "@/utils/cn";
import useLanguage from "@/context/useLanguage";

const getCleanRenderUrl = (rawPath) => {
  if (!rawPath || typeof rawPath !== "string") return "";

  const RENDER_BASE = "https://bd-shop-gfva.onrender.com";

  // 1. If it contains localhost, remove the local part completely
  let pathOnly = rawPath.replace(/http:\/\/localhost:\d+/, "");

  // 2. Ensure it starts with a single slash
  if (!pathOnly.startsWith("/")) {
    pathOnly = "/" + pathOnly;
  }

  // 3. Combine with Render base
  return `${RENDER_BASE}${pathOnly}`;
};

export default function ProductImage({
  src,
  srcSet, // We now use these in the img tag below
  sizes, // We now use these in the img tag below
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

  // Synchronize state if src changes
  if (src !== status.currentSrc) {
    setStatus({ currentSrc: src, errored: false });
  }

  const finalSrc = useMemo(() => {
    return getCleanRenderUrl(src);
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
          console.error("Failed to load image from Render:", finalSrc);
          setStatus((prev) => ({ ...prev, errored: true }));
          if (onError) onError(e);
        }}
        {...rest}
      />
    </div>
  );
}
