import { memo, useCallback, useEffect } from "react";
import preventDragHandler from "@/utils/preventDrag";

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

      if (e.key === "ArrowLeft") {
        goPrev();
      }

      if (e.key === "ArrowRight") {
        goNext();
      }
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
      <div className="absolute inset-0 bg-black/70" aria-hidden="true" />

      <div className="absolute inset-0 flex flex-col">
        <div
          className="flex h-14 items-center justify-between border-b border-white/15 bg-black px-4 text-white md:px-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-ui text-[13px] text-white/80">
            {Math.min(activeImgIndex + 1, imagesCount)} / {imagesCount}
          </div>

          <button
            type="button"
            onClick={requestClose}
            className="group inline-flex cursor-pointer select-none items-center gap-2 font-ui text-[14px]"
          >
            <span className="inline-flex items-center gap-2 transition-transform duration-200 ease-out lg:group-hover:translate-x-[1px] lg:group-hover:-translate-y-[1px]">
              <span>Close</span>
              <img
                src={arrowUpRightIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
                onDragStart={preventDragHandler}
                className="h-3 w-3 select-none invert"
              />
            </span>
          </button>
        </div>

        <div
          className="relative flex flex-1 items-center justify-center p-4 md:p-6"
          onClick={requestClose}
        >
          {hasManyImages ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous image"
              className="absolute left-6 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-black/30 bg-black backdrop-blur-sm transition-all duration-100 ease-out active:scale-95 md:left-10 md:h-12 md:w-12 lg:hover:scale-105 lg:hover:border-white/40 lg:hover:bg-white/20"
            >
              <img
                src={arrowLeftIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
                onDragStart={preventDragHandler}
                className="h-4 w-4 select-none invert"
              />
            </button>
          ) : null}

          <img
            src={currentImage}
            alt={`${product?.name || "Product"} - zoom`}
            className="max-h-[78vh] max-w-[92vw] select-none object-contain md:max-h-[82vh]"
            draggable={false}
            onDragStart={preventDragHandler}
            onClick={(e) => e.stopPropagation()}
          />

          {hasManyImages ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next image"
              className="absolute right-6 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-black/30 bg-black backdrop-blur-sm transition-all duration-100 ease-out active:scale-95 md:right-10 md:h-12 md:w-12 lg:hover:scale-105 lg:hover:border-white/40 lg:hover:bg-white/20"
            >
              <img
                src={arrowRightIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
                onDragStart={preventDragHandler}
                className="h-4 w-4 select-none invert"
              />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
});

export default Lightbox;
