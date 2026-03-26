import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import FullWidthDivider from "@/components/ui/FullWidthDivider";
import arrowUpRight from "@/assets/ui/arrow-up-right.svg";

import useLanguage from "@/context/useLanguage";

import heroDesktop from "@/assets/images/personalized-jewelry/personalized-hero-desktop.webp";
import heroTablet from "@/assets/images/personalized-jewelry/personalized-hero-tablet.webp";
import heroMobile from "@/assets/images/personalized-jewelry/personalized-hero-mobile.webp";

export default function PersonalizedJewelrySection() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleShopNow = () => {
    navigate("/personalized");
  };

  const preventDrag = useCallback((e) => {
    e.preventDefault();
  }, []);

  const preventSelect = useCallback((e) => {
    if (e.target.closest("button")) return;
    e.preventDefault();
  }, []);

  return (
    <section
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen select-none"
      onDragStart={preventDrag}
      onMouseDown={preventSelect}
    >
      <div className="w-full">
        <div className="relative w-full overflow-hidden">
          <div className="relative h-[520px] w-full md:h-[360px] lg:h-[420px]">
            <picture>
              <source srcSet={heroDesktop} media="(min-width: 1024px)" />
              <source srcSet={heroTablet} media="(min-width: 768px)" />
              <img
                src={heroMobile}
                alt={t.personalizedJewellery}
                draggable={false}
                onDragStart={preventDrag}
                className="absolute inset-0 h-full w-full object-cover select-none"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </picture>

            <div
              className="
                pointer-events-none absolute inset-0
                bg-gradient-to-t from-black/90 via-black/35 to-transparent
                md:bg-gradient-to-r md:from-black/80 md:via-black/25 md:to-transparent
              "
            />

            <div className="absolute inset-0 flex flex-col justify-end px-8 pb-10 md:px-10 md:pb-8">
              <div className="md:flex md:items-end md:justify-between md:gap-8">
                <h2
                  className="
                    font-display text-[50px] leading-[0.95] text-white
                    md:text-[56px]
                    lg:text-[86px]
                  "
                >
                  {t.personalizedLine1}
                  <br />
                  {t.personalizedLine2}
                </h2>

                <button
                  type="button"
                  onClick={handleShopNow}
                  aria-label={t.shopPersonalizedJewellery}
                  className="
                    ui-interact
                    group mt-5 md:mt-0
                    inline-flex items-center gap-3
                    self-start md:self-auto
                    cursor-pointer
                    font-ui text-[16px] text-white/90
                    active:text-white active:opacity-90
                    lg:text-[18px] lg:hover:text-white
                  "
                >
                  <span
                    className="
                      inline-block
                      transition-transform duration-300 ease-out will-change-transform
                      lg:group-hover:translate-x-1 lg:group-hover:-translate-y-1
                    "
                  >
                    {t.shopNow}
                  </span>

                  <img
                    src={arrowUpRight}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    onDragStart={preventDrag}
                    className="
                      h-3 w-3 invert select-none
                      transition-transform duration-300 ease-out will-change-transform
                      lg:h-4 lg:w-4
                      lg:group-hover:translate-x-1 lg:group-hover:-translate-y-1
                    "
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FullWidthDivider />
    </section>
  );
}
