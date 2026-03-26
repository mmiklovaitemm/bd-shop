import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import useLanguage from "@/context/useLanguage";

import Pagination from "@/components/ui/Pagination";
import ProductCard from "@/components/ui/ProductCard/ProductCard";
import AboutStudioSection from "@/components/ui/AboutStudioSection";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import ProductsToolbar from "@/components/sections/ProductsToolbar";
import ProductsFilterPanel from "@/components/sections/ProductsFilterPanel";

import { useProducts } from "@/hooks/useProducts";

const applyAppearanceFilter = (list, selectedAppearance) => {
  let out = list;

  if (selectedAppearance?.length) {
    for (const a of selectedAppearance) {
      if (a === "with_gem") out = out.filter((p) => p.hasGem === true);
      if (a === "without_gem") out = out.filter((p) => p.hasGem === false);
      if (a === "rough") out = out.filter((p) => p.surface === "rough");
      if (a === "smooth") out = out.filter((p) => p.surface === "smooth");
    }
  }

  return out;
};

const applyGemsFilter = (list, selectedGems) => {
  if (!selectedGems?.length) return list;
  return list.filter((p) =>
    (p.gemstones || []).some((g) => selectedGems.includes(g)),
  );
};

const applySizeFilter = (list, selectedSize) => {
  if (selectedSize == null) return list;
  return list.filter((p) => (p.sizes || []).includes(selectedSize));
};

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
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

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

