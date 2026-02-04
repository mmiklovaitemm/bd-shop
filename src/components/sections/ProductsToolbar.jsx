import { useEffect, useMemo, useRef, useState } from "react";
import filterIcon from "@/assets/ui/filter-icon.svg";

const SORT_OPTIONS = [
  { value: "price_desc", label: "Price, high to low" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "best_selling", label: "Best selling" },
  { value: "date_asc", label: "Date, old to new" },
  { value: "date_desc", label: "Date, new to old" },
];

export default function ProductsToolbar({
  title = "Collections",

  // CATEGORY
  categories = [], // [{label, value}]
  activeCategoryValue = "rings",
  activeCategoryLabel = "Rings",
  onCategoryChange,

  // FILTER
  onOpenFilter,

  // SORT
  sortValue = "price_desc",
  onSortChange,
}) {
  const [isSortOpen, setIsSortOpen] = useState(false);
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
      if (next) setIsSortOpen(false);
      return next;
    });
  };

  const toggleSort = () => {
    setIsSortOpen((p) => {
      const next = !p;
      if (next) setIsCategoryOpen(false);
      return next;
    });
  };

  return (
    <section className="w-full">
      {/* Title */}
      <div className="border-b border-black">
        <h1 className="font-display text-[44px] leading-none px-6 py-6 md:text-[56px]">
          {title}
        </h1>
      </div>

      {/* Category row (dropdown) */}
      <div
        ref={categoryWrapRef}
        className="border-b border-black px-6 py-4 relative"
      >
        <button
          type="button"
          onClick={toggleCategory}
          className="w-full flex items-center justify-between font-ui text-[14px] text-black"
          aria-label="Select category"
          aria-haspopup="listbox"
          aria-expanded={isCategoryOpen}
        >
          <span className="font-medium">{activeCategoryLabel}</span>
          <span className="text-black/60">˅</span>
        </button>

        {isCategoryOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 border border-black bg-white shadow-sm z-50">
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
      </div>

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

            {isSortOpen && (
              <div className="absolute left-0 top-full -mt-px w-full border border-black bg-white shadow-sm z-50">
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
    </section>
  );
}
