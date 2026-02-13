import { memo, useCallback, useEffect, useRef, useState } from "react";
import preventDragHandler from "@/utils/preventDrag";

import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";
import arrowLeftIcon from "@/assets/ui/arrow-left.svg";
import arrowRightIcon from "@/assets/ui/arrow-right.svg";

const EXIT_MS = 220;

const Lightbox = memo(function Lightbox({
  isOpen,
  onClose,
  images,
  activeImgIndex,
  setActiveImgIndex,
  product,
}) {
  const imagesCount = images.length;
  const hasManyImages = imagesCount > 1;

  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const closingRef = useRef(false);
  const closeTimeoutRef = useRef(null);

  const goPrev = useCallback(() => {
    setActiveImgIndex((i) => (i - 1 + imagesCount) % imagesCount);
  }, [imagesCount, setActiveImgIndex]);

  const goNext = useCallback(() => {
    setActiveImgIndex((i) => (i + 1) % imagesCount);
  }, [imagesCount, setActiveImgIndex]);

  // Handle opening - set shouldRender when opening
  useEffect(() => {
    if (isOpen) {
      closingRef.current = false;
      // Defer setState to avoid synchronous state update in effect
      const raf = requestAnimationFrame(() => {
        setShouldRender(true);
      });
      return () => {
        cancelAnimationFrame(raf);
      };
    }
  }, [isOpen]);

  // Handle visibility transitions (fade-in / fade-out)
  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    if (isOpen && !isVisible) {
      // Opening: schedule visible for next frame to allow transition
      const raf = requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return () => {
        cancelAnimationFrame(raf);
      };
    }

    if (!isOpen && isVisible) {
      // Closing: animate out, then remove from DOM
      // Use setTimeout to defer the state update
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 0);

      const domTimeout = setTimeout(() => {
        setShouldRender(false);
        closingRef.current = false;
      }, EXIT_MS);

      return () => {
        clearTimeout(timeout);
        clearTimeout(domTimeout);
      };
    }
  }, [isOpen, shouldRender, isVisible]);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    // start fade-out
    setIsVisible(false);

    // clear any existing close timeout to avoid multiple onClose calls
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

    // wait for fade-out to finish before unmounting and calling onClose
    closeTimeoutRef.current = window.setTimeout(() => {
      onClose?.();
    }, EXIT_MS);
  }, [onClose]);

  // Cleanup close timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Keyboard
  useEffect(() => {
    if (!isOpen || !hasManyImages) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "Escape":
          requestClose();
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case "ArrowRight":
          goNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasManyImages, requestClose, goPrev, goNext]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const prevStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevStyle;
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[80] select-none",
        "transition-opacity duration-[220ms] ease-out",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
      ].join(" ")}
      onDragStart={preventDragHandler}
    >
      <div className="absolute inset-0 bg-black/70" aria-hidden="true" />

      <div className="absolute inset-0 flex flex-col">
        <div
          className="h-14 px-4 md:px-6 flex items-center justify-between border-b border-white/15 text-white bg-black"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-ui text-[13px] text-white/80">
            {activeImgIndex + 1} / {imagesCount}
          </div>

          <button
            type="button"
            onClick={requestClose}
            className="group inline-flex items-center gap-2 font-ui text-[14px] cursor-pointer select-none"
          >
            <span className="inline-flex items-center gap-2 transition-transform duration-200 ease-out will-change-transform lg:group-hover:translate-x-[1px] lg:group-hover:-translate-y-[1px]">
              <span className="inline-block">Close</span>
              <img
                src={arrowUpRightIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
                onDragStart={preventDragHandler}
                className="h-3 w-3 invert transition-transform duration-200 ease-out select-none"
              />
            </span>
          </button>
        </div>

        <div
          className="relative flex-1 flex items-center justify-center p-4 md:p-6"
          onClick={requestClose}
        >
          {hasManyImages && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous image"
              className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 h-11 w-11 md:h-12 md:w-12 border border-black/30 bg-black backdrop-blur-sm flex items-center justify-center transition-all duration-100 ease-out lg:hover:bg-white/20 lg:hover:border-white/40 lg:hover:scale-105 active:scale-95"
            >
              <img
                src={arrowLeftIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
                onDragStart={preventDragHandler}
                className="h-4 w-4 invert select-none"
              />
            </button>
          )}

          {images[activeImgIndex] && (
            <img
              src={images[activeImgIndex]}
              alt={`${product?.name || "Product"} - zoom`}
              className="max-h-[78vh] md:max-h-[82vh] max-w-[92vw] object-contain select-none"
              draggable={false}
              onDragStart={preventDragHandler}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {hasManyImages && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next image"
              className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 h-11 w-11 md:h-12 md:w-12 border border-black/30 bg-black backdrop-blur-sm flex items-center justify-center transition-all duration-100 ease-out lg:hover:bg-white/20 lg:hover:border-white/40 lg:hover:scale-105 active:scale-95"
            >
              <img
                src={arrowRightIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
                onDragStart={preventDragHandler}
                className="h-4 w-4 invert select-none"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default Lightbox;
