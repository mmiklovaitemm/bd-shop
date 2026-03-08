export default function PickupSection({ pickupLocation, setPickupLocation }) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-[28px] leading-none">
          Pickup location
        </h2>

        <p className="mt-2 font-ui text-sm text-black/60">
          Select the salon where you want to pick up your order.
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
            <p className="font-medium">Vilnius salon</p>
            <p className="text-black/60">Kauno str. 24</p>
            <p className="text-black/60">I–VII — 10:00–20:00</p>
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
            <p className="font-medium">Kaunas salon</p>
            <p className="text-black/60">Žemaičių str. 24</p>
            <p className="text-black/60">I–VII — 10:00–20:00</p>
          </div>
        </label>
      </div>

      <p className="font-ui text-sm text-black/60">
        Pickup is free. We will contact you by email after your order is placed.
      </p>
    </section>
  );
}
