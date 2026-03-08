export function getDeliveryFilterValue(order) {
  if (order.delivery_type === "pickup") return "pickup";
  if (order.delivery_method === "omniva") return "omniva";
  if (order.delivery_method === "lp") return "lp";
  return "other";
}

export function getDeliveryLabel(order) {
  if (order.delivery_type === "pickup") return "Pickup";
  if (order.delivery_method === "omniva") return "Omniva";
  if (order.delivery_method === "lp") return "LP Express";
  return "-";
}

export function getOrderStats(orders) {
  return {
    totalOrdersCount: orders.length,
    pendingCount: orders.filter((o) => o.status === "Pending").length,
    confirmedCount: orders.filter((o) => o.status === "Confirmed").length,
    shippedCount: orders.filter((o) => o.status === "Shipped").length,
    completedCount: orders.filter((o) => o.status === "Completed").length,
    canceledCount: orders.filter((o) => o.status === "Canceled").length,
    totalRevenue: orders.reduce(
      (sum, order) => sum + Number(order.total_cents || 0),
      0,
    ),
  };
}

export function getFilteredOrdersData({
  orders,
  searchEmail,
  statusFilter,
  deliveryFilter,
  sortOrder,
  page,
  pageSize,
}) {
  const filteredOrders = orders
    .filter((order) => {
      const matchesEmail = String(order.contact_email || "")
        .toLowerCase()
        .includes(searchEmail.trim().toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : order.status === statusFilter;

      const matchesDelivery =
        deliveryFilter === "all"
          ? true
          : getDeliveryFilterValue(order) === deliveryFilter;

      return matchesEmail && matchesStatus && matchesDelivery;
    })
    .sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();

      return sortOrder === "oldest" ? aTime - bTime : bTime - aTime;
    });

  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageItems = filteredOrders.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return {
    filteredOrders,
    totalItems,
    totalPages,
    safePage,
    pageItems,
  };
}
