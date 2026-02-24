import deliveryIcon from "@/assets/ui/delivery.svg";
import pickupIcon from "@/assets/ui/pick-up-icon.svg";

export default function DeliveryToggle({ deliveryType, setDeliveryType }) {
  return (
    <div>
      <p className="font-ui text-sm font-semibold">Delivery information</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setDeliveryType("ship")}
          className={[
            "h-12 border border-black font-ui text-[14px] flex items-center justify-center gap-2",
            deliveryType === "ship"
              ? "bg-black text-white"
              : "bg-white text-black",
          ].join(" ")}
        >
          <img
            src={deliveryIcon}
            alt=""
            className={[
              "h-4 w-4",
              deliveryType === "ship" ? "brightness-0 invert" : "",
            ].join(" ")}
          />
          <span>Ship</span>
        </button>

        <button
          type="button"
          onClick={() => setDeliveryType("pickup")}
          className={[
            "h-12 border border-black font-ui text-[14px] flex items-center justify-center gap-2",
            deliveryType === "pickup"
              ? "bg-black text-white"
              : "bg-white text-black",
          ].join(" ")}
        >
          <img
            src={pickupIcon}
            alt=""
            className={[
              "h-4 w-4",
              deliveryType === "pickup" ? "brightness-0 invert" : "",
            ].join(" ")}
          />
          <span>Pickup</span>
        </button>
      </div>
    </div>
  );
}
