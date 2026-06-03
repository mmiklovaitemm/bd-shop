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
    <div className="mt-6 hidden border border-black lg:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] border-collapse font-ui text-sm">
          <thead>
            <tr className="border-b border-black bg-black/5 text-left">
              <th className="px-3 py-2 w-[60px]">{a.orderId}</th>
              <th className="px-3 py-2 w-[100px]">{a.date}</th>
              <th className="px-3 py-2 w-[60px]">{a.image}</th>
              <th className="px-3 py-2 w-[180px]">{a.email}</th>
              <th className="px-3 py-2 w-[60px]">{a.items}</th>
              <th className="px-3 py-2 w-[100px]">{a.delivery}</th>
              <th className="px-3 py-2 w-[80px]">{a.total}</th>
              <th className="px-3 py-2 w-[140px]">{a.status}</th>
              <th className="px-3 py-2 w-[120px]">{a.details}</th>
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
    </div>
  );
}
