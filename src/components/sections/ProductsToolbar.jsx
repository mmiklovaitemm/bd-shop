import { useEffect, useMemo, useRef, useState } from "react";
import { HiChevronDown } from "react-icons/hi";

import filterIcon from "@/assets/ui/filter-icon.svg";
import ProductsSortPanel from "@/components/sections/ProductsSortPanel";
import FullWidthDivider from "../ui/FullWidthDivider";
import useLanguage from "@/context/useLanguage";

export default function ProductsToolbar({
  categories = [],
  activeCategoryValue = "rings",
  activeCategoryLabel = "Rings",
  onCategoryChange,
  onOpenFilter,
  sortValue = "price_desc",
  onSortChange,
}) {
  const { t } = useLanguage();

  const SORT_OPTIONS = useMemo(
    () => [
      { value: "price_desc", label: t.sortPriceHighToLow },
      { value: "price_asc", label: t.sortPriceLowToHigh },
      { value: "best_selling", label: t.sortBestSelling },
      { value: "date_asc", label: t.sortDateOldToNew },
      { value: "date_desc", label: t.sortDateNewToOld },
    ],
    [t],
  );

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const categoryWrapRef = useRef(null);
  const sortWrapRef = useRef(null);

  const activeSortLabel = useMemo(() => {
    const found = SORT_OPTIONS.find((o) => o.value === sortValue);
    return found ? found.label : t.sortPriceHighToLow;
  }, [SORT_OPTIONS, sortValue, t.sortPriceHighToLow]);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (!categoryWrapRef.current?.contains(e.target))
        setIsCategoryOpen(false);
      if (!sortWrapRef.current?.contains(e.target)) setIsSortOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsCategoryOpen(false);
        setIsSortOpen(false);
        setIsSortDrawerOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const toggleCategory = () => {
    setIsCategoryOpen((p) => !p);
    setIsSortOpen(false);
  };

  const toggleSort = () => {
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (isMobile) {
      setIsSortDrawerOpen(true);
      return;
    }
    setIsSortOpen((p) => !p);
    setIsCategoryOpen(false);
  };

  return (
    <section className="w-full">
      {/* Category row */}
      <div ref={categoryWrapRef} className="relative px-8 py-4">
        {/* MOBILE/TABLET dropdown */}
        <button
          type="button"
          onClick={toggleCategory}
          className="flex w-full items-center justify-between font-ui text-[14px] text-black lg:hidden"
          aria-expanded={isCategoryOpen}
        >
          <span className="font-medium">{activeCategoryLabel}</span>
          <HiChevronDown
            className={`h-5 w-5 text-black/70 transition-transform duration-200 ${
              isCategoryOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {isCategoryOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 border border-black bg-white shadow-sm lg:hidden">
            <ul className="py-2">
              {categories.map((cat) => (
                <li key={cat.value}>
                  <button
                    type="button"
                    className={`w-full px-8 py-2 text-left font-ui text-[13px] hover:bg-black/5 ${
                      cat.value === activeCategoryValue
                        ? "font-medium"
                        : "font-normal"
                    }`}
                    onClick={() => {
                      onCategoryChange?.(cat.value);
                      setIsCategoryOpen(false);
                    }}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* DESKTOP row categories */}
        <div className="hidden items-center justify-end gap-10 lg:flex">
          {categories.map((cat) => {
            const isActive = cat.value === activeCategoryValue;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onCategoryChange?.(cat.value)}
                className={`relative font-ui text-[14px] transition-opacity ${
                  isActive
                    ? "opacity-100 font-medium"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <FullWidthDivider />

      {/* Filter + Sort row */}
      <div className="flex justify-center">
        <div className="flex w-full max-w-[1200px] items-center justify-between px-8 py-4">
          {/* FILTER BUTTON */}
          <button
            type="button"
            onClick={onOpenFilter}
            className="flex h-10 items-center gap-3 border border-black px-6 font-ui text-[14px] uppercase tracking-widest transition-all duration-300 hover:bg-black hover:text-white active:scale-95"
          >
            <span>{t.filter}</span>
            <img
              src={filterIcon}
              alt=""
              className="h-3.5 w-3.5 opacity-70 group-hover:invert"
            />
          </button>

          {/* SORT SECTION */}
          <div className="flex items-center gap-4">
            <span className="hidden font-ui text-[11px] font-medium text-black/50 md:inline uppercase tracking-[0.15em]">
              {t.sortBy}
            </span>

            <div ref={sortWrapRef} className="relative w-[200px] md:w-[240px]">
              <button
                type="button"
                onClick={toggleSort}
                className="inline-flex h-10 w-full items-center justify-between border border-black px-4 font-ui text-[13px] transition-all duration-300 hover:border-black/40"
              >
                <span className="truncate">{activeSortLabel}</span>
                <HiChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isSortOpen && (
                <div className="absolute left-0 top-full z-50 -mt-px hidden w-full border border-black bg-white shadow-lg lg:block">
                  <ul className="py-2">
                    {SORT_OPTIONS.map((opt) => (
                      <li key={opt.value}>
                        <button
                          type="button"
                          className={`w-full px-4 py-2 text-left font-ui text-[13px] transition-colors hover:bg-black/5 ${
                            opt.value === sortValue
                              ? "font-semibold"
                              : "font-normal"
                          }`}
                          onClick={() => {
                            onSortChange?.(opt.value);
                            setIsSortOpen(false);
                          }}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProductsSortPanel
        isOpen={isSortDrawerOpen}
        onClose={() => setIsSortDrawerOpen(false)}
        sortValue={sortValue}
        onSortChange={onSortChange}
      />
    </section>
  );
}
