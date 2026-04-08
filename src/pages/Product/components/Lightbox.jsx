import { memo, useCallback, useEffect, useMemo } from "react";
import preventDragHandler from "@/utils/preventDrag";

import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";
import arrowLeftIcon from "@/assets/ui/arrow-left.svg";
import arrowRightIcon from "@/assets/ui/arrow-right.svg";

/**
 * URL Helper to ensure images load correctly in Lightbox.
 * Prevents ERR_CONNECTION_REFUSED by pointing relative paths to production.
 */
const getLightboxUrl = (rawPath) => {
  if (!rawPath || typeof rawPath !== "string") return "";

  // 1. If it's already a full external URL (Cloudinary), return as-is
  if (rawPath.startsWith("http") && !rawPath.includes("localhost")) {
    return rawPath;
  }

  const VERCEL_FRONTEND = "https://bd-shop-gray.vercel.app";

  // 2. Clean up localhost references and remove leading slashes
  const purePath = rawPath
    .replace(/http:\/\/localhost:\d+\//, "")
    .replace(/^\/+/, "");

  // 3. Routing logic for static assets
  if (purePath.startsWith("products/") || purePath.startsWith("assets/")) {
    return `${VERCEL_FRONTEND}/${purePath}`;
  }

  // 4. Default fallback for simple filenames
  return `${VERCEL_FRONTEND}/products/rings/${purePath}`;
};

const Lightbox = memo(function Lightbox({
  isOpen,
  onClose,
  images = [],
  activeImgIndex,
  setActiveImgIndex,
  product,
}) {
  /**
   * MEMOIZED DATA: Fixes ESLint warnings and optimizes performance.
   * safeImages ensures we always work with a valid array of strings.
   */
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images],
  );

  const imagesCount = safeImages.length;
  const hasManyImages = imagesCount > 1;

  /**
   * NAVIGATION LOGIC
   */
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

  /**
   * KEYBOARD EVENTS: Escape to close, arrows to navigate
   */
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

  /**
   * SCROLL LOCK: Prevents background scrolling when lightbox is open
   */
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  /**
   * IMAGE URL RESOLUTION: Normalizes the URL for the currently active image
   */
  const currentImageUrl = useMemo(() => {
    const raw = safeImages[activeImgIndex] || safeImages[0];
    return getLightboxUrl(raw);
  }, [safeImages, activeImgIndex]);

  if (!isOpen || !imagesCount) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] select-none"
      onDragStart={preventDragHandler}
    >
      {/* Dark Overlay Backdrop */}
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        aria-hidden="true"
        onClick={requestClose}
      />

      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {/* Lightbox Top Bar */}
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

        {/* Main Display Area */}
        <div
          className="relative flex flex-1 items-center justify-center p-4 md:p-12 pointer-events-auto"
          onClick={requestClose}
        >
          {/* Previous Button */}
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

          {/* Actual Image: Scaled to fit screen while maintaining original proportions */}
          <div
            className="flex items-center justify-center pointer-events-none"
            style={{ width: "100%", height: "100%" }}
          >
            <img
              src={currentImageUrl}
              alt={`${product?.name || "Product"} - detailed view`}
              className="pointer-events-auto block max-w-[90vw] max-h-[75vh] object-contain drop-shadow-2xl transition-opacity duration-300"
              style={{ width: "auto", height: "auto" }}
              onDragStart={preventDragHandler}
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/400x400?text=Image+Not+Found";
              }}
            />
          </div>

          {/* Next Button */}
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
