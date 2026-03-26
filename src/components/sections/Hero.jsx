import { useCallback, useEffect, useState } from "react";

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
  const { t } = useLanguage();

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
    if (!images?.length) return;
    const id = setInterval(() => {
      setCurrent((p) => (p + 1) % images.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [images]);

  useEffect(() => {
    if (!images?.length) return;

    const preload = (src) => {
      if (!src) return;
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    };

    const tmr = setTimeout(() => {
      preload(images[1]);
    }, 600);

    return () => clearTimeout(tmr);
  }, [images, mode]);

  useEffect(() => {
    if (!images?.length) return;

    const nextIndex = (current + 1) % images.length;
    const nextSrc = images[nextIndex];
    const img = new Image();
    img.decoding = "async";
    img.src = nextSrc;
  }, [current, images]);

  const handleImageError = useCallback((index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  }, []);

  const preventImgDrag = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <section className="w-full">
      <div
        key={mode}
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden"
      >
        <div className="relative h-[520px] sm:h-[600px] lg:h-[560px] xl:h-[620px]">
          {images.map(
            (img, i) =>
              !imageErrors[i] && (
                <img
                  key={`${mode}-${i}`}
                  src={img}
                  alt=""
                  draggable={false}
                  onDragStart={preventImgDrag}
                  className={`absolute inset-0 h-full w-full object-cover select-none transition-opacity duration-1000 ${
                    i === current ? "opacity-100" : "opacity-0"
                  }`}
                  onError={() => handleImageError(i)}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "auto"}
                />
              ),
          )}

          <div className="pointer-events-none absolute inset-0">
            <div className="relative mx-auto h-full max-w-[1320px] px-4 md:px-6">
              {/* MOBILE / TABLET */}
              <h1 className="absolute bottom-7 left-7 font-display text-[60px] leading-[74px] tracking-wider text-white lg:hidden">
                {t.heroTitleLine1} <br />
                {t.heroTitleLine2} <br />
                {t.heroTitleLine3}
              </h1>

              {/* DESKTOP */}
              <div className="absolute bottom-10 left-10 right-10 hidden items-end gap-8 lg:flex">
                <h1 className="font-display text-white text-[72px] xl:text-[88px] leading-[0.92] tracking-wide shrink-0">
                  <span className="block">{t.heroTitleLine1}</span>
                  <span className="block">{t.heroTitleLine2}</span>
                  <span className="block">{t.heroTitleLine3}</span>
                </h1>

                <div className="mb-[10px] h-px w-[120px] lg:w-[160px] xl:w-[220px] bg-gradient-to-r from-white/80 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        <FullWidthDivider />
      </div>
    </section>
  );
}
