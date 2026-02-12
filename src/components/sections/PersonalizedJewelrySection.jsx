import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import FullWidthDivider from "@/components/ui/FullWidthDivider";
import arrowUpRight from "@/assets/ui/arrow-up-right.svg";

import heroDesktop from "@/assets/images/personalized-jewelry/personalized-hero-desktop.webp";
import heroTablet from "@/assets/images/personalized-jewelry/personalized-hero-tablet.webp";
import heroMobile from "@/assets/images/personalized-jewelry/personalized-hero-mobile.webp";

export default function PersonalizedJewelrySection({
  title = "Personalized\nJewellery",
  ctaText = "Shop now",
}) {
  const navigate = useNavigate();
  const [titleLine1, titleLine2] = title.split("\n");

  const handleShopNow = () => {
    navigate("/collections?category=personal");
  };

  const preventDrag = useCallback((e) => {
    e.preventDefault();
  }, []);

  const preventSelect = useCallback((e) => {
    // paliekam mygtuko paspaudimą veikti normaliai
    if (e.target.closest("button")) return;
    e.preventDefault();
  }, []);

  return (
    <section
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen select-none"
      onDragStart={preventDrag}
      onMouseDown={preventSelect}
    >
      <div className="w-full mt-4">
        <div className="relative w-full overflow-hidden">
          <div className="relative w-full h-[520px] md:h-[360px] lg:h-[420px]">
            <picture>
              <source srcSet={heroDesktop} media="(min-width: 1024px)" />
              <source srcSet={heroTablet} media="(min-width: 768px)" />
              <img
                src={heroMobile}
                alt="Personalized jewellery"
                draggable={false}
                onDragStart={preventDrag}
                className="absolute inset-0 h-full w-full object-cover select-none"
                loading="eager"
                decoding="async"
                fetchpriority="high"
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
                    font-display text-white leading-[0.95]
                    text-[50px]
                    md:text-[56px]
                    lg:text-[86px]
                  "
                >
                  {titleLine1 || "Personalized"}
                  <br />
                  {titleLine2 || "Jewellery"}
                </h2>

                <button
                  type="button"
                  onClick={handleShopNow}
                  aria-label="Shop personalized jewellery"
                  className="
                    group mt-5 md:mt-0
                    inline-flex items-center gap-3
                    font-ui text-[16px] lg:text-[18px]
                    text-white/90 lg:hover:text-white
                    active:text-white active:opacity-90
                    cursor-pointer
                    self-start md:self-auto
                    ui-interact
                  "
                >
                  <span
                    className="
                      inline-block
                      transition-transform duration-300 ease-out will-change-transform
                      lg:group-hover:translate-x-1 lg:group-hover:-translate-y-1
                    "
                  >
                    {ctaText}
                  </span>

                  <img
                    src={arrowUpRight}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    onDragStart={preventDrag}
                    className="
                      h-3 w-3 lg:h-4 lg:w-4 invert select-none
                      transition-transform duration-300 ease-out will-change-transform
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

      <FullWidthDivider className="mt-4" />
    </section>
  );
}
