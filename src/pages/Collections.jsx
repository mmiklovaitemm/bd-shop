import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";

import useLanguage from "@/context/useLanguage";

import Pagination from "@/components/ui/Pagination";
import ProductCard from "@/components/ui/ProductCard/ProductCard";
import AboutStudioSection from "@/components/ui/AboutStudioSection";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import ProductsToolbar from "@/components/sections/ProductsToolbar";
import ProductsFilterPanel from "@/components/sections/ProductsFilterPanel";
import { Reveal } from "@/components/sections/Reveal";
import { useProducts } from "@/hooks/useProducts";

function hasGemValue(product) {
  return product?.hasGem === true;
}

function normalizeSizeValue(size) {
  return String(size ?? "")
    .trim()
    .replace(/\.0$/, "");
}

function normalizeGemValue(gem) {
  return String(gem || "")
    .trim()
    .toLowerCase();
}

function normalizeMaterialValue(material) {
  return String(material || "")
    .trim()
    .toLowerCase();
}

function toTitleCaseLabel(value) {
  return String(value || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatMaterialLabel(value, t) {
  const normalized = normalizeMaterialValue(value);

  const knownLabels = {
    silver: t.silver,
    gold: t.gold,
    pearl: t.perlas,
    "soft-blue": t.softBlue,
    "soft green": t.softGreen,
    "soft-green": t.softGreen,
    "soft-yellow": t.softYellow,
    "soft yellow": t.softYellow,
  };

  return knownLabels[normalized] || toTitleCaseLabel(normalized);
}

function applyAppearanceFilter(list, selectedAppearance) {
  let out = list;

  if (selectedAppearance?.length) {
    for (const value of selectedAppearance) {
      if (value === "with_gem") {
        out = out.filter((p) => hasGemValue(p));
      }

      if (value === "without_gem") {
        out = out.filter((p) => !hasGemValue(p));
      }

      if (value === "rough") {
        out = out.filter((p) => p.surface === "rough");
      }

      if (value === "smooth") {
        out = out.filter((p) => p.surface === "smooth");
      }
    }
  }

  return out;
}

function applyGemsFilter(list, selectedGems) {
  if (!selectedGems?.length) return list;

  const normalizedSelected = selectedGems.map(normalizeGemValue);

  return list.filter((p) =>
    (p.gemstones || [])
      .map(normalizeGemValue)
      .some((g) => normalizedSelected.includes(g)),
  );
}

function applySizeFilter(list, selectedSize) {
  if (selectedSize == null) return list;

  const normalizedSelected = normalizeSizeValue(selectedSize);

  return list.filter((p) =>
    (p.sizes || []).map(normalizeSizeValue).includes(normalizedSelected),
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Collections() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading } = useProducts();

  const CATEGORY_ITEMS = useMemo(
    () => [
      { label: t.rings, value: "rings" },
      { label: t.necklaces, value: "necklaces" },
      { label: t.bracelets, value: "bracelets" },
      { label: t.earrings, value: "earrings" },
      { label: t.personal, value: "personal" },
      { label: t.bestSellers, value: "best-sellers" },
      { label: t.newCollection, value: "new-collection" },
    ],
    [t],
  );

  const APPEARANCE_OPTIONS = useMemo(
    () => [
      { value: "with_gem", label: t.withGem },
      { value: "without_gem", label: t.withoutGem },
      { value: "rough", label: t.rough },
      { value: "smooth", label: t.smoothSurface },
    ],
    [t],
  );

  const activeCategory =
    searchParams.get("category") || searchParams.get("filter") || "rings";

  const pageFromUrl = Number(searchParams.get("page") || 1);
  const page =
    Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;

  const [sortValue, setSortValue] = useState("price_desc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedAppearance, setSelectedAppearance] = useState([]);
  const [selectedGems, setSelectedGems] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);

  const [customPriceRange, setCustomPriceRange] = useState(null);

  const [pageSize, setPageSize] = useState(() => {
    if (typeof window === "undefined") return 12;
    return window.matchMedia("(max-width: 767px)").matches ? 8 : 12;
  });

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");

    const handleChange = (event) => {
      setPageSize(event.matches ? 8 : 12);
    };

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
    } else {
      media.addListener(handleChange);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", handleChange);
      } else {
        media.removeListener(handleChange);
      }
    };
  }, []);

  const activeCategoryLabel =
    CATEGORY_ITEMS.find((c) => c.value === activeCategory)?.label || t.rings;

  const productsInCategory = useMemo(() => {
    if (activeCategory === "best-sellers") {
      return products.filter((p) => p.isBestSeller);
    }

    if (activeCategory === "new-collection") {
      return [...products]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    }

    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  const priceBounds = useMemo(() => {
    const prices = productsInCategory
      .map((p) => Number(p.priceValue) || 0)
      .filter((value) => value >= 0);

    return {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    };
  }, [productsInCategory]);

  const effectivePriceRange = useMemo(() => {
    if (!customPriceRange) {
      return { min: priceBounds.min, max: priceBounds.max };
    }

    const min = Math.max(
      priceBounds.min,
      Math.min(customPriceRange.min, priceBounds.max),
    );
    const max = Math.max(
      priceBounds.min,
      Math.min(customPriceRange.max, priceBounds.max),
    );

    return {
      min: Math.min(min, max),
      max: Math.max(min, max),
    };
  }, [customPriceRange, priceBounds.min, priceBounds.max]);

  const baseAfterPriceMaterial = useMemo(() => {
    let list = [...productsInCategory];

    list = list.filter(
      (p) =>
        Number(p.priceValue) >= effectivePriceRange.min &&
        Number(p.priceValue) <= effectivePriceRange.max,
    );

    if (selectedMaterial) {
      const normalizedSelectedMaterial =
        normalizeMaterialValue(selectedMaterial);

      list = list.filter((p) =>
        (p.colors || [])
          .map(normalizeMaterialValue)
          .includes(normalizedSelectedMaterial),
      );
    }

    return list;
  }, [
    productsInCategory,
    effectivePriceRange.min,
    effectivePriceRange.max,
    selectedMaterial,
  ]);

  const materialOptions = useMemo(() => {
    let list = [...productsInCategory];

    list = list.filter(
      (p) =>
        Number(p.priceValue) >= effectivePriceRange.min &&
        Number(p.priceValue) <= effectivePriceRange.max,
    );

    const counts = {};

    for (const product of list) {
      for (const color of product.colors || []) {
        const normalized = normalizeMaterialValue(color);
        if (!normalized) continue;
        counts[normalized] = (counts[normalized] || 0) + 1;
      }
    }

    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([value, count]) => ({
        value,
        label: formatMaterialLabel(value, t),
        count,
      }));
  }, [productsInCategory, effectivePriceRange.min, effectivePriceRange.max, t]);

  const availableGemOptions = useMemo(() => {
    const counts = {};

    for (const product of productsInCategory) {
      for (const gem of product.gemstones || []) {
        const normalized = normalizeGemValue(gem);
        if (!normalized) continue;
        counts[normalized] = (counts[normalized] || 0) + 1;
      }
    }

    const labelMap = {
      kristolas: t.kristolas,
      cirkonis: t.cirkonis,
      deimantas: t.deimantas,
      perlas: t.perlas,
    };

    return Object.keys(counts)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({
        value,
        label: labelMap[value] || toTitleCaseLabel(value),
      }));
  }, [productsInCategory, t]);

  const appearanceOptionsWithCount = useMemo(() => {
    return APPEARANCE_OPTIONS.map((opt) => {
      const appearanceWithoutThis = selectedAppearance.filter(
        (value) => value !== opt.value,
      );

      let list = [...baseAfterPriceMaterial];
      list = applyGemsFilter(list, selectedGems);
      list = applySizeFilter(list, selectedSize);
      list = applyAppearanceFilter(list, appearanceWithoutThis);

      let count = 0;

      if (opt.value === "with_gem") {
        count = list.filter((p) => hasGemValue(p)).length;
      }

      if (opt.value === "without_gem") {
        count = list.filter((p) => !hasGemValue(p)).length;
      }

      if (opt.value === "rough") {
        count = list.filter((p) => p.surface === "rough").length;
      }

      if (opt.value === "smooth") {
        count = list.filter((p) => p.surface === "smooth").length;
      }

      return { ...opt, count };
    });
  }, [
    APPEARANCE_OPTIONS,
    baseAfterPriceMaterial,
    selectedAppearance,
    selectedGems,
    selectedSize,
  ]);

  const gemOptionsWithCount = useMemo(() => {
    return availableGemOptions.map((opt) => {
      const gemsWithoutThis = selectedGems.filter((g) => g !== opt.value);

      let list = [...baseAfterPriceMaterial];
      list = applyAppearanceFilter(list, selectedAppearance);
      list = applySizeFilter(list, selectedSize);
      list = applyGemsFilter(list, gemsWithoutThis);

      const count = list.filter((p) =>
        (p.gemstones || []).map(normalizeGemValue).includes(opt.value),
      ).length;

      return { ...opt, count };
    });
  }, [
    availableGemOptions,
    baseAfterPriceMaterial,
    selectedAppearance,
    selectedGems,
    selectedSize,
  ]);

  const sizeOptionsWithCount = useMemo(() => {
    const allSizes = Array.from(
      new Set(
        productsInCategory.flatMap((p) =>
          (p.sizes || []).map((size) => normalizeSizeValue(size)),
        ),
      ),
    )
      .filter(Boolean)
      .sort((a, b) => {
        const na = Number(a);
        const nb = Number(b);

        if (!Number.isNaN(na) && !Number.isNaN(nb)) {
          return na - nb;
        }

        return String(a).localeCompare(String(b));
      });

    if (!allSizes.length) return [];

    return allSizes.map((size) => {
      let list = [...baseAfterPriceMaterial];
      list = applyAppearanceFilter(list, selectedAppearance);
      list = applyGemsFilter(list, selectedGems);

      const count = list.filter((p) =>
        (p.sizes || []).map(normalizeSizeValue).includes(size),
      ).length;

      return {
        value: size,
        label: String(size),
        count,
      };
    });
  }, [
    productsInCategory,
    baseAfterPriceMaterial,
    selectedAppearance,
    selectedGems,
  ]);

  const filteredAndSortedProducts = useMemo(() => {
    let list = [...baseAfterPriceMaterial];

    list = applyAppearanceFilter(list, selectedAppearance);
    list = applyGemsFilter(list, selectedGems);
    list = applySizeFilter(list, selectedSize);

    switch (sortValue) {
      case "price_asc":
        list.sort((a, b) => Number(a.priceValue) - Number(b.priceValue));
        break;
      case "price_desc":
        list.sort((a, b) => Number(b.priceValue) - Number(a.priceValue));
        break;
      default:
        break;
    }

    return list;
  }, [
    baseAfterPriceMaterial,
    selectedAppearance,
    selectedGems,
    selectedSize,
    sortValue,
  ]);

  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const showingCount = Math.min(safePage * pageSize, totalItems);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredAndSortedProducts.slice(start, start + pageSize);
  }, [filteredAndSortedProducts, safePage, pageSize]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeCategory, safePage]);

  const setPageInUrl = (nextPage) => {
    setSearchParams(
      (prev) => {
        const sp = new URLSearchParams(prev);
        sp.set("page", String(nextPage));
        return sp;
      },
      { replace: true },
    );
  };

  const resetPageInUrl = () => {
    setPageInUrl(1);
  };

  const handlePageChange = (nextPage) => {
    const clamped = Math.max(1, Math.min(nextPage, totalPages));
    setPageInUrl(clamped);
  };

  const handleChangeCategory = (next) => {
    setSelectedMaterial(null);
    setSelectedAppearance([]);
    setSelectedGems([]);
    setSelectedSize(null);
    setCustomPriceRange(null);

    setSearchParams(
      (prev) => {
        const sp = new URLSearchParams(prev);
        sp.set("category", next);
        sp.set("page", "1");
        sp.delete("filter");
        return sp;
      },
      { replace: true },
    );
  };

  const handleMaterialChange = (nextMaterial) => {
    setSelectedMaterial(nextMaterial);
    resetPageInUrl();
  };

  const handlePriceChange = (nextRange) => {
    setCustomPriceRange(nextRange);
    resetPageInUrl();
  };

  const handleAppearanceChange = (nextAppearance) => {
    setSelectedAppearance(nextAppearance);
    resetPageInUrl();
  };

  const handleGemsChange = (nextGems) => {
    setSelectedGems(nextGems);
    resetPageInUrl();
  };

  const handleSizeChange = (nextSize) => {
    setSelectedSize(nextSize);
    resetPageInUrl();
  };

  const handleSortChange = (nextSort) => {
    setSortValue(nextSort);
    resetPageInUrl();
  };

  const handleClearAll = () => {
    setSelectedMaterial(null);
    setSelectedAppearance([]);
    setSelectedGems([]);
    setSelectedSize(null);
    setCustomPriceRange(null);
    resetPageInUrl();
  };

  const desktopColsClass = isFilterOpen ? "lg:grid-cols-3" : "lg:grid-cols-4";
  const isEmpty = !loading && pageItems.length === 0;

  return (
    <>
      <ProductsToolbar
        title={t.collections}
        categories={CATEGORY_ITEMS}
        activeCategoryValue={activeCategory}
        activeCategoryLabel={activeCategoryLabel}
        onCategoryChange={handleChangeCategory}
        onOpenFilter={() => setIsFilterOpen((prev) => !prev)}
        sortValue={sortValue}
        onSortChange={handleSortChange}
      />

      <ProductsFilterPanel
        variant="mobile"
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        materialOptions={materialOptions}
        selectedMaterial={selectedMaterial}
        onMaterialChange={handleMaterialChange}
        priceBounds={priceBounds}
        priceRange={effectivePriceRange}
        onPriceChange={handlePriceChange}
        appearanceOptions={appearanceOptionsWithCount}
        selectedAppearance={selectedAppearance}
        onAppearanceChange={handleAppearanceChange}
        gemOptions={gemOptionsWithCount}
        selectedGems={selectedGems}
        onGemsChange={handleGemsChange}
        sizeOptions={sizeOptionsWithCount}
        selectedSize={selectedSize}
        onSizeChange={handleSizeChange}
        onClearAll={handleClearAll}
        clearDisabled={false}
      />

      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-6 md:py-10 lg:px-1">
        <div
          className={
            isFilterOpen ? "gap-6 lg:grid lg:grid-cols-[320px_1fr]" : "lg:block"
          }
        >
          {isFilterOpen ? (
            <div className="hidden lg:block">
              <ProductsFilterPanel
                variant="desktop"
                isOpen
                onClose={() => setIsFilterOpen(false)}
                materialOptions={materialOptions}
                selectedMaterial={selectedMaterial}
                onMaterialChange={handleMaterialChange}
                priceBounds={priceBounds}
                priceRange={effectivePriceRange}
                onPriceChange={handlePriceChange}
                appearanceOptions={appearanceOptionsWithCount}
                selectedAppearance={selectedAppearance}
                onAppearanceChange={handleAppearanceChange}
                gemOptions={gemOptionsWithCount}
                selectedGems={selectedGems}
                onGemsChange={handleGemsChange}
                sizeOptions={sizeOptionsWithCount}
                selectedSize={selectedSize}
                onSizeChange={handleSizeChange}
                onClearAll={handleClearAll}
                clearDisabled={false}
              />
            </div>
          ) : null}

          <div>
            {loading ? (
              <div className="py-10 text-center">
                <p className="font-ui text-[13px] text-black/70">{t.loading}</p>
              </div>
            ) : isEmpty ? (
              <div className="py-10 text-center">
                <p className="font-ui text-[13px] text-black/70">
                  {t.noProductsFound}
                </p>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory + safePage}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className={[
                      "grid grid-cols-2 gap-x-3 gap-y-5 min-[460px]:grid-cols-2 md:grid-cols-3 md:gap-x-4 md:gap-y-6",
                      desktopColsClass,
                    ].join(" ")}
                  >
                    {pageItems.map((product, idx) => (
                      <motion.div key={product.id} variants={itemVariants}>
                        <ProductCard
                          product={{ ...product, image: product.thumbnail }}
                          priority={idx < 4}
                          onAddToCart={() => {}}
                          onAddToFavorites={() => {}}
                          onMediaReady={() => {}}
                          onImageError={(e) => {
                            e.currentTarget.src = `${import.meta.env.BASE_URL}products/fallback.png`;
                          }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex flex-col items-center gap-3">
                  <p className="font-ui text-[13px] text-black/70">
                    {t.showing} {showingCount} {t.of} {totalItems}
                  </p>

                  <Pagination
                    totalItems={totalItems}
                    page={safePage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    siblingCount={1}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <FullWidthDivider />
      <Reveal>
        <AboutStudioSection />
      </Reveal>
    </>
  );
}
