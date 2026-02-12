import { memo } from "react";
import cn from "@/utils/cn";
import preventDragHandler from "@/utils/preventDrag";

const ImageGallery = memo(function ImageGallery({
  images,
  product,
  openLightbox,
  btnHover,
}) {
  if (!images.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-4 lg:grid-cols-2">
      {images.slice(0, 2).map((src, index) => (
        <button
          key={`${product?.id}-${index}`}
          type="button"
          onClick={() => openLightbox(index)}
          aria-label={`Open image ${index + 1}`}
          className={cn(
            "group h-[420px] sm:h-[480px] md:aspect-auto md:h-[280px] lg:h-[560px] overflow-hidden bg-black/5 relative text-left select-none",
            btnHover,
          )}
        >
          <img
            src={src}
            alt={`${product?.name || "Product"} - photo ${index + 1}`}
            draggable={false}
            onDragStart={preventDragHandler}
            className="h-full w-full object-cover transition-transform duration-500 ease-out lg:group-hover:scale-[1.05] select-none"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 ease-out lg:group-hover:bg-black/5" />
        </button>
      ))}
    </div>
  );
});

export default ImageGallery;
