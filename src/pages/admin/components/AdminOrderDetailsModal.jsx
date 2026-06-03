import StatusPill from "@/pages/account/StatusPill";
import useLanguage from "@/context/useLanguage";
import { getDeliveryLabel } from "@/pages/admin/helpers/orderHelpers";
import Loader from "@/components/ui/Loader";
import ProductImage from "@/components/ui/ProductCard/ProductImage";

/**
 * Modal component for displaying detailed information about a specific order
 * includes customer details, delivery info, and an itemized list with images
 */
export default function AdminOrderDetailsModal({
  order,
  statusOptions,
  onClose,
  onStatusChange,
  savingId,
}) {
  if (!order) return null;
  const { t } = useLanguage();
  const a = t.admin;

  // Format delivery type labels
  const deliveryTypeLabel =
    order.delivery_type === "pickup"
      ? a.pickupLabel
      : order.delivery_type === "ship"
        ? a.shippingLabel
        : "-";

  // Format pickup location labels
  const pickupLocationLabel =
    order.delivery_method === "vilnius"
      ? a.vilniusSalon
      : order.delivery_method === "kaunas"
        ? a.kaunasSalon
        : "-";

  const currentStatus = order.status || "Pending";

  // Define logic for available status transitions
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
        className="max-h-[90vh] w-full max-w-6xl overflow-y-auto border border-black bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black px-4 py-4 md:px-6">
          <h2 className="font-display text-2xl leading-none">
            Order #{order.id}
          </h2>

          <button
            type="button"
            className="border border-black bg-white px-3 py-2 hover:bg-black hover:text-white transition-colors"
            onClick={onClose}
          >
            {a.close}
          </button>
        </div>

        {/* Order Meta Information Grid */}
        <div className="grid grid-cols-1 gap-5 p-4 font-ui text-sm md:grid-cols-2 md:p-6 xl:grid-cols-3">
          {/* Customer Details */}
          <div>
            <p className="font-semibold uppercase text-[11px] tracking-wider text-black/40">
              {a.customer}
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

          {/* Delivery & Payment Details */}
          <div>
            <p className="font-semibold uppercase text-[11px] tracking-wider text-black/40">
              {a.delivery}
            </p>
            <div className="mt-2 space-y-1 text-black/70">
              <p>
                {a.type} {deliveryTypeLabel}
              </p>

              {order.delivery_type === "pickup" ? (
                <p>
                  {a.location} {pickupLocationLabel}
                </p>
              ) : (
                <p>
                  {a.method} {getDeliveryLabel(order)}
                </p>
              )}

              <p>
                {a.payment}{" "}
                {order.payment_type === "bank"
                  ? `Bank (${order.payment_bank || "-"})`
                  : order.payment_type === "card"
                    ? a.card
                    : "-"}
              </p>

              <p>
                {a.fee} €
                {(Number(order.delivery_fee_cents || 0) / 100).toFixed(2)}
              </p>
              <p className="font-medium text-black">
                {a.totalLabel} €
                {(Number(order.total_cents || 0) / 100).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Order Status Control */}
          <div>
            <p className="font-semibold uppercase text-[11px] tracking-wider text-black/40">
              {a.statusControl}
            </p>
            <div className="mt-2 space-y-3">
              <StatusPill status={currentStatus} />

              <div className="relative">
                <select
                  className="w-full border border-black bg-white px-3 py-2 outline-none disabled:opacity-60"
                  disabled={
                    savingId === order.id || currentStatus === "Canceled"
                  }
                  value={currentStatus}
                  onChange={(e) => onStatusChange(order.id, e.target.value)}
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
                  {a.canceledNote}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="border-t border-black px-4 py-4 md:px-6 md:py-6">
          <p className="font-semibold uppercase text-[11px] tracking-wider text-black/40">
            {a.orderItems}
          </p>

          <div className="mt-4 grid gap-3">
            {(order.items || []).map((item) => (
              <div
                key={item.id}
                className="border border-black/10 bg-black/5 px-4 py-4"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[80px_1fr]">
                  <div className="relative mx-auto h-20 w-20 overflow-hidden bg-white sm:mx-0 border border-black/5">
                    <ProductImage
                      src={item.image_url}
                      alt={item.product_name || "Product"}
                      loaded={true}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Item Specifics */}
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
                        {a.quantity}{" "}
                        <span className="text-black">{item.quantity || 1}</span>
                      </p>
                      <p>
                        {a.color}{" "}
                        <span className="text-black capitalize">
                          {item.color || "-"}
                        </span>
                      </p>
                      <p>
                        {a.size}{" "}
                        <span className="text-black uppercase">
                          {item.size || "-"}
                        </span>
                      </p>
                      <p>
                        {a.service}{" "}
                        <span className="text-black">
                          {item.service_option === "shipping"
                            ? a.shippingKitService
                            : item.service_option === "in_store"
                              ? a.inStoreService
                              : a.standardService}
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
