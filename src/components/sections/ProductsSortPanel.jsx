// src/components/sections/ProductsSortPanel.jsx
import closeIcon from "@/assets/ui/arrow-up-right.svg";
import useLanguage from "@/context/useLanguage";

export default function ProductsSortPanel({
  isOpen,
  onClose,
  sortValue,
  onSortChange,
  variant = "auto",
}) {
  const { t } = useLanguage();

  const options = [
    { value: "price_desc", label: t.sortPriceHighToLow },
    { value: "price_asc", label: t.sortPriceLowToHigh },
    { value: "best_selling", label: t.sortBestSelling },
    { value: "date_asc", label: t.sortDateOldToNew },
    { value: "date_desc", label: t.sortDateNewToOld },
  ];

  if (!isOpen) return null;

  return (
    <>
      {(variant === "auto" || variant === "mobile") && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label={t.closeSort}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          <aside className="absolute right-0 top-0 flex h-full w-[92%] max-w-[380px] flex-col border-l border-black bg-white">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-black px-4">
              <span className="font-ui text-[14px]">{t.sortBy}</span>

              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 font-ui text-[14px] transition-all duration-300 ease-out hover:-translate-y-[2px]"
              >
                {t.close}
                <img
                  src={closeIcon}
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-4"
                />
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
                          "w-full px-4 py-3 text-left font-ui text-[14px]",
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
