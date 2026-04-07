import StatusPill from "@/pages/account/StatusPill";
import { getDeliveryLabel } from "@/pages/admin/helpers/orderHelpers";
import Loader from "@/components/ui/Loader";
import ProductImage from "@/components/ui/ProductCard/ProductImage";

export default function AdminOrderDetailsModal({
  order,
  statusOptions,
  onClose,
  onStatusChange,
  savingId,
}) {
  if (!order) return null;

  const deliveryTypeLabel =
    order.delivery_type === "pickup"
      ? "Pickup"
      : order.delivery_type === "ship"
        ? "Shipping"
        : "-";

  const pickupLocationLabel =
    order.delivery_method === "vilnius"
      ? "Vilnius salon"
      : order.delivery_method === "kaunas"
        ? "Kaunas salon"
        : "-";

  const currentStatus = order.status || "Pending";

  const availableStatusOptions =
    currentStatus === "Canceled"
      ? ["Canceled"]
      : currentStatus === "Completed"
        ? ["Completed", "Canceled"]
        : statusOptions;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-black bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black px-4 py-4 md:px-6">
          <h2 className="font-display text-2xl leading-none">
            Order #{order.id}
          </h2>

          <button
            type="button"
            className="border border-black bg-white px-3 py-2 hover:bg-black hover:text-white transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 p-4 font-ui text-sm md:grid-cols-2 md:p-6 xl:grid-cols-3">
          <div>
            <p className="font-semibold uppercase text-[11px] tracking-wider text-black/40">
              Customer
            </p>
            <div className="mt-2 space-y-1 text-black/70">
              <p className="font-medium text-black">
                {order.contact_email || "-"}
              </p>
              <p>
                {[order.ship_first_name, order.ship_last_name]
                  .filter(Boolean)
                  .join(" ") || "-"}
              </p>
              <p>
                {[order.ship_address, order.ship_apartment]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </p>
              <p>
                {[order.ship_postal_code, order.ship_city]
                  .filter(Boolean)
                  .join(" ") || "-"}
              </p>
              <p>{order.ship_country || "-"}</p>
              <p>{order.ship_phone || "-"}</p>
            </div>
          </div>

          <div>
            <p className="font-semibold uppercase text-[11px] tracking-wider text-black/40">
              Delivery
            </p>
            <div className="mt-2 space-y-1 text-black/70">
              <p>Type: {deliveryTypeLabel}</p>

              {order.delivery_type === "pickup" ? (
                <p>Location: {pickupLocationLabel}</p>
              ) : (
                <p>Method: {getDeliveryLabel(order)}</p>
              )}

              <p>
                Payment:{" "}
                {order.payment_type === "bank"
                  ? `Bank (${order.payment_bank || "-"})`
                  : order.payment_type === "card"
                    ? "Card"
                    : "-"}
              </p>

              <p>
                Fee: €{(Number(order.delivery_fee_cents || 0) / 100).toFixed(2)}
              </p>
              <p className="font-medium text-black">
                Total: €{(Number(order.total_cents || 0) / 100).toFixed(2)}
              </p>
            </div>
          </div>

          <div>
            <p className="font-semibold uppercase text-[11px] tracking-wider text-black/40">
              Status Control
            </p>
            <div className="mt-2 space-y-3">
              <StatusPill status={order.status || "Pending"} />

              <div className="relative">
                <select
                  className="w-full border border-black bg-white px-3 py-2 outline-none disabled:opacity-60"
                  disabled={
                    savingId === order.id || currentStatus === "Canceled"
                  }
                  value={currentStatus}
                  onChange={(e) => {
                    onStatusChange(order.id, e.target.value);
                  }}
                >
                  {availableStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {savingId === order.id && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <Loader className="h-4 w-4" />
                  </div>
                )}
              </div>

              {currentStatus === "Canceled" && (
                <p className="text-[11px] leading-tight text-red-600">
                  This order is canceled. Stock has already been restored and
                  cannot be reopened.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-black px-4 py-4 md:px-6 md:py-6">
          <p className="font-semibold uppercase text-[11px] tracking-wider text-black/40">
            Order Items
          </p>

          <div className="mt-4 grid gap-3">
            {(order.items || []).map((item) => (
              <div
                key={item.id}
                className="border border-black/10 bg-black/5 px-4 py-4"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[72px_1fr]">
                  {/*  Using ProductImage here */}
                  <div className="mx-auto h-[72px] w-[72px] overflow-hidden bg-white sm:mx-0 border border-black/5 relative">
                    <ProductImage
                      src={item.image_url}
                      alt={item.product_name || "Product"}
                      loaded={true}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-black">
                        {item.product_name}
                      </p>
                      <p className="font-medium">
                        €{(Number(item.price_cents || 0) / 100).toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[13px] text-black/70">
                      <p>
                        Quantity:{" "}
                        <span className="text-black">{item.quantity || 1}</span>
                      </p>
                      <p>
                        Color:{" "}
                        <span className="text-black capitalize">
                          {item.color || "-"}
                        </span>
                      </p>
                      <p>
                        Size:{" "}
                        <span className="text-black uppercase">
                          {item.size || "-"}
                        </span>
                      </p>
                      <p>
                        Service:{" "}
                        <span className="text-black">
                          {item.service_option === "shipping"
                            ? "Shipping kit (+15€)"
                            : item.service_option === "in_store"
                              ? "In-store"
                              : "Standard"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
