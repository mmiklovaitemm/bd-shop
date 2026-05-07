import { formatAdminOrderDate } from "@/pages/admin/helpers/orderHelpers";

export default function AdminOrderDeleteModal({
  order,
  onClose,
  onConfirm,
  deleting = false,
}) {
  if (!order) return null;

  const total = `€${(Number(order.total_cents || 0) / 100).toFixed(2)}`;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl border border-black bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black px-6 py-4">
          <h2 className="font-display text-2xl leading-none">
            Confirm order deletion
          </h2>

          <button
            type="button"
            className="border border-black bg-white px-3 py-2"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="p-6 font-ui text-sm">
          <p className="text-black/70">
            You are about to permanently delete this order.
          </p>

          <div className="mt-5 border border-red-600 bg-red-50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-black/50">Order ID</p>
                <p className="mt-1 text-black">{order.id}</p>
              </div>

              <div>
                <p className="text-black/50">Date</p>
                <p className="mt-1 text-black">
                  {formatAdminOrderDate(order.created_at)}
                </p>
              </div>

              <div>
                <p className="text-black/50">Email</p>
                <p className="mt-1 break-all text-black">
                  {order.contact_email || "-"}
                </p>
              </div>

              <div>
                <p className="text-black/50">Total</p>
                <p className="mt-1 text-black">{total}</p>
              </div>

              <div>
                <p className="text-black/50">Status</p>
                <p className="mt-1 text-black">{order.status || "Pending"}</p>
              </div>

              <div>
                <p className="text-black/50">Items</p>
                <p className="mt-1 text-black">
                  {(order.items || []).reduce(
                    (sum, item) => sum + Number(item.quantity || 1),
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-red-700">
            This action cannot be undone.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="border border-red-600 bg-red-600 px-4 py-3 text-white disabled:opacity-60"
              onClick={() => onConfirm(order.id)}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete order"}
            </button>

            <button
              type="button"
              className="border border-black bg-white px-4 py-3"
              onClick={onClose}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
