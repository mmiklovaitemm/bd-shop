// src/components/sections/ProductsSortPanel.jsx
import closeIcon from "@/assets/ui/arrow-up-right.svg";

const DEFAULT_SORT_OPTIONS = [
  { value: "price_desc", label: "Price, high to low" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "best_selling", label: "Best selling" },
  { value: "date_asc", label: "Date, old to new" },
  { value: "date_desc", label: "Date, new to old" },
];

export default function ProductsSortPanel({
  isOpen,
  onClose,
  sortValue,
  onSortChange,
  options = DEFAULT_SORT_OPTIONS,
  variant = "auto",
}) {
  if (!isOpen) return null;

  return (
    <>
      {(variant === "auto" || variant === "mobile") && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close sort"
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          <aside className="absolute right-0 top-0 h-full w-[92%] max-w-[380px] bg-white border-l border-black flex flex-col">
            <div className="h-12 px-4 flex items-center justify-between border-b border-black shrink-0">
              <span className="font-ui text-[14px]">Sort by:</span>

              <button
                type="button"
                onClick={onClose}
                className="font-ui text-[14px] flex items-center gap-2 transition-all duration-300 ease-out hover:-translate-y-[2px]"
              >
                Close
                <img src={closeIcon} alt="Close" className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              <ul role="listbox">
                {options.map((opt) => {
                  const active = opt.value === sortValue;

                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        className={[
                          "w-full text-left px-4 py-3 font-ui text-[14px]",
                          "hover:bg-black/5",
                          active ? "font-medium" : "font-normal",
                        ].join(" ")}
                        onClick={() => {
                          onSortChange?.(opt.value);
                          onClose?.();
                        }}
                      >
                        {opt.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
