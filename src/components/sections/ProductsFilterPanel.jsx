import closeIcon from "@/assets/ui/arrow-up-right.svg";

export default function ProductsFilterPanel({
  isOpen,
  onClose,
  variant = "auto",
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile/Tablet overlay */}
      {(variant === "auto" || variant === "mobile") && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close filter"
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          <aside className="absolute right-0 top-0 h-full w-[92%] max-w-[380px] bg-white border-l border-black">
            <div className="h-12 px-4 flex items-center justify-between border-b border-black">
              <span className="font-ui text-[14px]">Filter</span>

              <button
                type="button"
                onClick={onClose}
                className="font-ui text-[14px] flex items-center gap-2 transition-all duration-300 ease-out hover:-translate-y-[2px]"
              >
                Close
                <img
                  src={closeIcon}
                  alt="Close"
                  className="transition-transform duration-300 ease-out group-hover:-translate-y-[2px]"
                />
              </button>
            </div>

            <div className="p-4">
              <div className="text-black/60 font-ui text-[13px]">
                Filter content...
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop inline */}
      {(variant === "auto" || variant === "desktop") && (
        <aside className="hidden lg:block w-[240px] bg-white border border-black h-fit sticky top-6">
          <div className="h-12 px-4 flex items-center justify-between border-b border-black bg-black text-white">
            <span className="font-ui text-[14px]">Filter</span>

            <button
              type="button"
              onClick={onClose}
              className="font-ui text-[14px] flex items-center gap-2 text-white transition-all duration-300 ease-out hover:-translate-y-[2px]"
            >
              Close
              <img
                src={closeIcon}
                alt="Close"
                className="w-3 h-2 invert transition-transform duration-300 ease-out group-hover:-translate-y-[2px]"
              />
            </button>
          </div>

          <div className="p-4">
            <div className="text-black/60 font-ui text-[13px]">
              Filter content...
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
