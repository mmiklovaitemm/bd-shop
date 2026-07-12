import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import useLanguage from "@/context/useLanguage";
import useFavorites from "@/context/useFavorites";

import ProductCard from "@/components/ui/ProductCard/ProductCard";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import PageTitle from "@/components/ui/PageTitle"; // Naudojame suvienodintą antraštę

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
      <PageTitle title={t.myFavourites} />

      <main className="mx-auto w-full max-w-[1200px] select-none px-4 py-8 md:px-6 md:py-10 lg:px-1">
        {loading ? (
          <div className="py-20 text-center font-ui text-black/60">
            {t.loading}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center font-ui text-black/60">
            {t.noFavouriteItemsYet}
          </div>
        ) : (
          <section>
            {/* default (sync) mode – NOT "popLayout"; see Header CountBadge note.
                `layout` still animates remaining items when one is removed. */}
            <AnimatePresence>
              <motion.div
                layout
                className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4"
              >
                {items.map((product, idx) => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <ProductCard
                      product={{ ...product, image: product.thumbnail }}
                      priority={idx < 4}
                      onMediaReady={() => {}}
                      onAddToCart={() => {}}
                      onAddToFavorites={() => {}}
                      onImageError={(e) => {
                        e.currentTarget.src = withBase("products/fallback.png");
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </section>
        )}
      </main>

      <FullWidthDivider />
    </>
  );
}
