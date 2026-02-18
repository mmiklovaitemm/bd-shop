import { Link } from "react-router-dom";
import ArrowUpRight from "@/assets/ui/arrow-up-right.svg";

import HeroMobile from "@/assets/images/personalized-jewelry/personalized-hero-mobile.webp";
import HeroTablet from "@/assets/images/personalized-jewelry/personalized-hero-tablet.webp";
import HeroDesktop from "@/assets/images/personalized-jewelry/personalized-hero-desktop.webp";

export default function HowItWorksHero() {
  return (
    <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-0">
      <div className="relative group overflow-hidden">
        <picture>
          <source media="(min-width: 1024px)" srcSet={HeroDesktop} />
          <source media="(min-width: 768px)" srcSet={HeroTablet} />
          <img
            src={HeroMobile}
            alt="How it works"
            className="w-full h-full object-cover lg:transition-transform lg:duration-700 lg:ease-out lg:group-hover:scale-105"
            loading="lazy"
          />
        </picture>

        {/* bottom bar overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-black/35 backdrop-blur-[2px]">
          <div className="p-5 sm:p-7 lg:p-9">
            <h3 className="font-display text-white text-[44px] leading-[1.05] tracking-[-0.02em] sm:text-[52px] lg:text-[56px]">
              How it works
            </h3>

            <Link
              to="/collections?filter=personal&page=1"
              className="ui-interact mt-4 inline-flex items-center gap-2 border border-white/70 bg-white/0 text-white px-6 py-3 text-[14px] backdrop-blur-sm"
            >
              <span>Shop now</span>
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
