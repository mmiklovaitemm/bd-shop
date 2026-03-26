import { memo } from "react";
import cn from "@/utils/cn";
import preventDragHandler from "@/utils/preventDrag";

const ImageGallery = memo(function ImageGallery({
  images,
  product,
  openLightbox,
  btnHover,
}) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];

  if (!safeImages.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-4 lg:grid-cols-2">
      {safeImages.map((src, index) => (
        <button
          key={`${product?.id || "product"}-${src}-${index}`}
          type="button"
          onClick={() => openLightbox(index)}
          aria-label={`Open image ${index + 1}`}
          className={cn(
            "group relative overflow-hidden bg-black/5 text-left select-none h-[420px] sm:h-[480px] md:h-[280px] md:aspect-auto lg:h-[560px]",
            btnHover,
          )}
        >
          <img
            src={src}
            alt={`${product?.name || "Product"} - photo ${index + 1}`}
            draggable={false}
            onDragStart={preventDragHandler}
            className="h-full w-full object-cover select-none transition-transform duration-500 ease-out lg:group-hover:scale-[1.05]"
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
