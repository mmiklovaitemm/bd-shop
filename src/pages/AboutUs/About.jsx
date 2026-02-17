import AboutStudioSection from "@/components/ui/AboutStudioSection";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import BestSellersIntro from "./BestSellersIntro";
import TwoImageStrip from "./TwoImageStrip";

// new collection
import newColMobile from "@/assets/images/new-collection/hero-mobile.webp";
import newColTablet from "@/assets/images/new-collection/hero-tablet.webp";
import newColDesktop from "@/assets/images/new-collection/hero-desktop.webp";

// personalized jewelry
import persMobile from "@/assets/images/personalized-jewelry/personalized-hero-mobile.webp";
import persTablet from "@/assets/images/personalized-jewelry/personalized-hero-tablet.webp";
import persDesktop from "@/assets/images/personalized-jewelry/personalized-hero-desktop.webp";
import TestimonialsSlider from "@/components/sections/TestimonialsSlider";

export default function About() {
  return (
    <div>
      {/* Title */}
      <section className="px-4 py-5">
        <h1 className="font-display text-[44px] xs:text-[36px] leading-[1.05] tracking-[-0.02em] text-black">
          About Us
        </h1>
      </section>

      <FullWidthDivider />
      <AboutStudioSection />

      <BestSellersIntro />
      <FullWidthDivider />

      <TwoImageStrip
        left={{
          mobile: newColMobile,
          tablet: newColTablet,
          desktop: newColDesktop,
        }}
        right={{ mobile: persMobile, tablet: persTablet, desktop: persDesktop }}
        altLeft="New collection"
        altRight="Personalized jewelry"
      />

      <FullWidthDivider />

      <TestimonialsSlider />
    </div>
  );
}
