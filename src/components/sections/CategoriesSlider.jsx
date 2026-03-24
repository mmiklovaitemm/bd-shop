import { useNavigate } from "react-router-dom";

import HorizontalSliderSection from "@/components/sections/HorizontalSliderSection";
import CategoryCard from "@/components/ui/CategoryCard";
import useLanguage from "@/context/useLanguage";

import { CATEGORIES } from "@/data/categories";

export default function CategoriesSlider({ items = CATEGORIES }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <HorizontalSliderSection title={t.categories} leftWidthPx={260}>
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
