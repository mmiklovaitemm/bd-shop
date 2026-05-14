import useLanguage from "@/context/useLanguage";
import AboutStudioSection from "@/components/ui/AboutStudioSection";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import TestimonialsSlider from "@/components/sections/TestimonialsSlider";
import { Reveal } from "@/components/sections/Reveal";
import PageTitle from "@/components/ui/PageTitle";

import BestSellersIntro from "./BestSellersIntro";
import TwoImageStrip from "./TwoImageStrip";
import OurSalons from "./OurSalons";

import newColMobile from "@/assets/images/new-collection/hero-mobile.webp";
import newColTablet from "@/assets/images/new-collection/hero-tablet.webp";
import newColDesktop from "@/assets/images/new-collection/hero-desktop.webp";
import persMobile from "@/assets/images/personalized-jewelry/personalized-hero-mobile.webp";
import persTablet from "@/assets/images/personalized-jewelry/personalized-hero-tablet.webp";
import persDesktop from "@/assets/images/personalized-jewelry/personalized-hero-desktop.webp";

export default function About() {
  const { t } = useLanguage();

  return (
    <div>
      <Reveal>
        <PageTitle title={t.aboutUs} />
      </Reveal>

      <Reveal>
        <AboutStudioSection />
      </Reveal>

      <Reveal>
        <BestSellersIntro
          title={t.bestSellers}
          description={t.bestSellersIntroDescription}
        />
      </Reveal>

      <FullWidthDivider />

      <Reveal>
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
      </Reveal>

      <FullWidthDivider />

      <Reveal>
        <OurSalons />
      </Reveal>

      <FullWidthDivider />

      <Reveal>
        <TestimonialsSlider />
      </Reveal>
    </div>
  );
}
