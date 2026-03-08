// src/pages/Favorites.jsx
import { useMemo } from "react";

import ProductCard from "@/components/ui/ProductCard/ProductCard";
import FullWidthDivider from "@/components/ui/FullWidthDivider";

import useFavorites from "@/context/useFavorites";
import { useProducts } from "@/hooks/useProducts";

const withBase = (path) =>
  `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, "")}`;

export default function Favorites() {
  const { favoriteIds } = useFavorites();
  const { loading, productsById } = useProducts();

  const items = useMemo(() => {
    if (!favoriteIds?.length) return [];
    return favoriteIds.map((id) => productsById.get(id)).filter(Boolean);
  }, [favoriteIds, productsById]);

  return (
    <>
      <main className="mx-auto w-full md:max-w-[1200px] lg:max-w-none px-1 md:px-1 lg:px-2 py-4 md:py-4 select-none">
        <div className="pb-4">
          <h1 className="font-display text-[48px] leading-[0.95] md:text-[56px]">
            My favourites
          </h1>
        </div>

        <FullWidthDivider />

        {loading ? (
          <div className="py-12 text-center text-black/60 font-ui">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-black/60 font-ui">
            You don&apos;t have any favourite items yet.
          </div>
        ) : (
          <section className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {items.map((product, idx) => (
                <div key={product.id} className="w-full">
                  <ProductCard
                    product={{ ...product, image: product.thumbnail }}
                    priority={idx < 2}
                    onMediaReady={() => {}}
                    onAddToCart={() =>
                      console.log(`Add to cart: ${product.id}`)
                    }
                    onAddToFavorites={() =>
                      console.log(`Add to favorites: ${product.id}`)
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