export default function Collections() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const GEM_OPTIONS = useMemo(
    () => [
      { value: "kristolas", label: t.kristolas },
      { value: "cirkonis", label: t.cirkonis },
      { value: "deimantas", label: t.deimantas },
      { value: "perlas", label: t.perlas },
    ],
    [t],
  );

  const categoryFromUrl =
    searchParams.get("category") || searchParams.get("filter") || "rings";
  const pageFromUrlParam = Number(searchParams.get("page") || 1);

  const [activeCategory, setActiveCategory] = useState("rings");

  const [sortValue, setSortValue] = useState("price_desc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200 });

  const [selectedAppearance, setSelectedAppearance] = useState([]);
  const [selectedGems, setSelectedGems] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const { products, loading } = useProducts();

  useEffect(() => {
    const update = () => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      setPageSize(isMobile ? 8 : 12);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const p = Number.isFinite(pageFromUrlParam) ? pageFromUrlParam : 1;
    if (p !== page) setPage(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageFromUrlParam]);

  useEffect(() => {
    if (categoryFromUrl !== activeCategory) setActiveCategory(categoryFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFromUrl]);

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
    const prices = productsInCategory.map((p) => p.priceValue);
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;
    return { min, max };
  }, [productsInCategory]);

  useEffect(() => {
    setPriceRange({ min: priceBounds.min, max: priceBounds.max });
  }, [priceBounds.min, priceBounds.max]);

  const baseAfterPriceMaterial = useMemo(() => {
    let list = [...productsInCategory];

    list = list.filter(
      (p) => p.priceValue >= priceRange.min && p.priceValue <= priceRange.max,
    );

    if (selectedMaterial) {
      list = list.filter((p) => (p.colors || []).includes(selectedMaterial));
    }

    return list;
  }, [productsInCategory, priceRange.min, priceRange.max, selectedMaterial]);

  const materialOptions = useMemo(() => {
    let list = [...productsInCategory];

    list = list.filter(
      (p) => p.priceValue >= priceRange.min && p.priceValue <= priceRange.max,
    );

    const counts = {};

    for (const p of list) {
      for (const c of p.colors || []) {
        const normalized = String(c || "")
          .trim()
          .toLowerCase();
        if (!normalized) continue;
        counts[normalized] = (counts[normalized] || 0) + 1;
      }
    }

    const entries = Object.entries(counts).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );

    return entries.map(([value, count]) => ({
      value,
      label: formatMaterialLabel(value, t),
      count,
    }));
  }, [productsInCategory, priceRange.min, priceRange.max, t]);

  const appearanceOptionsWithCount = useMemo(() => {
    return APPEARANCE_OPTIONS.map((opt) => {
      const appearanceWithoutThis = selectedAppearance.filter(
        (v) => v !== opt.value,
      );

      let list = [...baseAfterPriceMaterial];

      list = applyGemsFilter(list, selectedGems);
      list = applySizeFilter(list, selectedSize);
      list = applyAppearanceFilter(list, appearanceWithoutThis);

      let count = 0;
      if (opt.value === "with_gem") count = list.filter((p) => p.hasGem).length;
      if (opt.value === "without_gem")
        count = list.filter((p) => !p.hasGem).length;
      if (opt.value === "rough")
        count = list.filter((p) => p.surface === "rough").length;
      if (opt.value === "smooth")
        count = list.filter((p) => p.surface === "smooth").length;

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
    return GEM_OPTIONS.map((opt) => {
      const gemsWithoutThis = selectedGems.filter((g) => g !== opt.value);

      let list = [...baseAfterPriceMaterial];

      list = applyAppearanceFilter(list, selectedAppearance);
      list = applySizeFilter(list, selectedSize);
      list = applyGemsFilter(list, gemsWithoutThis);

      const count = list.filter((p) =>
        (p.gemstones || []).includes(opt.value),
      ).length;

      return { ...opt, count };
    });
  }, [
    GEM_OPTIONS,
    baseAfterPriceMaterial,
    selectedAppearance,
    selectedGems,
    selectedSize,
  ]);

  const sizeOptionsWithCount = useMemo(() => {
    const allSizes = Array.from(
      new Set(productsInCategory.flatMap((p) => (p.sizes || []).map((s) => s))),
    ).sort((a, b) => {
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

      const count = list.filter((p) => (p.sizes || []).includes(size)).length;

      return { value: size, label: String(size), count };
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
        list.sort((a, b) => a.priceValue - b.priceValue);
        break;
      case "price_desc":
        list.sort((a, b) => b.priceValue - a.priceValue);
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

  const handlePageChange = (nextPage) => {
    const clamped = Math.max(1, Math.min(nextPage, totalPages));
    setPage(clamped);

    setSearchParams(
      (prev) => {
        const sp = new URLSearchParams(prev);
        sp.set("page", String(clamped));
        return sp;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    setPage(1);
    setSearchParams(
      (prev) => {
        const sp = new URLSearchParams(prev);
        sp.set("page", "1");
        return sp;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeCategory,
    selectedMaterial,
    priceRange.min,
    priceRange.max,
    selectedAppearance,
    selectedGems,
    selectedSize,
    sortValue,
  ]);

  const handleChangeCategory = (next) => {
    setActiveCategory(next);

    setSelectedMaterial(null);
    setSelectedAppearance([]);
    setSelectedGems([]);
    setSelectedSize(null);

    setPage(1);

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

  const handleClearAll = () => {
    setSelectedMaterial(null);
    setSelectedAppearance([]);
    setSelectedGems([]);
    setSelectedSize(null);
    setPriceRange({ min: priceBounds.min, max: priceBounds.max });

    setPage(1);
    setSearchParams(
      (prev) => {
        const sp = new URLSearchParams(prev);
        sp.set("page", "1");
        sp.delete("filter");
        return sp;
      },
      { replace: true },
    );
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
        onOpenFilter={() => setIsFilterOpen((p) => !p)}
        sortValue={sortValue}
        onSortChange={setSortValue}
      />

      <ProductsFilterPanel
        variant="mobile"
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        materialOptions={materialOptions}
        selectedMaterial={selectedMaterial}
        onMaterialChange={setSelectedMaterial}
        priceBounds={priceBounds}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
        appearanceOptions={appearanceOptionsWithCount}
        selectedAppearance={selectedAppearance}
        onAppearanceChange={setSelectedAppearance}
        gemOptions={gemOptionsWithCount}
        selectedGems={selectedGems}
        onGemsChange={setSelectedGems}
        sizeOptions={sizeOptionsWithCount}
        selectedSize={selectedSize}
        onSizeChange={setSelectedSize}
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
                onMaterialChange={setSelectedMaterial}
                priceBounds={priceBounds}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                appearanceOptions={appearanceOptionsWithCount}
                selectedAppearance={selectedAppearance}
                onAppearanceChange={setSelectedAppearance}
                gemOptions={gemOptionsWithCount}
                selectedGems={selectedGems}
                onGemsChange={setSelectedGems}
                sizeOptions={sizeOptionsWithCount}
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
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
                <div
                  className={[
                    "grid grid-cols-2 min-[460px]:grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-4 md:gap-y-6",
                    desktopColsClass,
                  ].join(" ")}
                >
                  {pageItems.map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={{ ...product, image: product.thumbnail }}
                      priority={idx < 4}
                      onAddToCart={() => {}}
                      onAddToFavorites={() => {}}
                      onMediaReady={() => {}}
                      onImageError={(e) => {
                        e.currentTarget.src = `${import.meta.env.BASE_URL}products/fallback.png`;
                      }}
                    />
                  ))}
                </div>

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
      <AboutStudioSection />
    </>
  );
}
