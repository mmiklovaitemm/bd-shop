import { memo, useCallback, useEffect } from "react";
import preventDragHandler from "@/utils/preventDrag";
import ProductImage from "@/components/ui/ProductCard/ProductImage";

import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";
import arrowLeftIcon from "@/assets/ui/arrow-left.svg";
import arrowRightIcon from "@/assets/ui/arrow-right.svg";

const Lightbox = memo(function Lightbox({
  isOpen,
  onClose,
  images = [],
  activeImgIndex,
  setActiveImgIndex,
  product,
}) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const imagesCount = safeImages.length;
  const hasManyImages = imagesCount > 1;

  const goPrev = useCallback(() => {
    if (!imagesCount) return;
    setActiveImgIndex((i) => (i - 1 + imagesCount) % imagesCount);
  }, [imagesCount, setActiveImgIndex]);

  const goNext = useCallback(() => {
    if (!imagesCount) return;
    setActiveImgIndex((i) => (i + 1) % imagesCount);
  }, [imagesCount, setActiveImgIndex]);

  const requestClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        requestClose();
        return;
      }

      if (!hasManyImages) return;

      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasManyImages, requestClose, goPrev, goNext]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !imagesCount) return null;

  const currentImage = safeImages[activeImgIndex] || safeImages[0];

  return (
    <div
      className="fixed inset-0 z-[80] select-none"
      onDragStart={preventDragHandler}
    >
      {/* Overlay - semi-transparent background */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        aria-hidden="true"
        onClick={requestClose}
      />

      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {/* Header - UI remains clickable */}
        <div
          className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-black px-4 text-white md:px-6 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-ui text-[12px] uppercase tracking-widest text-white/60">
            {Math.min(activeImgIndex + 1, imagesCount)} / {imagesCount}
          </div>

          <button
            type="button"
            onClick={requestClose}
            className="group inline-flex items-center gap-2 font-ui text-[13px] uppercase tracking-widest"
          >
            <span>Close</span>
            <img
              src={arrowUpRightIcon}
              alt=""
              className="h-3 w-3 invert transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        </div>

        {/* Image Container Area */}
        <div className="relative flex flex-1 items-center justify-center p-4 md:p-8 lg:p-12">
          {/* Navigation Buttons - Clickable */}
          {hasManyImages && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/10 bg-black/40 text-white backdrop-blur-md transition-all active:scale-95 pointer-events-auto md:left-8 lg:hover:bg-white lg:hover:invert"
              >
                <img
                  src={arrowLeftIcon}
                  alt="Prev"
                  className="h-5 w-5 invert lg:group-hover:invert-0"
                />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/10 bg-black/40 text-white backdrop-blur-md transition-all active:scale-95 pointer-events-auto md:right-8 lg:hover:bg-white lg:hover:invert"
              >
                <img
                  src={arrowRightIcon}
                  alt="Next"
                  className="h-5 w-5 invert lg:group-hover:invert-0"
                />
              </button>
            </>
          )}

          <div className="relative w-full max-w-[90vw] h-full max-h-[75vh] md:max-w-[70vw] md:max-h-[70vh] lg:max-w-[800px] lg:max-h-[80vh] pointer-events-auto">
            <ProductImage
              src={currentImage}
              alt={`${product?.name || "Product"} - zoom`}
              loaded={true}
              className="object-contain w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Lightbox;
