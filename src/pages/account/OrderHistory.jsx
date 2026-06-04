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

const getCleanUrl = (rawPath) => {
  if (!rawPath || typeof rawPath !== "string") return "";
  const VERCEL_FRONTEND = "https://bd-shop-gray.vercel.app";
  const RENDER_BACKEND = "https://bd-shop-gfva.onrender.com";

  if (rawPath.startsWith("https://") && rawPath.includes("vercel.app"))
    return rawPath;

  let cleanPath = rawPath.replace(/http:\/\/localhost:\d+/, "");
  const purePath = cleanPath.replace(/^\/+/, "");

  if (purePath.includes("uploads/")) return `${RENDER_BACKEND}/${purePath}`;
  if (purePath.startsWith("products/") || purePath.startsWith("assets/"))
    return `${VERCEL_FRONTEND}/${purePath}`;

  const fileName = purePath.split(/[\\/]/).pop();
  return `${VERCEL_FRONTEND}/products/rings/${fileName}`;
};

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
    // Load orders from localStorage (demo mode)
    try {
      const stored = JSON.parse(localStorage.getItem("demo_orders") || "[]");
      setOrders(stored);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

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
                onClick={() => navigate("/account/orders")}
                className={`border border-black px-6 py-3 transition-colors ${isOrders ? "bg-black text-white" : "bg-white text-black"}`}
              >
                {t.orderHistory}
              </button>
              <button
                onClick={() => navigate("/account/profile")}
                className={`border border-black px-6 py-3 transition-colors ${isProfile ? "bg-black text-white" : "bg-white text-black"}`}
              >
                {t.profile}
              </button>
              <button
                onClick={handleLogout}
                className="border border-black bg-white px-6 py-3 text-black"
              >
                {t.logOut}
              </button>
            </div>
          </div>
          <FullWidthDivider className="my-4" />
          <button
            onClick={() => navigate("/account")}
            className="inline-flex items-center gap-2 text-sm font-ui"
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
          ) : (
            <div>
              {orders.map((order) => {
                const isOpen = openOrderId === order.id;

                const groupedItems = (order.items || []).reduce((acc, it) => {
                  if (!it) return acc;
                  const productId = it.product_id || "unknown";
                  const key = `${productId}|${it.color || ""}|${it.size || ""}`;
                  if (acc[key]) {
                    acc[key].quantity += Number(it.quantity || 1);
                  } else {
                    acc[key] = {
                      product_id: productId,
                      name: it.product_name || t.product?.label || "Product",
                      quantity: Number(it.quantity || 1),
                      color: it.color || "",
                      size: it.size || "one size",
                      image_url: it.image_url,
                    };
                  }
                  return acc;
                }, {});

                const productLines = Object.values(groupedItems);
                const totalCentsFromItems = (order.items || []).reduce(
                  (sum, it) =>
                    sum +
                    Number(it?.price_cents || 0) * Number(it?.quantity || 1),
                  0,
                );
                const priceText = `€${(totalCentsFromItems / 100).toFixed(2)}`;

                let rawImages = [];
                if (productLines.length === 1) {
                  const line = productLines[0];
                  const product = productsById?.[line.product_id];
                  let galleryImages = [];
                  if (product && line.color) {
                    const colorKey = String(line.color).toLowerCase().trim();
                    galleryImages =
                      product.variants?.[colorKey]?.[0]?.images || [];
                  }

                  if (galleryImages.length >= 2) {
                    rawImages = [galleryImages[0], galleryImages[1]];
                  } else if (galleryImages.length === 1) {
                    rawImages = [galleryImages[0], galleryImages[0]];
                  } else {
                    rawImages = [line.image_url, line.image_url].filter(
                      Boolean,
                    );
                  }
                } else {
                  rawImages = productLines
                    .slice(0, 2)
                    .map((line) => {
                      const product = productsById?.[line.product_id];
                      if (product && line.color) {
                        const colorKey = String(line.color)
                          .toLowerCase()
                          .trim();
                        const variantImages =
                          product.variants?.[colorKey]?.[0]?.images;
                        if (Array.isArray(variantImages) && variantImages[0])
                          return variantImages[0];
                      }
                      return line.image_url;
                    })
                    .filter(Boolean);
                }

                const cleanedImages = rawImages.map((img) => getCleanUrl(img));

                return (
                  <div
                    key={order.id}
                    className="border-b border-black/10 last:border-none"
                  >
                    <OrderCard
                      isOpen={isOpen}
                      order={{
                        id: order.id,
                        date: order.created_at
                          ? new Date(order.created_at)
                              .toISOString()
                              .slice(0, 10)
                          : "",
                        status: order.status || "Pending",
                        productLines,
                        price: priceText,
                        images: cleanedImages,
                        orderNo: String(order.id),
                      }}
                      onOpen={() => setOpenOrderId(isOpen ? null : order.id)}
                    />
                    {isOpen && (
                      <div className="bg-neutral-50 px-2 pb-6">
                        <OrderInfoPanel
                          info={(() => {
                            const totalCents = Number(order?.total_cents || 0);
                            const money = (c) =>
                              `€${(Number(c || 0) / 100).toFixed(2)}`;

                            const isPickup = order?.delivery_type === "pickup";
                            const pickupMethod = String(order?.delivery_method || "").toLowerCase();

                            // Salon pickup addresses
                            const SALON_INFO = {
                              vilnius: {
                                name: t.checkoutPage?.pickupLocations?.vilnius || "Vilnius salon",
                                street: t.checkoutPage?.pickupAddresses?.vilnius || "Kauno str. 24",
                                zipCity: "Vilnius, Lietuva",
                              },
                              kaunas: {
                                name: t.checkoutPage?.pickupLocations?.kaunas || "Kaunas salon",
                                street: t.checkoutPage?.pickupAddresses?.kaunas || "Žemaičių str. 24",
                                zipCity: "Kaunas, Lietuva",
                              },
                            };

                            const salonInfo = isPickup
                              ? SALON_INFO[pickupMethod] || {
                                  name: order?.delivery_method || t.pickup,
                                  street: "",
                                  zipCity: "",
                                }
                              : null;

                            const shippingAddress = {
                              name: [order?.ship_first_name, order?.ship_last_name]
                                .filter(Boolean)
                                .join(" ") || "",
                              street: [order?.ship_address, order?.ship_apartment]
                                .filter(Boolean)
                                .join(", ") || "",
                              zipCity: [order?.ship_postal_code, order?.ship_city]
                                .filter(Boolean)
                                .join(" ") || "",
                            };

                            // Carrier label
                            const carrierLabel = isPickup
                              ? `${t.pickup} — ${salonInfo?.name}`
                              : pickupMethod === "omniva"
                              ? t.omniva
                              : pickupMethod === "lp_express" || pickupMethod === "lpexpress"
                              ? t.lpExpress
                              : order?.delivery_method || "—";

                            return {
                              orderDate: order.created_at
                                ? new Date(order.created_at)
                                    .toISOString()
                                    .slice(0, 10)
                                : "",
                              orderNo: String(order.id),
                              isPickup,
                              pickup: isPickup ? salonInfo?.name : "—",
                              deliveryTo: isPickup ? salonInfo : shippingAddress,
                              billingAddress: isPickup ? salonInfo : shippingAddress,
                              deliveryMethod: carrierLabel,
                              deliveryPrice: money(totalCents - totalCentsFromItems),
                              orderValue: money(totalCentsFromItems),
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
