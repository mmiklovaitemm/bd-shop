import { useEffect, useMemo, useRef, useState } from "react";
import filterIcon from "@/assets/ui/filter-icon.svg";
import { HiChevronDown } from "react-icons/hi";
import ProductsSortPanel from "@/components/sections/ProductsSortPanel";
import FullWidthDivider from "../ui/FullWidthDivider";

const SORT_OPTIONS = [
  { value: "price_desc", label: "Price, high to low" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "best_selling", label: "Best selling" },
  { value: "date_asc", label: "Date, old to new" },
  { value: "date_desc", label: "Date, new to old" },
];

export default function ProductsToolbar({
  title = "Collections",
  categories = [],
  activeCategoryValue = "rings",
  activeCategoryLabel = "Rings",
  onCategoryChange,
  onOpenFilter,
  sortValue = "price_desc",
  onSortChange,
}) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const categoryWrapRef = useRef(null);
  const sortWrapRef = useRef(null);

  const activeSortLabel = useMemo(() => {
    const found = SORT_OPTIONS.find((o) => o.value === sortValue);
    return found ? found.label : "Price, high to low";
  }, [sortValue]);

  useEffect(() => {
    const onPointerDown = (e) => {
      const catEl = categoryWrapRef.current;
      const sortEl = sortWrapRef.current;

      const clickedInCategory = catEl?.contains(e.target);
      const clickedInSort = sortEl?.contains(e.target);

      if (!clickedInCategory) setIsCategoryOpen(false);
      if (!clickedInSort) setIsSortOpen(false);
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
    setIsCategoryOpen((p) => {
      const next = !p;
      if (next) {
        setIsSortOpen(false);
        setIsSortDrawerOpen(false);
      }
      return next;
    });
  };

  const toggleSort = () => {
    // mobile: drawer, desktop: dropdown
    const isMobile = window.matchMedia("(max-width: 1023px)").matches; // lg breakpoint

    if (isMobile) {
      setIsSortDrawerOpen(true);
      setIsCategoryOpen(false);
      setIsSortOpen(false);
      return;
    }

    setIsSortOpen((p) => {
      const next = !p;
      if (next) setIsCategoryOpen(false);
      return next;
    });
  };

  return (
    <section className="w-full">
      {/* Title */}
      <div>
        <h1 className="font-display text-[44px] leading-none px-6 py-6 md:text-[56px]">
          {title}
        </h1>
      </div>
      <FullWidthDivider />

      {/* Category row */}
      <div ref={categoryWrapRef} className="px-6 py-4 relative">
        {/* ===== MOBILE/TABLET dropdown (kept) ===== */}
        <button
          type="button"
          onClick={toggleCategory}
          className="w-full flex items-center justify-between font-ui text-[14px] text-black lg:hidden"
          aria-label="Select category"
          aria-haspopup="listbox"
          aria-expanded={isCategoryOpen}
        >
          <span className="font-medium">{activeCategoryLabel}</span>
          <HiChevronDown
            className={`text-black/70 w-5 h-5 md:w-4 md:h-4 transition-transform duration-200 ${
              isCategoryOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {isCategoryOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 border border-black bg-white shadow-sm z-50 lg:hidden">
            <ul role="listbox" className="py-2">
              {categories.map((cat) => (
                <li key={cat.value}>
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-2 font-ui text-[13px] hover:bg-black/5 ${
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

        {/* ===== DESKTOP row categories ===== */}
        <div className="hidden lg:flex items-center justify-end gap-10">
          {categories.map((cat) => {
            const isActive = cat.value === activeCategoryValue;

            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onCategoryChange?.(cat.value)}
                className={[
                  "relative font-ui text-[14px] transition-opacity",
                  isActive ? "opacity-100" : "opacity-70 hover:opacity-100",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <FullWidthDivider />

      {/* Filter + Sort row */}
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onOpenFilter}
          className="h-10 px-4 border border-black font-ui text-[14px] flex items-center gap-3 transition-all duration-300 ease-out hover:-translate-y-[2px]"
        >
          <span>Filter</span>
          <img src={filterIcon} alt="Filter" className="w-4 h-4 opacity-70" />
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline font-ui text-[12px] text-black/70">
            Sort by:
          </span>

          <div ref={sortWrapRef} className="relative w-[180px] md:w-[220px]">
            <button
              type="button"
              onClick={toggleSort}
              className="h-10 w-full px-4 border border-black font-ui text-[14px] inline-flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-[2px]"
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
            >
              <span className="truncate">{activeSortLabel}</span>
            </button>

            {/* desktop dropdown only */}
            {isSortOpen && (
              <div className="absolute left-0 top-full -mt-px w-full border border-black bg-white shadow-sm z-50 hidden lg:block">
                <ul role="listbox" className="py-2">
                  {SORT_OPTIONS.map((opt) => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        className={`w-full text-left px-4 py-2 font-ui text-[13px] hover:bg-black/5 ${
                          opt.value === sortValue
                            ? "font-medium"
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

      {/* mobile sort drawer */}
      <ProductsSortPanel
        isOpen={isSortDrawerOpen}
        onClose={() => setIsSortDrawerOpen(false)}
        sortValue={sortValue}
        onSortChange={onSortChange}
        options={SORT_OPTIONS}
      />
    </section>
  );
}
