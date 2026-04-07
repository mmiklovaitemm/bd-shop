import StatusPill from "@/pages/account/StatusPill";
import ProductImage from "@/components/ui/ProductCard/ProductImage";
import {
  getDeliveryLabel,
  formatAdminOrderDate,
} from "@/pages/admin/helpers/orderHelpers";

export default function AdminOrderTableRow({
  order,
  savingId,
  statusOptions,
  onStatusChange,
  onViewDetails,
}) {
  const currentStatus = order.status || "Pending";

  const availableStatusOptions =
    currentStatus === "Canceled"
      ? ["Canceled"]
      : currentStatus === "Completed"
        ? ["Completed", "Canceled"]
        : statusOptions;

  // Get the first item's image as a preview for the row
  const previewImage = order.items?.[0]?.image_url;

  return (
    <tr className="border-b border-black/20">
      <td className="px-4 py-3">{order.id}</td>

      <td className="px-4 py-3">{formatAdminOrderDate(order.created_at)} </td>

      {/* Image Preview Column */}
      <td className="px-4 py-3">
        <div className="h-10 w-10 border border-black/10 overflow-hidden bg-white">
          <ProductImage
            src={previewImage}
            alt="Order preview"
            loaded={true}
            className="h-full w-full object-cover"
          />
        </div>
      </td>

      <td className="px-4 py-3">{order.contact_email || "-"}</td>

      <td className="px-4 py-3">
        {(order.items || []).reduce(
          (sum, item) => sum + Number(item.quantity || 1),
          0,
        )}
      </td>

      <td className="px-4 py-3">{getDeliveryLabel(order)}</td>

      <td className="px-4 py-3">
        €{(Number(order.total_cents || 0) / 100).toFixed(2)}
      </td>

      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <StatusPill status={order.status || "Pending"} />

          <select
            className="border border-black bg-white px-3 py-2 disabled:opacity-60 text-xs"
            value={currentStatus}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            disabled={savingId === order.id || currentStatus === "Canceled"}
          >
            {availableStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {savingId === order.id ? (
            <span className="text-[11px] text-black/50">Saving...</span>
          ) : null}

          {currentStatus === "Canceled" ? (
            <span className="text-[11px] text-red-600">Stock restored</span>
          ) : null}
        </div>
      </td>

      <td className="px-4 py-3">
        <button
          type="button"
          className="border border-black bg-white px-3 py-2 hover:bg-black hover:text-white transition-colors"
          onClick={() => onViewDetails(order)}
        >
          View details
        </button>
      </td>
    </tr>
  );
}
