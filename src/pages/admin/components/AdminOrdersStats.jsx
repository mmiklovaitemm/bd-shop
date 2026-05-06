import useLanguage from "@/context/useLanguage";

export default function AdminOrdersStats({
  statusFilter,
  setStatusFilter,
  totalOrdersCount,
  pendingCount,
  confirmedCount,
  shippedCount,
  completedCount,
  canceledCount,
  totalRevenue,
}) {
  const { t } = useLanguage();
  const a = t.admin;
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">
      <button
        type="button"
        onClick={() => setStatusFilter("all")}
        className={`border border-black px-4 py-4 text-left ${
          statusFilter === "all" ? "bg-black text-white" : "bg-white"
        }`}
      >
        <p
          className={`font-ui text-xs ${
            statusFilter === "all" ? "text-white/70" : "text-black/60"
          }`}
        >
          {a.totalOrders}
        </p>
        <p className="mt-2 font-display text-3xl leading-none">
          {totalOrdersCount}
        </p>
      </button>

      <button
        type="button"
        onClick={() =>
          setStatusFilter((prev) => (prev === "Pending" ? "all" : "Pending"))
        }
        className={`border border-black px-4 py-4 text-left ${
          statusFilter === "Pending" ? "bg-black text-white" : "bg-white"
        }`}
      >
        <p
          className={`font-ui text-xs ${
            statusFilter === "Pending" ? "text-white/70" : "text-black/60"
          }`}
        >
          {a.pending}
        </p>
        <p className="mt-2 font-display text-3xl leading-none">
          {pendingCount}
        </p>
      </button>

      <button
        type="button"
        onClick={() =>
          setStatusFilter((prev) =>
            prev === "Confirmed" ? "all" : "Confirmed",
          )
        }
        className={`border border-black px-4 py-4 text-left ${
          statusFilter === "Confirmed" ? "bg-black text-white" : "bg-white"
        }`}
      >
        <p
          className={`font-ui text-xs ${
            statusFilter === "Confirmed" ? "text-white/70" : "text-black/60"
          }`}
        >
          {a.confirmed}
        </p>
        <p className="mt-2 font-display text-3xl leading-none">
          {confirmedCount}
        </p>
      </button>

      <button
        type="button"
        onClick={() =>
          setStatusFilter((prev) => (prev === "Shipped" ? "all" : "Shipped"))
        }
        className={`border border-black px-4 py-4 text-left ${
          statusFilter === "Shipped" ? "bg-black text-white" : "bg-white"
        }`}
      >
        <p
          className={`font-ui text-xs ${
            statusFilter === "Shipped" ? "text-white/70" : "text-black/60"
          }`}
        >
          {a.shipped}
        </p>
        <p className="mt-2 font-display text-3xl leading-none">
          {shippedCount}
        </p>
      </button>

      <button
        type="button"
        onClick={() =>
          setStatusFilter((prev) =>
            prev === "Completed" ? "all" : "Completed",
          )
        }
        className={`border border-black px-4 py-4 text-left ${
          statusFilter === "Completed" ? "bg-black text-white" : "bg-white"
        }`}
      >
        <p
          className={`font-ui text-xs ${
            statusFilter === "Completed" ? "text-white/70" : "text-black/60"
          }`}
        >
          {a.completed}
        </p>
        <p className="mt-2 font-display text-3xl leading-none">
          {completedCount}
        </p>
      </button>

      <button
        type="button"
        onClick={() =>
          setStatusFilter((prev) => (prev === "Canceled" ? "all" : "Canceled"))
        }
        className={`border border-black px-4 py-4 text-left ${
          statusFilter === "Canceled" ? "bg-black text-white" : "bg-white"
        }`}
      >
        <p
          className={`font-ui text-xs ${
            statusFilter === "Canceled" ? "text-white/70" : "text-black/60"
          }`}
        >
          {a.canceled}
        </p>
        <p className="mt-2 font-display text-3xl leading-none">
          {canceledCount}
        </p>
      </button>

      <div className="border border-black bg-white px-4 py-4">
        <p className="font-ui text-xs text-black/60">{a.totalRevenue}</p>
        <p className="mt-2 font-ui text-[18px] leading-none md:text-[24px]">
          €{(totalRevenue / 100).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
