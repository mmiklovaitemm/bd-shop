import useLanguage from "@/context/useLanguage";

export default function AdminOrdersFilters({
  searchEmail,
  setSearchEmail,
  sortOrder,
  setSortOrder,
  deliveryFilter,
  setDeliveryFilter,
  statusFilter,
  setStatusFilter,
  statusOptions,
}) {
  const { t } = useLanguage();
  const a = t.admin;
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <input
        type="text"
        placeholder={a.searchByEmail}
        value={searchEmail}
        onChange={(e) => setSearchEmail(e.target.value)}
        className="h-12 w-full border border-black px-4 font-ui text-sm outline-none"
      />

      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        className="h-12 w-full border border-black bg-white px-4 font-ui text-sm outline-none"
      >
        <option value="newest">{a.newestFirst}</option>
        <option value="oldest">{a.oldestFirst}</option>
      </select>

      <select
        value={deliveryFilter}
        onChange={(e) => setDeliveryFilter(e.target.value)}
        className="h-12 w-full border border-black bg-white px-4 font-ui text-sm outline-none"
      >
        <option value="all">{a.allDeliveryMethods}</option>
        <option value="lp">LP Express</option>
        <option value="omniva">Omniva</option>
        <option value="pickup">{a.pickupLabel}</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="h-12 w-full border border-black bg-white px-4 font-ui text-sm outline-none"
      >
        <option value="all">{a.allStatuses}</option>
        {statusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}
