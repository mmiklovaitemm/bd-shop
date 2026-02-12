import { useEffect, useRef, useState } from "react";

const DEFAULT_ROOT_MARGIN = "300px";

export default function useIntersectionObserver(options = {}) {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: DEFAULT_ROOT_MARGIN, ...options },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return [elementRef, isInView];
}
