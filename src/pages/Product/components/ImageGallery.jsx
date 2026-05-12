import { memo } from "react";
import cn from "@/utils/cn";
import preventDragHandler from "@/utils/preventDrag";
import ProductImage from "@/components/ui/ProductCard/ProductImage";

const MAX_VISIBLE = 2;

const ImageGallery = memo(function ImageGallery({
  images,
  product,
  openLightbox,
  btnHover,
}) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!safeImages.length) return null;

  // Show only first 2 images in gallery — rest accessible via lightbox
  const visibleImages = safeImages.slice(0, MAX_VISIBLE);
  const hiddenCount = safeImages.length - MAX_VISIBLE;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-4 lg:grid-cols-2">
      {visibleImages.map((src, index) => {
        const isLast = index === visibleImages.length - 1;
        const showMoreOverlay = isLast && hiddenCount > 0;

        return (
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

            {showMoreOverlay && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="font-ui text-[18px] font-medium text-white">
                  +{hiddenCount} more
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
});

export default ImageGallery;
