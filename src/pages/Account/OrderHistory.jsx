// src/pages/account/OrderHistory.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import FullWidthDivider from "@/components/ui/FullWidthDivider";
import backArrowIcon from "@/assets/ui/back-arrow.svg";
import OrderCard from "@/pages/account/OrderCard";
import AboutStudioSection from "@/components/ui/AboutStudioSection";
import OrderInfoPanel from "@/pages/account/OrderInfoPanel";

export default function OrderHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const isOrders = location.pathname === "/account/orders";
  const isProfile = location.pathname === "/account/profile";

  const [openOrderId, setOpenOrderId] = useState(null);

  // Vėliau čia bus fetch iš backend
  const orders = [
    {
      id: 1,
      date: "2025.12.16",
      status: "Completed",
      productName: "“Earth” ring",
      price: "$123.56",
      images: [
        "/products/rings/earth-ring-1.webp",
        "/products/rings/earth-ring-2.webp",
      ],
      orderNo: "56-767-hgeww3-fbg",
      info: {
        orderDate: "2025.10.23",
        orderNo: "56-767-hgeww3-fbg",
        pickup: "Omniva / In store",
        deliveryTo: {
          name: "Kamilė Augytė",
          street: "Pavilnionių g. 55,",
          zipCity: "99041 Vilniaus apskr.",
        },
        billingAddress: {
          name: "Kamilė Augytė",
          street: "Pavilnionių g. 55,",
          zipCity: "99041 Vilniaus apskr.",
        },
        deliveryPrice: "$4,99",
        orderValue: "$265,79",
        total: "$278,00",
      },
    },
  ];

  return (
    <>
      <main className="px-2 pt-3">
        <section className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="font-display text-4xl leading-none">
              Order history
            </h1>

            {/* Tablet buttons */}
            <div className="hidden md:flex items-center gap-4 font-ui text-sm">
              <button
                type="button"
                onClick={() => navigate("/account/orders")}
                className={`px-6 py-3 border border-black ${
                  isOrders ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                Order history
              </button>

              <button
                type="button"
                onClick={() => navigate("/account/profile")}
                className={`px-6 py-3 border border-black ${
                  isProfile ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  navigate("/login");
                }}
                className="px-6 py-3 border border-black bg-white text-black"
              >
                Log out
              </button>
            </div>
          </div>

          <FullWidthDivider className="my-4" />

          <button
            type="button"
            onClick={() => navigate("/account")}
            className="inline-flex items-center gap-2 text-sm font-ui"
          >
            <img src={backArrowIcon} alt="" className="h-3 w-3" />
            <span>Back</span>
          </button>

          <FullWidthDivider className="mt-4" />

          <div>
            {orders.map((order) => {
              const isOpen = openOrderId === order.id;

              return (
                <div key={order.id}>
                  {/* Panelė atsiranda VIRŠ paspausto orderio */}
                  {isOpen && (
                    <>
                      <OrderInfoPanel info={order.info} />

                      {/* Divideris PO info panelės – tik tablet view */}
                      <FullWidthDivider className="hidden md:block" />
                    </>
                  )}

                  <OrderCard
                    order={order}
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
        </section>
      </main>

      <AboutStudioSection />
    </>
  );
}
