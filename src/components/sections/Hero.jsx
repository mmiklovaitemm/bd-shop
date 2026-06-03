import { useCallback, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import mob1 from "@/assets/images/hero/mobile.webp";
import mob2 from "@/assets/images/hero/mobile-2.webp";
import mob3 from "@/assets/images/hero/mobile-3.webp";

import tab1 from "@/assets/images/hero/hero-tablet.webp";
import tab2 from "@/assets/images/hero/hero-tablet-2.webp";
import tab3 from "@/assets/images/hero/hero-tablet-3.webp";

import desk1 from "@/assets/images/hero/hero-desktop.webp";
import desk2 from "@/assets/images/hero/hero-desktop-2.webp";
import desk3 from "@/assets/images/hero/hero-desktop-3.webp";

import FullWidthDivider from "@/components/ui/FullWidthDivider";
import useLanguage from "@/context/useLanguage";

const BREAKPOINTS = { desktop: 1024, tablet: 768 };
const SLIDE_INTERVAL = 4000;

const IMAGES_DATA = {
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
  const { t } = useLanguage();
  const [mode, setMode] = useState("mobile");
  const [current, setCurrent] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  // Responsive mode logic
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

  // Memoize images array
  const images = useMemo(() => IMAGES_DATA[mode] || [], [mode]);

  // Slideshow timer
  useEffect(() => {
    if (!images?.length) return;
    const id = setInterval(() => {
      setCurrent((p) => (p + 1) % images.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [images]);

  const handleImageError = useCallback((index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  }, []);

  if (!images.length) return null;

  return (
    <section className="w-full">
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
        <div className="relative h-[520px] sm:h-[600px] lg:h-[560px] xl:h-[620px] bg-black">
          {/* Animated Background Images */}
          <AnimatePresence mode="popLayout">
            {!imageErrors[current] && (
              <motion.img
                key={`${mode}-${current}`}
                src={images[current]}
                alt=""
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 1.4, ease: "easeInOut" },
                  scale: { duration: SLIDE_INTERVAL / 1000, ease: "linear" },
                }}
                className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
                onError={() => handleImageError(current)}
              />
            )}
          </AnimatePresence>

          {/* Dark gradient overlay from left to right */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none z-[5]" />

          {/* Bottom gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none z-[5]" />

          {/* Static UI Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end">
            <div className="mx-auto w-full max-w-[1320px] px-6 md:px-10 pb-10 lg:pb-20">
              {/* Mobile/Tablet Text */}
              <div className="lg:hidden">
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="font-display text-[42px] sm:text-[52px] leading-[1.1] tracking-[0.02em] text-white"
                >
                  <span className="block mb-1">{t.heroTitleLine1}</span>
                  <span className="block mb-1">{t.heroTitleLine2}</span>
                  <span className="block mb-3">{t.heroTitleLine3}</span>
                </motion.h1>

                {/* Mobile line - same as desktop */}
                <motion.div
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 1.4,
                    delay: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-[1px] w-full bg-gradient-to-r from-white/90 via-white/30 to-transparent"
                />
              </div>

              {/* Desktop View with extended line */}
              <div className="hidden lg:flex items-end justify-between gap-10">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-white text-[72px] xl:text-[88px] leading-[1.05] tracking-[0.03em] shrink-0"
                >
                  <span className="block mb-2">{t.heroTitleLine1}</span>
                  <span className="block mb-2">{t.heroTitleLine2}</span>
                  <span className="block">{t.heroTitleLine3}</span>
                </motion.h1>

                {/* Animated long gradient line */}
                <motion.div
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 1.4,
                    delay: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mb-3 h-[1px] flex-1 bg-gradient-to-r from-white/90 via-white/30 to-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <FullWidthDivider />
      </div>
    </section>
  );
}
