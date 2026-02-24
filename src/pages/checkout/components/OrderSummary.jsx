import { fmtPrice } from "@/utils/checkout";

export default function OrderSummary({
  variant = "mobile",
  items,
  subtotal,
  isOpen,
  onToggle,
  calcLineTotal,
}) {
  const isMobile = variant === "mobile";

  return (
    <aside
      className={[
        "bg-white border border-black",
        isMobile ? "" : "sticky top-6 self-start",
      ].join(" ")}
    >
      {/* Mobile only: Order summary bar */}
      {isMobile ? (
        <button
          type="button"
          onClick={onToggle}
          className="w-full h-12 px-4 bg-black text-white flex items-center justify-between"
        >
          <span className="font-ui text-sm">Order summary</span>

          <div className="flex items-center gap-3">
            <span className="font-ui text-sm">{fmtPrice(subtotal)}</span>

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className={[
                "transition-transform duration-200",
                isOpen ? "rotate-180" : "rotate-0",
              ].join(" ")}
              aria-hidden="true"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
      ) : (
        <div className="px-4 py-4 border-b border-black/20">
          <div className="flex items-center justify-between">
            <p className="font-ui text-sm font-semibold">Order summary</p>
            <p className="font-ui text-sm font-semibold">
              {fmtPrice(subtotal)}
            </p>
          </div>
        </div>
      )}

      {/* Summary content */}
      {isMobile && !isOpen ? null : (
        <div
          className={[
            "px-4 py-4",
            isMobile ? "border-b border-black/20" : "",
          ].join(" ")}
        >
          {items.length === 0 ? (
            <p className="font-ui text-sm text-black/60">Your bag is empty.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.key} className="grid grid-cols-[64px_1fr] gap-4">
                  <div className="w-16 h-20 bg-black/5 overflow-hidden border border-black/10">
                    <img
                      src={item.image}
                      alt={item.name || ""}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-display text-[18px] leading-tight">
                        {item.name}
                      </p>
                      <p className="font-ui text-[14px] whitespace-nowrap">
                        {fmtPrice(calcLineTotal(item))}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="bg-black/5 px-3 py-2 font-ui text-[12px] text-black/70">
                        Color:{" "}
                        <span className="font-semibold">
                          {item.color || "—"}
                        </span>
                      </span>

                      <span className="bg-black/5 px-3 py-2 font-ui text-[12px] text-black/70">
                        Size:{" "}
                        <span className="font-semibold">
                          {item.size || "One size"}
                        </span>
                      </span>

                      <span className="bg-black/5 px-3 py-2 font-ui text-[12px] text-black/70">
                        Qnty.:{" "}
                        <span className="font-semibold">
                          {item.quantity || 1}
                        </span>
                      </span>
                    </div>

                    {item?.category === "personal" &&
                    String(item?.serviceOption || "")
                      .toLowerCase()
                      .includes("shipping") ? (
                      <p className="mt-2 font-ui text-[12px] text-black/50">
                        Shipping kit + {fmtPrice(15)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}

              <div className="pt-2 flex items-center justify-between border-t border-black/20">
                <p className="font-ui text-sm text-black/60">Total</p>
                <p className="font-ui text-sm font-semibold">
                  {fmtPrice(subtotal)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
