import StatusPill from "@/pages/account/StatusPill";
import { getDeliveryLabel } from "@/pages/admin/helpers/orderHelpers";

export default function AdminOrderDetailsModal({
  order,
  statusOptions,
  onClose,
  onStatusChange,
  onSelectedOrderChange,
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
            className="border border-black bg-white px-3 py-2"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 p-4 font-ui text-sm md:grid-cols-2 md:p-6 xl:grid-cols-3">
          <div>
            <p className="font-semibold">Customer</p>
            <div className="mt-2 space-y-1 text-black/70">
              <p>{order.contact_email || "-"}</p>
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
            <p className="font-semibold">Delivery</p>
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
              <p>Total: €{(Number(order.total_cents || 0) / 100).toFixed(2)}</p>
            </div>
          </div>

          <div>
            <p className="font-semibold">Status</p>
            <div className="mt-2 space-y-3">
              <StatusPill status={order.status || "Pending"} />

              <select
                className="border border-black bg-white px-3 py-2"
                value={order.status || "Pending"}
                onChange={(e) => {
                  onStatusChange(order.id, e.target.value);
                  onSelectedOrderChange((prev) =>
                    prev ? { ...prev, status: e.target.value } : prev,
                  );
                }}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-black px-4 py-4 md:px-6 md:py-6">
          <p className="font-ui text-sm font-semibold">Products</p>

          <div className="mt-4 grid gap-3">
            {(order.items || []).map((item) => (
              <div
                key={item.id}
                className="border border-black/10 bg-black/5 px-4 py-4"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[72px_1fr]">
                  <div className="mx-auto h-[72px] w-[72px] overflow-hidden bg-white sm:mx-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name || "Product"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] text-black/40">
                        No image
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-black">
                        {item.product_name}
                      </p>
                      <p>€{(Number(item.price_cents || 0) / 100).toFixed(2)}</p>
                    </div>

                    <div className="mt-2 space-y-1 text-black/70">
                      <p>Qty: {item.quantity || 1}</p>
                      <p>Color: {item.color || "-"}</p>
                      <p>Size: {item.size || "-"}</p>
                      <p>
                        Service:{" "}
                        {item.service_option === "shipping"
                          ? "Shipping kit (+15€)"
                          : item.service_option === "in_store"
                            ? "In-store"
                            : "-"}
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
