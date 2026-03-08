// src/pages/Product/components/YouMayAlsoLike.jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import HorizontalSliderSection from "@/components/sections/HorizontalSliderSection";
import ProductCard from "@/components/ui/ProductCard/ProductCard";

import seeAllArrow from "@/assets/ui/see-all-arrow-right.svg";
import { useProducts } from "@/hooks/useProducts";

const withBase = (path) =>
  `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, "")}`;

export default function YouMayAlsoLike({ currentProduct }) {
  const navigate = useNavigate();
  const { products, loading } = useProducts();

  const items = useMemo(() => {
    if (!products.length) return [];

    if (!currentProduct?.id) return products.slice(0, 24);

    const excludeId = currentProduct.id;
    const category = currentProduct.category;
    const type = currentProduct.type;

    const sameCategory = category
      ? products.filter((p) => p.id !== excludeId && p.category === category)
      : [];

    const sameType = type
      ? products.filter((p) => p.id !== excludeId && p.type === type)
      : [];

    const base = sameCategory.length ? sameCategory : sameType;

    const rest = products.filter(
      (p) => p.id !== excludeId && !base.includes(p),
    );

    return [...base, ...rest].slice(0, 24);
  }, [currentProduct, products]);

  const SeeAllButton = useMemo(
    () => (
      <button
        type="button"
        onClick={() => navigate("/collections")}
        aria-label="See all products"
        className="
          group inline-flex items-center gap-2
          font-display text-[18px] font-normal text-black
          cursor-pointer select-none
          transition-colors
          active:scale-95
          lg:hover:text-black
        "
      >
        <span className="inline-block transition-transform duration-300 ease-out will-change-transform lg:group-hover:translate-x-1 lg:group-hover:-translate-y-1">
          See all
        </span>

        <img
          src={seeAllArrow}
          alt=""
          aria-hidden="true"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="h-3 w-3 select-none transition-transform duration-300 ease-out will-change-transform lg:group-hover:translate-x-1 lg:group-hover:-translate-y-1"
          loading="lazy"
          decoding="async"
        />
      </button>
    ),
    [navigate],
  );

  return (
    <HorizontalSliderSection
      title={
        <>
          You may
          <br />
          also like
        </>
      }
      leftWidthPx={260}
      leftBottomSlot={<div className="lg:mt-[3rem]">{SeeAllButton}</div>}
      mobileBottomSlot={
        <div className="mt-6 flex justify-end px-1 mb-[-0.5rem] lg:hidden">
          {SeeAllButton}
        </div>
      }
    >
      {loading
        ? []
        : items.map((product, idx) => {
            const cardProduct = { ...product, image: product.thumbnail };

            return (
              <div
                key={product.id}
                className="shrink-0 w-[260px] md:w-[280px] lg:w-[300px]"
              >
                <ProductCard
                  product={cardProduct}
                  priority={idx < 2}
                  onMediaReady={() => {}}
                  onAddToCart={() => console.log(`Add to cart: ${product.id}`)}
                  onAddToFavorites={() =>
                    console.log(`Add to favorites: ${product.id}`)
                  }
                  onImageError={(e) => {
                    e.currentTarget.src = withBase("products/fallback.png");
                  }}
                />
              </div>
            );
          })}
    </HorizontalSliderSection>
  );
}
