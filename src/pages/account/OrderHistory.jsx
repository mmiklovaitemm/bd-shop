// src/pages/account/OrderHistory.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import backArrowIcon from "@/assets/ui/back-arrow.svg";
import OrderCard from "@/pages/account/OrderCard";
import AboutStudioSection from "@/components/ui/AboutStudioSection";
import OrderInfoPanel from "@/pages/account/OrderInfoPanel";

import useAuth from "@/store/useAuth";
import { apiGet } from "@/lib/api";

export default function OrderHistory() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isOrders = location.pathname === "/account/orders";
  const isProfile = location.pathname === "/account/profile";

  const getOrders = useAuth((s) => s.getOrders);
  const logout = useAuth((s) => s.logout);

  const [openOrderId, setOpenOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");
  const [productsById, setProductsById] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError("");
        setLoadingOrders(true);
        const data = await getOrders();
        if (!alive) return;
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || t.failedToLoadOrders);
        setOrders([]);
      } finally {
        if (alive) setLoadingOrders(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [getOrders, t.failedToLoadOrders]);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const data = await apiGet("/api/products", { signal: ctrl.signal });
        const list = Array.isArray(data) ? data : data?.products;
        const map = Object.fromEntries((list || []).map((p) => [p.id, p]));
        setProductsById(map);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProductsById({});
      }
    })();
    return () => ctrl.abort();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <main className="px-2 pt-3">
        <section className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="font-display text-4xl leading-none">
              {t.orderHistory}
            </h1>

            <div className="hidden items-center gap-4 font-ui text-sm md:flex">
              <button
                type="button"
                onClick={() => navigate("/account/orders")}
                className={`border border-black px-6 py-3 transition-colors ${
                  isOrders
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-neutral-50"
                }`}
              >
                {t.orderHistory}
              </button>
              <button
                type="button"
                onClick={() => navigate("/account/profile")}
                className={`border border-black px-6 py-3 transition-colors ${
                  isProfile
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-neutral-50"
                }`}
              >
                {t.profile}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="border border-black bg-white px-6 py-3 text-black hover:bg-neutral-50 transition-colors"
              >
                {t.logOut}
              </button>
            </div>
          </div>

          <FullWidthDivider className="my-4" />

          <button
            type="button"
            onClick={() => navigate("/account")}
            className="inline-flex items-center gap-2 text-sm font-ui hover:opacity-70 transition-opacity"
          >
            <img src={backArrowIcon} alt="" className="h-3 w-3" />
            <span>{t.back}</span>
          </button>

          <FullWidthDivider className="mt-4" />

          {loadingOrders ? (
            <div className="py-8 font-ui text-sm text-black/60">
              {t.loadingOrders}
            </div>
          ) : error ? (
            <div className="my-6 border border-red-600 bg-red-50 px-4 py-3 font-ui text-sm text-red-700">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-10 font-ui text-sm text-black/60">
              {t.noOrdersYet}
            </div>
          ) : (
            <div>
              {orders.map((order) => {
                const isOpen = openOrderId === order.id;

                const groupedItems = (order.items || []).reduce((acc, it) => {
                  const key = `${it.product_id}|${it.color || ""}|${it.size || ""}`;
                  const existing = acc[key];
                  if (existing) {
                    existing.quantity += Number(it.quantity || 1);
                  } else {
                    acc[key] = {
                      product_id: it.product_id,
                      name: it.product_name || t.product.label,
                      quantity: Number(it.quantity || 1),
                      color: it.color || t.notAvailable,
                    };
                  }
                  return acc;
                }, {});

                const productLines = Object.values(groupedItems);
                const totalCentsFromItems = (order.items || []).reduce(
                  (sum, it) =>
                    sum +
                    Number(it.price_cents || 0) * Number(it.quantity || 1),
                  0,
                );
                const priceText = `€${(totalCentsFromItems / 100).toFixed(2)}`;

                const images = productLines
                  .slice(0, 2)
                  .map((line) => {
                    const product = productsById[line.product_id];
                    if (product && line.color) {
                      const colorKey = String(line.color).toLowerCase().trim();
                      const variantImages =
                        product.variants?.[colorKey]?.[0]?.images;
                      if (Array.isArray(variantImages) && variantImages[0]) {
                        return variantImages[0];
                      }
                    }
                    const originalItem = (order.items || []).find(
                      (it) => it.product_id === line.product_id,
                    );
                    return originalItem?.image_url;
                  })
                  .filter(Boolean);

                return (
                  <div
                    key={order.id}
                    className="border-b border-black/10 last:border-none"
                  >
                    <OrderCard
                      isOpen={isOpen}
                      order={{
                        id: order.id,
                        date: new Date(order.created_at)
                          .toISOString()
                          .slice(0, 10),
                        status: order.status || "Pending",
                        productLines,
                        price: priceText,
                        images,
                        orderNo: String(order.id),
                      }}
                      onOpen={() => setOpenOrderId(isOpen ? null : order.id)}
                    />

                    {isOpen && (
                      <div className="bg-neutral-50 px-2 pb-6">
                        <OrderInfoPanel
                          info={(() => {
                            const itemsTotalCents = totalCentsFromItems;
                            const totalCents = Number(order?.total_cents || 0);
                            const money = (c) =>
                              `€${(Number(c || 0) / 100).toFixed(2)}`;

                            return {
                              orderDate: new Date(order.created_at)
                                .toISOString()
                                .slice(0, 10),
                              orderNo: String(order.id),
                              pickup:
                                order?.delivery_type === "pickup"
                                  ? order?.delivery_method || t.pickup
                                  : t.notAvailable,
                              deliveryTo: {
                                name:
                                  [
                                    order?.ship_first_name,
                                    order?.ship_last_name,
                                  ]
                                    .filter(Boolean)
                                    .join(" ") || t.notAvailable,
                                street:
                                  [order?.ship_address, order?.ship_apartment]
                                    .filter(Boolean)
                                    .join(", ") || t.notAvailable,
                                zipCity:
                                  [order?.ship_postal_code, order?.ship_city]
                                    .filter(Boolean)
                                    .join(" ") || t.notAvailable,
                              },
                              deliveryMethod:
                                order?.delivery_method || t.notAvailable,
                              deliveryPrice: money(
                                totalCents - itemsTotalCents,
                              ),
                              orderValue: money(itemsTotalCents),
                              total: money(totalCents),
                              productLines,
                            };
                          })()}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <AboutStudioSection />
    </>
  );
}
