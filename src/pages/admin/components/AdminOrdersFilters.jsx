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
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <input
        type="text"
        placeholder="Search by email"
        value={searchEmail}
        onChange={(e) => setSearchEmail(e.target.value)}
        className="h-12 w-full border border-black px-4 font-ui text-sm outline-none"
      />

      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        className="h-12 w-full border border-black bg-white px-4 font-ui text-sm outline-none"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>

      <select
        value={deliveryFilter}
        onChange={(e) => setDeliveryFilter(e.target.value)}
        className="h-12 w-full border border-black bg-white px-4 font-ui text-sm outline-none"
      >
        <option value="all">All delivery methods</option>
        <option value="lp">LP Express</option>
        <option value="omniva">Omniva</option>
        <option value="pickup">Pickup</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="h-12 w-full border border-black bg-white px-4 font-ui text-sm outline-none"
      >
        <option value="all">All statuses</option>
        {statusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}
