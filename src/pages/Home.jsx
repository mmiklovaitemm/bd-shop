import Hero from "@/components/sections/Hero";
import BestSellersSlider from "@/components/sections/BestSellersSlider";
import NewCollectionSection from "@/components/sections/NewCollectionSection";
import CategoriesSlider from "@/components/sections/CategoriesSlider";
import PersonalizedJewelrySection from "@/components/sections/PersonalizedJewelrySection";
import TestimonialsSlider from "@/components/sections/TestimonialsSlider";
import AboutStudioSection from "@/components/ui/AboutStudioSection";

export default function Home() {
  return (
    <div>
      <Hero />
      <BestSellersSlider />
      <NewCollectionSection />
      <CategoriesSlider />
      <PersonalizedJewelrySection />
      <TestimonialsSlider />
      <AboutStudioSection />
    </div>
  );
}
