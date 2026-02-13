import { useMemo } from "react";

import ProductCard from "@/components/ui/ProductCard";
import FullWidthDivider from "@/components/ui/FullWidthDivider";

import { PRODUCTS } from "@/data/products";
import useFavorites from "@/context/useFavorites";

const withBase = (path) =>
  `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, "")}`;

export default function Favorites() {
  const { favoriteIds } = useFavorites();

  // real favorites from context
  const items = useMemo(() => {
    return favoriteIds
      .map((id) => PRODUCTS.find((p) => p.id === id))
      .filter(Boolean);
  }, [favoriteIds]);

  return (
    <>
      <main className="mx-auto w-full md:max-w-[1200px] lg:max-w-none px-1 md:px-1 lg:px-2 py-4 md:py-4 select-none">
        {/* Title */}
        <div className="pb-4">
          <h1 className="font-display text-[48px] leading-[0.95] md:text-[56px]">
            My favourites
          </h1>
        </div>

        <FullWidthDivider />

        {items.length === 0 ? (
          <div className="py-12 text-center text-black/60 font-ui">
            You don’t have any favourite items yet.
          </div>
        ) : (
          <section className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {items.map((product, idx) => (
                <div key={product.id} className="w-full">
                  <ProductCard
                    product={product}
                    priority={idx < 2}
                    onMediaReady={() => {}}
                    onAddToCart={() =>
                      console.log(`Add to cart: ${product.id}`)
                    }
                    onImageError={(e) => {
                      e.currentTarget.src = withBase("products/fallback.png");
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <FullWidthDivider />
    </>
  );
}
