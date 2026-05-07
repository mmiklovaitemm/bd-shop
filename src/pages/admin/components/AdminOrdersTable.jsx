import AdminOrderTableRow from "@/pages/admin/components/AdminOrderTableRow";
import useLanguage from "@/context/useLanguage";

export default function AdminOrdersTable({
  orders,
  savingId,
  statusOptions,
  onStatusChange,
  onViewDetails,
  onDelete,
}) {
  const { t } = useLanguage();
  const a = t.admin;
  return (
    <div className="mt-6 hidden overflow-x-auto border border-black lg:block">
      <table className="w-full border-collapse font-ui text-sm">
        <thead>
          <tr className="border-b border-black bg-black/5 text-left">
            <th className="px-4 py-3">{a.orderId}</th>
            <th className="px-4 py-3">{a.date}</th>
            <th className="px-4 py-3">{a.image}</th>
            <th className="px-4 py-3">{a.email}</th>
            <th className="px-4 py-3">{a.items}</th>
            <th className="px-4 py-3">{a.delivery}</th>
            <th className="px-4 py-3">{a.total}</th>
            <th className="px-4 py-3">{a.status}</th>
            <th className="px-4 py-3">{a.details}</th>
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
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
