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
      className="fixed inset-0 z-[9999] select-none"
      onDragStart={preventDragHandler}
    >
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        aria-hidden="true"
        onClick={requestClose}
      />

      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {/* Top Header */}
        <div
          className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-black/40 px-6 text-white pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-ui text-[11px] uppercase tracking-[0.2em] text-white/40">
            {Math.min(activeImgIndex + 1, imagesCount)} / {imagesCount}
          </div>

          <button
            type="button"
            onClick={requestClose}
            className="group inline-flex items-center gap-2.5 font-ui text-[12px] uppercase tracking-[0.15em] transition-opacity hover:opacity-70"
          >
            <span>Close</span>
            <img
              src={arrowUpRightIcon}
              alt=""
              className="h-3 w-3 invert transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        </div>

        {/* Image Display Area */}
        <div
          className="relative flex flex-1 items-center justify-center p-4 md:p-12 pointer-events-auto"
          onClick={requestClose}
        >
          {/* Navigation - Left */}
          {hasManyImages && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-6 top-1/2 z-30 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black pointer-events-auto group"
            >
              <img
                src={arrowLeftIcon}
                alt="Prev"
                className="h-5 w-5 invert group-hover:invert-0"
              />
            </button>
          )}

          {/* Main Image Container */}
          <div
            className="relative flex items-center justify-center pointer-events-auto"
            style={{
              width: "auto",
              height: "auto",
              maxWidth: "90vw",
              maxHeight: "80vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ProductImage
              src={currentImage}
              alt={`${product?.name || "Product"} - original view`}
              loaded={true}
              className="!static !inset-auto !w-auto !h-auto object-contain max-w-[90vw] max-h-[80vh] drop-shadow-2xl"
            />
          </div>

          {/* Navigation - Right */}
          {hasManyImages && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-6 top-1/2 z-30 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black pointer-events-auto group"
            >
              <img
                src={arrowRightIcon}
                alt="Next"
                className="h-5 w-5 invert group-hover:invert-0"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default Lightbox;
