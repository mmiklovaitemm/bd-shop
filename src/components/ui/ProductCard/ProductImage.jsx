import { useMemo, useState } from "react";
import cn from "@/utils/cn";
import useLanguage from "@/context/useLanguage";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const BASE =
    import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com";

  const cleanBase = BASE.replace(/\/+$/, "");
  const cleanPath = String(path).replace(/^\/+/, "");

  return `${cleanBase}/${cleanPath}`;
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
  loadedClassName = "opacity-100",
  notLoadedClassName = "opacity-0",

  priority = false,

  ...rest
}) {
  const { t } = useLanguage();
  const [errored, setErrored] = useState(false);

  const imgKey = src || "no-src";

  const finalSrc = useMemo(() => {
    if (errored || !src) return withLocalBase("products/fallback.png");
    return getImageUrl(src);
  }, [src, errored]);

  const showLoader = !loaded && !errored;

  return (
    <div className="absolute inset-0">
      {showLoader ? (
        <div
          className={cn(
            "absolute inset-0 bg-black/5",
            "animate-pulse",
            reduceMotion && "animate-none",
          )}
          aria-hidden="true"
        >
          <div className="absolute inset-0 grid place-items-center">
            <div
              className={cn(
                "h-6 w-6 rounded-full border-2 border-black/20 border-t-black/60",
                "animate-spin",
                reduceMotion && "animate-none",
              )}
            />
          </div>
        </div>
      ) : null}

      <img
        key={imgKey}
        src={finalSrc}
        srcSet={errored ? undefined : srcSet}
        sizes={errored ? undefined : sizes}
        width={340}
        height={340}
        alt={alt || t.productImage}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className={cn(
          "h-full w-full object-cover select-none",
          !loaded && "blur-[8px] scale-[1.02]",
          reduceMotion
            ? "transition-none"
            : "transition-opacity duration-500 ease-out will-change-opacity",
          loaded ? loadedClassName : notLoadedClassName,
          className,
        )}
        onLoad={(e) => {
          onLoad?.(e);
        }}
        onError={(e) => {
          if (!errored && src) {
            setErrored(true);
          }
          onError?.(e);
        }}
        {...rest}
      />
    </div>
  );
}
