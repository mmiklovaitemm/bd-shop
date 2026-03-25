import useLanguage from "@/context/useLanguage";

export default function ShippingMethodSelector({
  shippingMethod,
  setShippingMethod,
}) {
  const { t } = useLanguage();

  return (
    <div className="mt-8">
      <p className="font-ui text-sm font-semibold">
        {t.checkoutPage.chooseDeliveryMethod}
      </p>

      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={() => setShippingMethod("lp")}
          className={[
            "w-full border border-black px-4 py-4 flex items-center justify-between gap-4",
            shippingMethod === "lp"
              ? "bg-black text-white"
              : "bg-white text-black",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <span
              className={[
                "h-4 w-4 flex-none rounded-full border flex items-center justify-center",
                shippingMethod === "lp" ? "border-white" : "border-black",
              ].join(" ")}
              aria-hidden="true"
            >
              {shippingMethod === "lp" ? (
                <span className="h-2 w-2 rounded-full bg-white" />
              ) : null}
            </span>

            <div className="text-left leading-tight">
              <p className="font-ui text-[13px]">{t.checkoutPage.lpDelivery}</p>
            </div>
          </div>

          <p className="font-ui text-[13px] whitespace-nowrap">€2</p>
        </button>

        <button
          type="button"
          onClick={() => setShippingMethod("omniva")}
          className={[
            "w-full border border-black px-4 py-4 flex items-center justify-between gap-4",
            shippingMethod === "omniva"
              ? "bg-black text-white"
              : "bg-white text-black",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <span
              className={[
                "h-4 w-4 flex-none rounded-full border flex items-center justify-center",
                shippingMethod === "omniva" ? "border-white" : "border-black",
              ].join(" ")}
              aria-hidden="true"
            >
              {shippingMethod === "omniva" ? (
                <span className="h-2 w-2 rounded-full bg-white" />
              ) : null}
            </span>

            <div className="text-left leading-tight">
              <p className="font-ui text-[13px]">
                {t.checkoutPage.omnivaDelivery}
              </p>
            </div>
          </div>

          <p className="font-ui text-[13px] whitespace-nowrap">€2,50</p>
        </button>
      </div>
    </div>
  );
}
