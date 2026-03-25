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
                className={`border border-black px-6 py-3 ${
                  isOrders ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {t.orderHistory}
              </button>

              <button
                type="button"
                onClick={() => navigate("/account/profile")}
                className={`border border-black px-6 py-3 ${
                  isProfile ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {t.profile}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="border border-black bg-white px-6 py-3 text-black"
              >
                {t.logOut}
              </button>
            </div>
          </div>

          <FullWidthDivider className="my-4" />

          <button
            type="button"
            onClick={() => navigate("/account")}
            className="inline-flex items-center gap-2 text-sm font-ui"
          >
            <img
              src={backArrowIcon}
              alt=""
              width={12}
              height={12}
              className="h-3 w-3"
            />
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
                    existing.price = `€${(
                      (Number(existing.price.replace("€", "")) * 100 +
                        Number(it.price_cents || 0) *
                          Number(it.quantity || 1)) /
                      100
                    ).toFixed(2)}`;
                  } else {
                    acc[key] = {
                      name: it.product_name || t.product.label,
                      quantity: Number(it.quantity || 1),
                      color: it.color || t.notAvailable,
                      service:
                        it.service_option === "shipping"
                          ? t.shippingKit
                          : it.service_option === "in_store"
                            ? t.inStore
                            : null,
                      price: `€${(
                        (Number(it.price_cents || 0) *
                          Number(it.quantity || 1)) /
                        100
                      ).toFixed(2)}`,
                    };
                  }

                  return acc;
                }, {});

                const productLines = Object.values(groupedItems);

                const totalCentsFromItems = (order.items || []).reduce(
                  (sum, it) => {
                    const pc = Number(it.price_cents || 0);
                    const q = Number(it.quantity || 1);
                    return sum + pc * q;
                  },
                  0,
                );

                const priceText = `€${(totalCentsFromItems / 100).toFixed(2)}`;

                const uniqueItems = (order.items || []).filter(
                  (it, index, arr) =>
                    arr.findIndex(
                      (x) =>
                        String(x.product_id) === String(it.product_id) &&
                        String(x.color || "") === String(it.color || ""),
                    ) === index,
                );

                let images = [];

                if (uniqueItems.length === 1) {
                  const onlyItem = uniqueItems[0];
                  const productId = String(onlyItem?.product_id || "");
                  const product = productId ? productsById[productId] : null;

                  const pickedColor = String(onlyItem?.color || "")
                    .trim()
                    .toLowerCase();

                  const variantImages =
                    product?.variants?.[pickedColor] ||
                    product?.variants?.silver ||
                    product?.variants?.gold ||
                    [];

                  images = variantImages.slice(0, 2);
                } else {
                  images = uniqueItems
                    .slice(0, 2)
                    .map((it) => it.image_url)
                    .filter(Boolean);
                }

                return (
                  <div key={order.id}>
                    {isOpen ? (
                      <>
                        <OrderInfoPanel
                          info={(() => {
                            const orderDate = new Date(order.created_at)
                              .toISOString()
                              .slice(0, 10);
                            const orderNo = String(order.id);

                            const itemsTotalCents = (order.items || []).reduce(
                              (sum, it) => {
                                const pc = Number(it?.price_cents || 0);
                                const q = Number(it?.quantity || 1);
                                return sum + pc * q;
                              },
                              0,
                            );

                            const totalCents = Number(order?.total_cents || 0);

                            const deliveryCentsFallback = Math.max(
                              0,
                              totalCents - itemsTotalCents,
                            );

                            const money = (cents) =>
                              `€${(Number(cents || 0) / 100).toFixed(2)}`;

                            const deliveryType = String(
                              order?.delivery_type || "",
                            ).trim();

                            const deliveryFeeCentsReal = Number.isFinite(
                              Number(order?.delivery_fee_cents),
                            )
                              ? Number(order.delivery_fee_cents)
                              : deliveryCentsFallback;

                            const pickupValue =
                              deliveryType === "pickup"
                                ? t.pickup
                                : t.notAvailable;

                            const fullName =
                              [order?.ship_first_name, order?.ship_last_name]
                                .filter(Boolean)
                                .join(" ") || t.notAvailable;

                            const streetLine =
                              [order?.ship_address, order?.ship_apartment]
                                .filter(Boolean)
                                .join(", ") || t.notAvailable;

                            const zipCityLine =
                              [order?.ship_postal_code, order?.ship_city]
                                .filter(Boolean)
                                .join(" ") || t.notAvailable;

                            const deliveryTo =
                              deliveryType === "ship"
                                ? {
                                    name: fullName,
                                    street: streetLine,
                                    zipCity: zipCityLine,
                                  }
                                : {
                                    name: t.notAvailable,
                                    street: t.notAvailable,
                                    zipCity: t.notAvailable,
                                  };

                            const billingAddress = deliveryTo;

                            return {
                              orderDate,
                              orderNo,
                              pickup: pickupValue,
                              deliveryTo,
                              billingAddress,
                              deliveryMethod:
                                order?.delivery_type === "ship"
                                  ? order?.delivery_method === "omniva"
                                    ? t.omniva
                                    : order?.delivery_method === "lp"
                                      ? t.lpExpress
                                      : t.notAvailable
                                  : t.pickup,
                              deliveryPrice:
                                deliveryType === "ship"
                                  ? money(deliveryFeeCentsReal)
                                  : money(0),
                              orderValue: money(itemsTotalCents),
                              total: money(totalCents),
                              productLines,
                            };
                          })()}
                        />

                        <FullWidthDivider className="hidden md:block" />
                      </>
                    ) : null}

                    <OrderCard
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
                        info: null,
                      }}
                      onOpen={() =>
                        setOpenOrderId((prev) =>
                          prev === order.id ? null : order.id,
                        )
                      }
                    />
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
