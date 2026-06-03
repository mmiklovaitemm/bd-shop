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
        <div className="fixed inset-0 z-[110] lg:hidden">
          <button
            type="button"
            aria-label={t.closeSort}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          <aside className="absolute right-0 top-0 flex h-full w-[95%] max-w-[420px] flex-col border-l border-black bg-white shadow-xl">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-black px-4">
              <span className="font-ui text-[16px] font-medium">{t.sortBy}</span>

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

            <div className="flex-1 overflow-y-scroll overscroll-contain py-2">
              <ul role="listbox">
                {options.map((opt) => {
                  const active = opt.value === sortValue;

                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        className={[
                          "w-full px-6 py-4 text-left font-ui text-[15px]",
                          "hover:bg-black/5 transition-colors",
                          active ? "font-medium bg-black/5" : "font-normal",
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
