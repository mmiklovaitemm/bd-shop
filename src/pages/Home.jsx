import Hero from "@/components/sections/Hero";
import BestSellersSlider from "@/components/sections/BestSellersSlider";
import NewCollectionSection from "@/components/sections/NewCollectionSection";
import CategoriesSlider from "@/components/sections/CategoriesSlider";
import PersonalizedJewelrySection from "@/components/sections/PersonalizedJewelrySection";
import TestimonialsSlider from "@/components/sections/TestimonialsSlider";
import AboutStudioSection from "@/components/ui/AboutStudioSection";
import { Reveal } from "@/components/sections/Reveal";

export default function Home() {
  return (
    <div>
      <Hero />

      <Reveal>
        <BestSellersSlider />
      </Reveal>

      <Reveal>
        <NewCollectionSection />
      </Reveal>

      <Reveal>
        <CategoriesSlider />
      </Reveal>

      <Reveal>
        <PersonalizedJewelrySection />
      </Reveal>

      <Reveal>
        <TestimonialsSlider />
      </Reveal>

      <Reveal>
        <AboutStudioSection />
      </Reveal>
    </div>
  );
}
