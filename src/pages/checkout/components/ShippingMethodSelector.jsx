export default function ShippingMethodSelector({
  shippingMethod,
  setShippingMethod,
}) {
  return (
    <div className="mt-8">
      <p className="font-ui text-sm font-semibold">Choose delivery method</p>

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
              <p className="font-ui text-[13px]">LP EXPRESS delivery to home</p>
            </div>
          </div>

          <p className="font-ui text-[13px] whitespace-nowrap">€4,99</p>
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
              <p className="font-ui text-[13px]">Omniva delivery to home</p>
            </div>
          </div>

          <p className="font-ui text-[13px] whitespace-nowrap">€6,99</p>
        </button>
      </div>
    </div>
  );
}
