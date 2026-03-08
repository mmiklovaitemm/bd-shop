import AdminOrderMobileCard from "@/pages/admin/components/AdminOrderMobileCard";

export default function AdminOrdersMobileList({
  orders,
  savingId,
  statusOptions,
  onStatusChange,
  onViewDetails,
}) {
  return (
    <div className="mt-6 grid gap-4 lg:hidden">
      {orders.map((order) => (
        <AdminOrderMobileCard
          key={order.id}
          order={order}
          savingId={savingId}
          statusOptions={statusOptions}
          onStatusChange={onStatusChange}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
