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
  onDelete,
}) {
  const currentStatus = order.status || "Pending";

  const availableStatusOptions =
    currentStatus === "Canceled"
      ? ["Canceled"]
      : currentStatus === "Completed"
        ? ["Completed", "Canceled"]
        : statusOptions;

  const previewImage = order.items?.[0]?.image_url;

  return (
    <tr className="border-b border-black/20">
      <td className="px-3 py-2">{order.id}</td>

      <td className="px-3 py-2 text-xs">{formatAdminOrderDate(order.created_at)} </td>

      <td className="px-3 py-2">
        <div className="relative h-10 w-10 border border-black/10 bg-white overflow-hidden">
          <ProductImage
            src={previewImage}
            alt="Order preview"
            loaded={true}
            className="h-full w-full object-cover"
          />
        </div>
      </td>

      <td className="px-3 py-2 text-xs truncate max-w-[180px]">{order.contact_email || "-"}</td>

      <td className="px-3 py-2 text-center">
        {(order.items || []).reduce(
          (sum, item) => sum + Number(item.quantity || 1),
          0,
        )}
      </td>

      <td className="px-3 py-2 text-xs">{getDeliveryLabel(order)}</td>

      <td className="px-3 py-2 text-xs">
        €{(Number(order.total_cents || 0) / 100).toFixed(2)}
      </td>

      <td className="px-3 py-2">
        <div className="flex flex-col gap-1">
          <StatusPill status={order.status || "Pending"} />

          <select
            className="border border-black bg-white px-2 py-1 disabled:opacity-60 text-xs w-full"
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
            <span className="text-[10px] text-black/50">Saving...</span>
          ) : null}
        </div>
      </td>

      <td className="px-3 py-2">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="border border-black bg-white px-2 py-1 hover:bg-black hover:text-white transition-colors whitespace-nowrap text-xs"
            onClick={() => onViewDetails(order)}
          >
            View details
          </button>
          <button
            type="button"
            className="border border-red-600 bg-white px-2 py-1 text-red-600 hover:bg-red-600 hover:text-white transition-colors whitespace-nowrap text-xs"
            onClick={() => onDelete(order.id)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
