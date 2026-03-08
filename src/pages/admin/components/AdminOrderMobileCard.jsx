import StatusPill from "@/pages/account/StatusPill";
import { getDeliveryLabel } from "@/pages/admin/helpers/orderHelpers";

export default function AdminOrderMobileCard({
  order,
  savingId,
  statusOptions,
  onStatusChange,
  onViewDetails,
}) {
  return (
    <div className="border border-black bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-ui text-xs text-black/50">Order ID</p>
          <p className="mt-1 font-ui text-sm">{order.id}</p>
        </div>

        <div className="shrink-0">
          <StatusPill status={order.status || "Pending"} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 font-ui text-sm">
        <div>
          <p className="text-black/50">Date</p>
          <p className="mt-1">
            {new Date(order.created_at).toISOString().slice(0, 10)}
          </p>
        </div>

        <div>
          <p className="text-black/50">Items</p>
          <p className="mt-1">
            {(order.items || []).reduce(
              (sum, item) => sum + Number(item.quantity || 1),
              0,
            )}
          </p>
        </div>

        <div className="col-span-2">
          <p className="text-black/50">Email</p>
          <p className="mt-1 break-all">{order.contact_email || "-"}</p>
        </div>

        <div>
          <p className="text-black/50">Delivery</p>
          <p className="mt-1">{getDeliveryLabel(order)}</p>
        </div>

        <div>
          <p className="text-black/50">Total</p>
          <p className="mt-1">
            €{(Number(order.total_cents || 0) / 100).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select
          className="border border-black bg-white px-3 py-3 font-ui text-sm"
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

        <button
          type="button"
          className="border border-black bg-white px-3 py-3 font-ui text-sm"
          onClick={() => onViewDetails(order)}
        >
          View details
        </button>
      </div>
    </div>
  );
}
