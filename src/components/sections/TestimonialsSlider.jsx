import HorizontalSliderSection from "./HorizontalSliderSection";
import TestimonialCard from "../ui/TestimonialCard";
import useLanguage from "@/context/useLanguage";
import { TESTIMONIALS } from "../../data/testimonials";

export default function TestimonialsSlider({ items = TESTIMONIALS }) {
  const { t } = useLanguage();

  return (
    <HorizontalSliderSection title={t.testimonialsTitle} leftWidthPx={320}>
      {items.map((tItem) => (
        <TestimonialCard key={tItem.id} testimonial={tItem} />
      ))}
    </HorizontalSliderSection>
  );
}
