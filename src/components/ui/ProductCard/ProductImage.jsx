import { useMemo, useState } from "react";
import cn from "@/utils/cn";

const withBase = (path) =>
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
  const imgKey = src || "no-src";

  const [errored, setErrored] = useState(false);

  const fallbackSrc = useMemo(() => withBase("products/fallback.png"), []);

  const finalSrc = errored ? fallbackSrc : src;
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
        src={finalSrc || ""}
        srcSet={errored ? undefined : srcSet}
        sizes={errored ? undefined : sizes}
        alt={alt || ""}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className={cn(
          "h-full w-full object-cover select-none",
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
          const current = e?.currentTarget?.src || "";
          if (!current.includes("products/fallback.png")) {
            setErrored(true);
          }
          onError?.(e);
        }}
        {...rest}
      />
    </div>
  );
}
