import { memo } from "react";
import cn from "@/utils/cn";
import preventDragHandler from "@/utils/preventDrag";
import ProductImage from "@/components/ui/ProductCard/ProductImage";

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
          onDragStart={preventDragHandler}
          className={cn(
            "group relative overflow-hidden bg-black/5 text-left select-none h-[420px] sm:h-[480px] md:h-[280px] lg:h-[560px]",
            btnHover,
          )}
        >
          <ProductImage
            src={src}
            alt={`${product?.name || "Product"} - photo ${index + 1}`}
            loaded={true}
            priority={index === 0}
            className="h-full w-full object-cover select-none transition-transform duration-500 lg:group-hover:scale-[1.05]"
          />
        </button>
      ))}
    </div>
  );
});

export default ImageGallery;
