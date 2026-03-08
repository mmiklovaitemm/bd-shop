import AdminOrderTableRow from "@/pages/admin/components/AdminOrderTableRow";

export default function AdminOrdersTable({
  orders,
  savingId,
  statusOptions,
  onStatusChange,
  onViewDetails,
}) {
  return (
    <div className="mt-6 hidden overflow-x-auto border border-black lg:block">
      <table className="w-full border-collapse font-ui text-sm">
        <thead>
          <tr className="border-b border-black bg-black/5 text-left">
            <th className="px-4 py-3">Order ID</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3">Delivery</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Details</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <AdminOrderTableRow
              key={order.id}
              order={order}
              savingId={savingId}
              statusOptions={statusOptions}
              onStatusChange={onStatusChange}
              onViewDetails={onViewDetails}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
