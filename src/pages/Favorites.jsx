// src/pages/Favorites.jsx
import { useMemo } from "react";

import useLanguage from "@/context/useLanguage";
import useFavorites from "@/context/useFavorites";

import ProductCard from "@/components/ui/ProductCard/ProductCard";
import FullWidthDivider from "@/components/ui/FullWidthDivider";

import { useProducts } from "@/hooks/useProducts";

const withBase = (path) =>
  `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, "")}`;

export default function Favorites() {
  const { t } = useLanguage();
  const { favoriteIds } = useFavorites();
  const { loading, productsById } = useProducts();

  const items = useMemo(() => {
    if (!favoriteIds?.length) return [];
    return favoriteIds.map((id) => productsById.get(id)).filter(Boolean);
  }, [favoriteIds, productsById]);

  return (
    <>
      <main className="mx-auto w-full select-none px-1 py-4 md:max-w-[1200px] md:px-1 md:py-4 lg:max-w-none lg:px-2">
        <div className="pb-4">
          <h1 className="font-display text-[48px] leading-[0.95] md:text-[56px]">
            {t.myFavourites}
          </h1>
        </div>

        <FullWidthDivider />

        {loading ? (
          <div className="py-12 text-center font-ui text-black/60">
            {t.loading}
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center font-ui text-black/60">
            {t.noFavouriteItemsYet}
          </div>
        ) : (
          <section className="pt-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
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
