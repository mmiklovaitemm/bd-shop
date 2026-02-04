import HorizontalSliderSection from "./HorizontalSliderSection";
import TestimonialCard from "../ui/TestimonialCard";
import { TESTIMONIALS } from "../../data/testimonials";

export default function TestimonialsSlider({ items = TESTIMONIALS }) {
  return (
    <HorizontalSliderSection
      title={"What people\nsay about us"}
      leftWidthPx={320}
    >
      {items.map((t) => (
        <TestimonialCard key={t.id} testimonial={t} />
      ))}
    </HorizontalSliderSection>
  );
}
