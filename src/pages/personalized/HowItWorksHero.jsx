import useLanguage from "@/context/useLanguage";
import { Link } from "react-router-dom";
import ArrowUpRight from "@/assets/ui/arrow-up-right.svg";

import HeroMobile from "@/assets/images/personalized-jewelry/personalized-hero-mobile.webp";
import HeroTablet from "@/assets/images/personalized-jewelry/personalized-hero-tablet.webp";
import HeroDesktop from "@/assets/images/personalized-jewelry/personalized-hero-desktop.webp";

export default function HowItWorksHero() {
  const { t } = useLanguage();

  return (
    <section className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] py-0">
      <div className="group relative overflow-hidden">
        <picture>
          <source media="(min-width: 1024px)" srcSet={HeroDesktop} />
          <source media="(min-width: 768px)" srcSet={HeroTablet} />
          <img
            src={HeroMobile}
            alt={t.personalized.howItWorks}
            className="h-full w-full object-cover lg:transition-transform lg:duration-700 lg:ease-out lg:group-hover:scale-105"
            loading="lazy"
          />
        </picture>

        <div className="absolute inset-x-0 bottom-0 bg-black/35 backdrop-blur-[2px]">
          <div className="p-5 sm:p-7 lg:p-9">
            <h3 className="font-display text-[44px] leading-[1.05] tracking-[-0.02em] text-white sm:text-[52px] lg:text-[56px]">
              {t.personalized.howItWorks}
            </h3>

            <Link
              to="/collections?filter=personal&page=1"
              className="ui-interact mt-4 inline-flex items-center gap-2 border border-white/70 bg-white/0 px-6 py-3 text-[14px] text-white backdrop-blur-sm"
            >
              <span>{t.shopNow}</span>
              <img
                src={ArrowUpRight}
                alt=""
                className="h-3 w-3 invert"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
