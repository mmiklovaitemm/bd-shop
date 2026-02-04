import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { PRODUCTS } from "@/data/products";
import ProductCard from "@/components/ui/ProductCard";
import AboutStudioSection from "@/components/ui/AboutStudioSection";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import ProductsToolbar from "@/components/sections/ProductsToolBar";
import ProductsFilterPanel from "@/components/sections/ProductsFilterPanel";

const CATEGORY_ITEMS = [
  { label: "Rings", value: "rings" },
  { label: "Necklaces", value: "necklaces" },
  { label: "Bracelets", value: "bracelets" },
  { label: "Earrings", value: "earrings" },
  { label: "Personal", value: "personal" },
  { label: "Best sellers", value: "best-sellers" },
  { label: "New collection", value: "new-collection" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get("category") || "rings";
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const [sortValue, setSortValue] = useState("price_desc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fromUrl = searchParams.get("category");
    if (fromUrl && fromUrl !== activeCategory) setActiveCategory(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const activeCategoryLabel =
    CATEGORY_ITEMS.find((c) => c.value === activeCategory)?.label || "Rings";

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = PRODUCTS.filter((p) => p.category === activeCategory);
    const sorted = [...filtered];

    switch (sortValue) {
      case "price_asc":
        sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price_desc":
        sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      default:
        break;
    }

    return sorted;
  }, [activeCategory, sortValue]);

  const handleChangeCategory = (next) => {
    setActiveCategory(next);
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set("category", next);
      return sp;
    });
  };

  const desktopColsClass = isFilterOpen ? "lg:grid-cols-3" : "lg:grid-cols-4";

  return (
    <>
      <ProductsToolbar
        title="Collections"
        categories={CATEGORY_ITEMS}
        activeCategoryValue={activeCategory}
        activeCategoryLabel={activeCategoryLabel}
        onCategoryChange={handleChangeCategory}
        onOpenFilter={() => setIsFilterOpen((prev) => !prev)}
        sortValue={sortValue}
        onSortChange={setSortValue}
      />

      {/* Mobile/Tablet modal panel */}
      <ProductsFilterPanel
        variant="mobile"
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Desktop layout */}
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-1 py-8 md:py-10">
        <div
          className={
            isFilterOpen ? "lg:grid lg:grid-cols-[260px_1fr] gap-0" : "lg:block"
          }
        >
          {isFilterOpen ? (
            <div className="hidden lg:block">
              <ProductsFilterPanel
                variant="desktop"
                isOpen={true}
                onClose={() => setIsFilterOpen(false)}
              />
            </div>
          ) : null}

          {/* Products grid */}
          <div
            className={[
              "grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-5 md:gap-x-4 md:gap-y-6",
              desktopColsClass,
            ].join(" ")}
          >
            {filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{ ...product, image: product.thumbnail }}
                onAddToCart={() => console.log("add to cart", product.id)}
                onAddToFavorites={() => console.log("fav", product.id)}
                onMediaReady={() => {}}
                onImageError={(e) => {
                  e.target.src = "/products/fallback.png";
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <FullWidthDivider />
      <AboutStudioSection />
    </>
  );
}
