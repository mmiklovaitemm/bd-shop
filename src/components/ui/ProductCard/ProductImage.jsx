import cn from "@/utils/cn";

export default function ProductImage({
  src,
  alt,
  sizes,
  srcSet,
  loaded,
  onLoad,
  onError,
  className,
  loadedClassName = "opacity-100",
  notLoadedClassName = "opacity-0",
  reduceMotion = false,
}) {
  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-black/10" />
      )}

      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className={cn(
          "absolute inset-0 h-full w-full object-cover select-none pointer-events-none",
          reduceMotion
            ? "transition-none"
            : "transition-all duration-300 ease-out",
          loaded ? loadedClassName : notLoadedClassName,
          className,
        )}
      />
    </>
  );
}
