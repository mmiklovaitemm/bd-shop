import { useCallback, useEffect, useState } from "react";

import mob1 from "@/assets/images/hero/mobile.png";
import mob2 from "@/assets/images/hero/mobile-2.png";
import mob3 from "@/assets/images/hero/mobile-3.png";

import tab1 from "@/assets/images/hero/hero-tablet.jpg";
import tab2 from "@/assets/images/hero/hero-tablet-2.png";
import tab3 from "@/assets/images/hero/hero-tablet-3.jpg";

import desk1 from "@/assets/images/hero/hero-desktop.jpg";
import desk2 from "@/assets/images/hero/hero-desktop-2.jpg";
import desk3 from "@/assets/images/hero/hero-desktop-3.jpg";

import FullWidthDivider from "@/components/ui/FullWidthDivider";

const BREAKPOINTS = {
  desktop: 1024,
  tablet: 768,
};

const SLIDE_INTERVAL = 4000;

const IMAGES = {
  mobile: [mob1, mob2, mob3],
  tablet: [tab1, tab2, tab3],
  desktop: [desk1, desk2, desk3],
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export default function Hero() {
  const [mode, setMode] = useState("mobile");
  const [current, setCurrent] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      const w = window.innerWidth;
      if (w >= BREAKPOINTS.desktop) setMode("desktop");
      else if (w >= BREAKPOINTS.tablet) setMode("tablet");
      else setMode("mobile");
    };

    update();
    const debouncedUpdate = debounce(update, 100);
    window.addEventListener("resize", debouncedUpdate);
    return () => window.removeEventListener("resize", debouncedUpdate);
  }, []);

  const images = IMAGES[mode];

  useEffect(() => {
    if (images.length === 0) return;
    const id = setInterval(() => {
      setCurrent((p) => (p + 1) % images.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [images]);

  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  const handleImageError = useCallback((index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  }, []);

  return (
    <section className="w-full">
      {/* FULL WIDTH hero */}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
        <div className="relative h-[520px] sm:h-[600px] lg:h-[560px] xl:h-[620px]">
          {images.map(
            (img, i) =>
              !imageErrors[i] && (
                <img
                  key={`${mode}-${i}`}
                  src={img}
                  alt={`Hero image ${i + 1} for ${mode} view`}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                    i === current ? "opacity-100" : "opacity-0"
                  }`}
                  onError={() => handleImageError(i)}
                />
              ),
          )}

          {/* TEXT CONTAINER (max width) */}
          <div className="pointer-events-none absolute inset-0">
            <div className="mx-auto h-full max-w-[1320px] px-4 md:px-6 relative">
              {/* MOBILE + TABLET */}
              <h1 className="absolute left-7 bottom-7 font-display text-[60px] leading-[74px] text-white tracking-wider lg:hidden">
                Discover <br />
                Timeless <br />
                Elegance
              </h1>

              {/* DESKTOP */}
              <div className="hidden lg:flex absolute left-10 right-10 bottom-10 items-end gap-8">
                <h1 className="font-display text-white text-[72px] xl:text-[88px] leading-none whitespace-nowrap">
                  Discover Timeless Elegance
                </h1>
                <div className="h-px flex-1 bg-white/80 translate-y-[-12px]" />
              </div>
            </div>
          </div>
        </div>

        <FullWidthDivider className="mt-4" />
      </div>
    </section>
  );
}
