import useLanguage from "@/context/useLanguage";
import { fmtPrice } from "@/utils/checkout";
import ProductImage from "@/components/ui/ProductCard/ProductImage"; // Imported ProductImage component

export default function OrderSummary({
  variant = "mobile",
  items,
  subtotal,
  deliveryPrice = 0,
  deliveryType = "ship",
  total = subtotal + deliveryPrice,
  isOpen,
  onToggle,
  calcLineTotal,
}) {
  const { t } = useLanguage();
  const isMobile = variant === "mobile";

  return (
    <aside
      className={[
        "border border-black bg-white",
        isMobile ? "" : "sticky top-6 self-start",
      ].join(" ")}
    >
      {isMobile ? (
        <button
          type="button"
          onClick={onToggle}
          className="flex h-12 w-full items-center justify-between bg-black px-4 text-white"
        >
          <span className="font-ui text-sm">{t.checkoutPage.orderSummary}</span>

          <div className="flex items-center gap-3">
            <span className="font-ui text-sm">{fmtPrice(total)}</span>

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
        <div className="border-b border-black/20 px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="font-ui text-sm font-semibold">
              {t.checkoutPage.orderSummary}
            </p>
            <p className="font-ui text-sm font-semibold">{fmtPrice(total)}</p>
          </div>
        </div>
      )}

      {isMobile && !isOpen ? null : (
        <div
          className={[
            "px-4 py-4",
            isMobile ? "border-b border-black/20" : "",
          ].join(" ")}
        >
          {items.length === 0 ? (
            <p className="font-ui text-sm text-black/60">{t.bagEmpty}</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.key} className="grid grid-cols-[64px_1fr] gap-4">
                  {/* Updated image container to use ProductImage for URL normalization */}
                  <div className="relative h-20 w-16 overflow-hidden border border-black/10 bg-black/5">
                    <ProductImage
                      src={item.image}
                      alt={item.name || ""}
                      loaded={true}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-display text-[18px] leading-tight">
                        {item.name}
                      </p>
                      <p className="whitespace-nowrap font-ui text-[14px]">
                        {fmtPrice(calcLineTotal(item))}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {String(item.color || "").trim() && (
                        <span className="bg-black/5 px-3 py-2 font-ui text-[12px] text-black/70">
                          {t.color}:{" "}
                          <span className="font-semibold">{item.color}</span>
                        </span>
                      )}

                      <span className="bg-black/5 px-3 py-2 font-ui text-[12px] text-black/70">
                        {t.size}:{" "}
                        <span className="font-semibold">
                          {item.size || t.oneSize}
                        </span>
                      </span>

                      <span className="bg-black/5 px-3 py-2 font-ui text-[12px] text-black/70">
                        {t.checkoutPage.quantityShort}:{" "}
                        <span className="font-semibold">
                          {item.quantity || 1}
                        </span>
                      </span>
                    </div>

                    {item?.category === "personal" &&
                    (() => {
                      const service = String(
                        item?.serviceOption || "",
                      ).toLowerCase();
                      const isShippingKit =
                        service === "shipping" ||
                        service === "shipping-kit" ||
                        service === "shipping_kit";

                      return isShippingKit;
                    })() ? (
                      <p className="mt-2 font-ui text-[12px] text-black/50">
                        {t.shippingKit} + {fmtPrice(15)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}

              <div className="space-y-2 border-t border-black/20 pt-2">
                <div className="flex items-center justify-between">
                  <p className="font-ui text-sm text-black/60">
                    {t.checkoutPage.subtotal}
                  </p>
                  <p className="font-ui text-sm font-semibold">
                    {fmtPrice(subtotal)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="font-ui text-sm text-black/60">
                    {deliveryType === "pickup"
                      ? t.checkoutPage.pickup
                      : t.delivery}
                  </p>
                  <p className="font-ui text-sm font-semibold">
                    {deliveryType === "pickup"
                      ? t.checkoutPage.free
                      : fmtPrice(deliveryPrice)}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-black/20 pt-2">
                  <p className="font-ui text-sm text-black/60">{t.total}</p>
                  <p className="font-ui text-sm font-semibold">
                    {fmtPrice(total)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
