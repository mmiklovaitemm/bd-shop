import useLanguage from "@/context/useLanguage";
import AboutStudioSection from "@/components/ui/AboutStudioSection";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import TestimonialsSlider from "@/components/sections/TestimonialsSlider";

import BestSellersIntro from "./BestSellersIntro";
import TwoImageStrip from "./TwoImageStrip";
import OurSalons from "./OurSalons";

// new collection
import newColMobile from "@/assets/images/new-collection/hero-mobile.webp";
import newColTablet from "@/assets/images/new-collection/hero-tablet.webp";
import newColDesktop from "@/assets/images/new-collection/hero-desktop.webp";

// personalized jewelry
import persMobile from "@/assets/images/personalized-jewelry/personalized-hero-mobile.webp";
import persTablet from "@/assets/images/personalized-jewelry/personalized-hero-tablet.webp";
import persDesktop from "@/assets/images/personalized-jewelry/personalized-hero-desktop.webp";

export default function About() {
  const { t } = useLanguage();

  return (
    <div>
      <section className="px-4 py-5">
        <h1 className="font-display text-[44px] leading-[1.05] tracking-[-0.02em] text-black xs:text-[36px]">
          {t.aboutUs}
        </h1>
      </section>

      <FullWidthDivider />
      <AboutStudioSection />

      <BestSellersIntro
        title={t.bestSellers}
        description={t.bestSellersIntroDescription}
      />
      <FullWidthDivider />

      <TwoImageStrip
        left={{
          mobile: newColMobile,
          tablet: newColTablet,
          desktop: newColDesktop,
        }}
        right={{
          mobile: persMobile,
          tablet: persTablet,
          desktop: persDesktop,
        }}
        altLeft={t.newCollection}
        altRight={t.personalizedJewelry}
      />
      <FullWidthDivider />

      <OurSalons />
      <FullWidthDivider />

      <TestimonialsSlider />
    </div>
  );
}
