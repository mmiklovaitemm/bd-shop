import { useEffect, useState } from "react";

import FullWidthDivider from "@/components/ui/FullWidthDivider";
import Pagination from "@/components/ui/Pagination";
import AdminOrdersStats from "@/pages/admin/components/AdminOrdersStats";
import AdminOrdersFilters from "@/pages/admin/components/AdminOrdersFilters";
import AdminOrderDetailsModal from "@/pages/admin/components/AdminOrderDetailsModal";
import AdminOrdersTable from "@/pages/admin/components/AdminOrdersTable";
import AdminOrdersMobileList from "@/pages/admin/components/AdminOrdersMobileList";
import useAdminOrders from "@/pages/admin/hooks/useAdminOrders";
import useOrderStatusUpdate from "@/pages/admin/hooks/useOrderStatusUpdate";
import {
  getOrderStats,
  getFilteredOrdersData,
} from "@/pages/admin/helpers/orderHelpers";

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Completed",
  "Canceled",
];

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchEmail, setSearchEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { orders, setOrders, loading, error, fetchOrders } = useAdminOrders();

  useEffect(() => {
    if (!selectedOrder) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedOrder(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedOrder]);

  const handleSearchEmailChange = (value) => {
    setSearchEmail(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleDeliveryFilterChange = (value) => {
    setDeliveryFilter(value);
    setPage(1);
  };

  const handleSortOrderChange = (value) => {
    setSortOrder(value);
    setPage(1);
  };

  const { filteredOrders, totalItems, safePage, pageItems } =
    getFilteredOrdersData({
      orders,
      searchEmail,
      statusFilter,
      deliveryFilter,
      sortOrder,
      page,
      pageSize,
    });

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  const {
    totalOrdersCount,
    pendingCount,
    confirmedCount,
    shippedCount,
    completedCount,
    canceledCount,
    totalRevenue,
  } = getOrderStats(orders);

  const { savingId, handleStatusChange } = useOrderStatusUpdate({
    setOrders,
    fetchOrders,
  });

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <h1 className="font-display text-4xl leading-none">Admin orders</h1>

        <AdminOrdersStats
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          totalOrdersCount={totalOrdersCount}
          pendingCount={pendingCount}
          confirmedCount={confirmedCount}
          shippedCount={shippedCount}
          completedCount={completedCount}
          canceledCount={canceledCount}
          totalRevenue={totalRevenue}
        />

        <AdminOrdersFilters
          searchEmail={searchEmail}
          setSearchEmail={handleSearchEmailChange}
          sortOrder={sortOrder}
          setSortOrder={handleSortOrderChange}
          deliveryFilter={deliveryFilter}
          setDeliveryFilter={handleDeliveryFilterChange}
          statusFilter={statusFilter}
          setStatusFilter={handleStatusFilterChange}
          statusOptions={STATUS_OPTIONS}
        />

        {loading ? (
          <p className="mt-6 font-ui text-sm text-black/60">Loading...</p>
        ) : error ? (
          <div className="mt-6 border border-red-600 bg-red-50 px-4 py-3 font-ui text-sm text-red-700">
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <p className="mt-6 font-ui text-sm text-black/60">
            No matching orders found.
          </p>
        ) : (
          <>
            <AdminOrdersMobileList
              orders={pageItems}
              savingId={savingId}
              statusOptions={STATUS_OPTIONS}
              onStatusChange={handleStatusChange}
              onViewDetails={setSelectedOrder}
            />

            <AdminOrdersTable
              orders={pageItems}
              savingId={savingId}
              statusOptions={STATUS_OPTIONS}
              onStatusChange={handleStatusChange}
              onViewDetails={setSelectedOrder}
            />
          </>
        )}

        {!loading && !error && filteredOrders.length > 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="font-ui text-[13px] text-black/70">
              Showing {Math.min(safePage * pageSize, totalItems)} of{" "}
              {totalItems}
            </p>

            <Pagination
              totalItems={totalItems}
              page={safePage}
              pageSize={pageSize}
              onPageChange={setPage}
              siblingCount={1}
            />
          </div>
        ) : null}

        {selectedOrder ? (
          <AdminOrderDetailsModal
            order={selectedOrder}
            statusOptions={STATUS_OPTIONS}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChange}
            onSelectedOrderChange={setSelectedOrder}
          />
        ) : null}
      </main>

      <FullWidthDivider />
    </>
  );
}
