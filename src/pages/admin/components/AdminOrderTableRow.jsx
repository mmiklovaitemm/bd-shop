import StatusPill from "@/pages/account/StatusPill";
import { getDeliveryLabel } from "@/pages/admin/helpers/orderHelpers";

export default function AdminOrderTableRow({
  order,
  savingId,
  statusOptions,
  onStatusChange,
  onViewDetails,
}) {
  return (
    <tr className="border-b border-black/20">
      <td className="px-4 py-3">{order.id}</td>

      <td className="px-4 py-3">
        {new Date(order.created_at).toISOString().slice(0, 10)}
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
            className="border border-black bg-white px-3 py-2"
            value={order.status || "Pending"}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            disabled={savingId === order.id}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </td>

      <td className="px-4 py-3">
        <button
          type="button"
          className="border border-black bg-white px-3 py-2"
          onClick={() => onViewDetails(order)}
        >
          View details
        </button>
      </td>
    </tr>
  );
}
