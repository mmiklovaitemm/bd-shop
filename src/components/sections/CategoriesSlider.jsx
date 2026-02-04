import { useNavigate } from "react-router-dom";

import HorizontalSliderSection from "@/components/sections/HorizontalSliderSection";
import CategoryCard from "@/components/ui/CategoryCard";

import { CATEGORIES } from "@/data/categories";

export default function CategoriesSlider({ items = CATEGORIES }) {
  const navigate = useNavigate();

  return (
    <HorizontalSliderSection title="Categories" leftWidthPx={260}>
      {items.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onMediaReady={() => {}}
          onClick={() => navigate(`/collections?category=${category.slug}`)}
        />
      ))}
    </HorizontalSliderSection>
  );
}
