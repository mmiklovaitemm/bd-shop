import { useEffect, useRef } from "react";

export default function useImagePreload(src, shouldPreload, onLoaded) {
  const preloadedRef = useRef(false);

  useEffect(() => {
    if (!src || !shouldPreload || preloadedRef.current) return;

    preloadedRef.current = true;

    const img = new Image();
    img.src = src;

    img.onload = () => onLoaded?.();
    img.onerror = () => {
      preloadedRef.current = false;
    };
  }, [src, shouldPreload, onLoaded]);
}
