import useLanguage from "@/context/useLanguage";

export default function PickupSection({ pickupLocation, setPickupLocation }) {
  const { t } = useLanguage();

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-[28px] leading-none">
          {t.checkoutPage.pickupTitle}
        </h2>

        <p className="mt-2 font-ui text-sm text-black/60">
          {t.checkoutPage.pickupDescription}
        </p>
      </div>

      <div className="space-y-3">
        <label
          className={`flex items-start gap-3 border px-4 py-4 cursor-pointer transition
            ${
              pickupLocation === "vilnius"
                ? "border-black bg-black/5"
                : "border-black/30 hover:border-black"
            }
          `}
        >
          <input
            type="radio"
            name="pickupLocation"
            value="vilnius"
            checked={pickupLocation === "vilnius"}
            onChange={() => setPickupLocation("vilnius")}
            className="accent-black"
          />

          <div className="font-ui text-sm">
            <p className="font-medium">
              {t.checkoutPage.pickupLocations.vilnius}
            </p>
            <p className="text-black/60">
              {t.checkoutPage.pickupAddresses.vilnius}
            </p>
            <p className="text-black/60">{t.workingHours}</p>
          </div>
        </label>

        <label
          className={`flex items-start gap-3 border px-4 py-4 cursor-pointer transition
            ${
              pickupLocation === "kaunas"
                ? "border-black bg-black/5"
                : "border-black/30 hover:border-black"
            }
          `}
        >
          <input
            type="radio"
            name="pickupLocation"
            value="kaunas"
            checked={pickupLocation === "kaunas"}
            onChange={() => setPickupLocation("kaunas")}
            className="accent-black"
          />

          <div className="font-ui text-sm">
            <p className="font-medium">
              {t.checkoutPage.pickupLocations.kaunas}
            </p>
            <p className="text-black/60">
              {t.checkoutPage.pickupAddresses.kaunas}
            </p>
            <p className="text-black/60">{t.workingHours}</p>
          </div>
        </label>
      </div>

      <p className="font-ui text-sm text-black/60">
        {t.checkoutPage.pickupInfo}
      </p>
    </section>
  );
}
