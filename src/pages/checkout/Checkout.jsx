import { useMemo, useState } from "react";
import useCart from "@/store/useCart";

import deliveryIcon from "@/assets/ui/delivery.svg";
import pickupIcon from "@/assets/ui/pick-up-icon.svg";

// Payment logos (individual)
import visaIcon from "@/assets/ui/VISA-icon.svg";
import mastercardIcon from "@/assets/ui/mastercard-icon.svg";
import maestroIcon from "@/assets/ui/maestro-icon.svg";
import googlePayIcon from "@/assets/ui/google-pay-icon.svg";
import applePayIcon from "@/assets/ui/apple-pay-icon.svg";

import swedbankIcon from "@/assets/ui/swedbank-icon.svg";
import sebIcon from "@/assets/ui/seb-icon.svg";
import luminorIcon from "@/assets/ui/Luminor-icon.svg";
import revolutIcon from "@/assets/ui/Revolut-icon.svg";
import FullWidthDivider from "@/components/ui/FullWidthDivider";

const fmtPrice = (n) =>
  new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

const getEmailFromLocalStorage = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const user = JSON.parse(raw);
    return user?.email || "";
  } catch {
    return "";
  }
};

// ✅ move component OUTSIDE render
function OrderSummary({
  variant = "mobile",
  items,
  subtotal,
  isOpen,
  onToggle,
  calcLineTotal,
}) {
  const isMobile = variant === "mobile";

  return (
    <aside
      className={[
        "bg-white border border-black/40",
        isMobile ? "" : "sticky top-6 self-start",
      ].join(" ")}
    >
      {/* Mobile only: Order summary bar */}
      {isMobile ? (
        <button
          type="button"
          onClick={onToggle}
          className="w-full h-12 px-4 bg-black text-white flex items-center justify-between"
        >
          <span className="font-ui text-sm">Order summary</span>

          <div className="flex items-center gap-3">
            <span className="font-ui text-sm">{fmtPrice(subtotal)}</span>

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className={[
                "transition-transform duration-200",
                isOpen ? "rotate-180" : "rotate-0",
              ].join(" ")}
              aria-hidden="true"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
      ) : (
        <div className="px-4 py-4 border-b border-black/20">
          <div className="flex items-center justify-between">
            <p className="font-ui text-sm font-semibold">Order summary</p>
            <p className="font-ui text-sm font-semibold">
              {fmtPrice(subtotal)}
            </p>
          </div>
        </div>
      )}

      {/* Summary content */}
      {isMobile && !isOpen ? null : (
        <div
          className={[
            "px-4 py-4",
            isMobile ? "border-b border-black/20" : "",
          ].join(" ")}
        >
          {items.length === 0 ? (
            <p className="font-ui text-sm text-black/60">Your bag is empty.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.key} className="grid grid-cols-[64px_1fr] gap-4">
                  <div className="w-16 h-20 bg-black/5 overflow-hidden border border-black/10">
                    <img
                      src={item.image}
                      alt={item.name || ""}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-display text-[18px] leading-tight">
                        {item.name}
                      </p>
                      <p className="font-ui text-[14px] whitespace-nowrap">
                        {fmtPrice(calcLineTotal(item))}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="bg-black/5 px-3 py-2 font-ui text-[12px] text-black/70">
                        Color:{" "}
                        <span className="font-semibold">
                          {item.color || "—"}
                        </span>
                      </span>

                      <span className="bg-black/5 px-3 py-2 font-ui text-[12px] text-black/70">
                        Size:{" "}
                        <span className="font-semibold">
                          {item.size || "One size"}
                        </span>
                      </span>

                      <span className="bg-black/5 px-3 py-2 font-ui text-[12px] text-black/70">
                        Qnty.:{" "}
                        <span className="font-semibold">
                          {item.quantity || 1}
                        </span>
                      </span>
                    </div>

                    {item?.category === "personal" &&
                    String(item?.serviceOption || "")
                      .toLowerCase()
                      .includes("shipping") ? (
                      <p className="mt-2 font-ui text-[12px] text-black/50">
                        Shipping kit + {fmtPrice(15)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}

              <div className="pt-2 flex items-center justify-between border-t border-black/20">
                <p className="font-ui text-sm text-black/60">Total</p>
                <p className="font-ui text-sm font-semibold">
                  {fmtPrice(subtotal)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

export default function Checkout() {
  const items = useCart((s) => s.items);

  const SHIPPING_KIT_FEE = 15;

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const base = Number(item.price) || 0;
      const qty = item.quantity || 1;

      const isShippingKit =
        item?.serviceOption === "shipping-kit" ||
        item?.serviceOption === "shipping_kit" ||
        String(item?.serviceOption || "")
          .toLowerCase()
          .includes("shipping");

      const fee =
        item?.category === "personal" && isShippingKit ? SHIPPING_KIT_FEE : 0;

      return sum + (base + fee) * qty;
    }, 0);
  }, [items]);

  const calcLineTotal = (item) => {
    const base = Number(item.price) || 0;
    const qty = item.quantity || 1;

    const isShippingKit =
      item?.serviceOption === "shipping-kit" ||
      item?.serviceOption === "shipping_kit" ||
      String(item?.serviceOption || "")
        .toLowerCase()
        .includes("shipping");

    const fee =
      item?.category === "personal" && isShippingKit ? SHIPPING_KIT_FEE : 0;

    return (base + fee) * qty;
  };

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Contact
  const [email, setEmail] = useState(getEmailFromLocalStorage());

  // Delivery toggle
  const [deliveryType, setDeliveryType] = useState("ship"); // "ship" | "pickup"

  // Shipping method (Ship only)
  const [shippingMethod, setShippingMethod] = useState("lp"); // "lp" | "omniva"

  // Ship form fields
  const [country, setCountry] = useState("Lithuania");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");

  // Payment
  const [paymentType, setPaymentType] = useState("card"); // "card" | "bank"
  const [cardNumber, setCardNumber] = useState("");
  const [cardDate, setCardDate] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  const handlePay = (e) => {
    e.preventDefault();
    // TODO: vėliau validacijos + payment integracija
  };

  return (
    <>
      <main className="px-2 py-6">
        <div className="mx-auto w-full max-w-[980px] grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
          {/* LEFT */}
          <section className="w-full max-w-[420px] mx-auto md:mx-0 md:max-w-none md:w-full bg-white border border-black/40">
            {/* Mobile summary at top */}
            <div className="md:hidden">
              <OrderSummary
                variant="mobile"
                items={items}
                subtotal={subtotal}
                isOpen={isSummaryOpen}
                onToggle={() => setIsSummaryOpen((v) => !v)}
                calcLineTotal={calcLineTotal}
              />
            </div>

            <form onSubmit={handlePay} className="px-4 py-6 space-y-8">
              {/* Contact */}
              <div>
                <p className="font-ui text-sm font-semibold">Contact</p>

                <div className="mt-4 space-y-2">
                  <label className="block font-ui text-[12px] text-black/70">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-black bg-white px-4 py-4 font-ui text-[14px] outline-none"
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Delivery information toggle */}
              <div>
                <p className="font-ui text-sm font-semibold">
                  Delivery information
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("ship")}
                    className={[
                      "h-12 border border-black font-ui text-[14px] flex items-center justify-center gap-2",
                      deliveryType === "ship"
                        ? "bg-black text-white"
                        : "bg-white text-black",
                    ].join(" ")}
                  >
                    <img
                      src={deliveryIcon}
                      alt=""
                      className={[
                        "h-4 w-4",
                        deliveryType === "ship" ? "brightness-0 invert" : "",
                      ].join(" ")}
                    />
                    <span>Ship</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType("pickup")}
                    className={[
                      "h-12 border border-black font-ui text-[14px] flex items-center justify-center gap-2",
                      deliveryType === "pickup"
                        ? "bg-black text-white"
                        : "bg-white text-black",
                    ].join(" ")}
                  >
                    <img
                      src={pickupIcon}
                      alt=""
                      className={[
                        "h-4 w-4",
                        deliveryType === "pickup" ? "brightness-0 invert" : "",
                      ].join(" ")}
                    />
                    <span>Pickup</span>
                  </button>
                </div>
              </div>

              {/* Ship flow */}
              {deliveryType === "ship" ? (
                <div>
                  <p className="font-ui text-[12px] text-black/50 mb-4">
                    Contact
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-ui text-[12px] text-black/70">
                        Country/Region
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="mt-2 w-full border border-black px-4 py-4 font-ui text-[14px] outline-none bg-white"
                      >
                        <option value="Lithuania">Lithuania</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-ui text-[12px] text-black/70">
                          First name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="mt-2 w-full border border-black px-4 py-4 font-ui text-[14px] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-ui text-[12px] text-black/70">
                          Last name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="mt-2 w-full border border-black px-4 py-4 font-ui text-[14px] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-ui text-[12px] text-black/70">
                          Address
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="mt-2 w-full border border-black px-4 py-4 font-ui text-[14px] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-ui text-[12px] text-black/70">
                          Apartment, suite, etc. (optional)
                        </label>
                        <input
                          type="text"
                          value={apartment}
                          onChange={(e) => setApartment(e.target.value)}
                          className="mt-2 w-full border border-black px-4 py-4 font-ui text-[14px] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-ui text-[12px] text-black/70">
                          City
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="mt-2 w-full border border-black px-4 py-4 font-ui text-[14px] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-ui text-[12px] text-black/70">
                          Postal code
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="mt-2 w-full border border-black px-4 py-4 font-ui text-[14px] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-ui text-[12px] text-black/70">
                        Phone number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-2 w-full border border-black px-4 py-4 font-ui text-[14px] outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="font-ui text-sm font-semibold">
                      Choose delivery method
                    </p>

                    <div className="mt-4 space-y-3">
                      <button
                        type="button"
                        onClick={() => setShippingMethod("lp")}
                        className={[
                          "w-full border border-black px-4 py-4 flex items-center justify-between gap-4",
                          shippingMethod === "lp"
                            ? "bg-black text-white"
                            : "bg-white text-black",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={[
                              "h-4 w-4 rounded-full border flex items-center justify-center",
                              shippingMethod === "lp"
                                ? "border-white"
                                : "border-black",
                            ].join(" ")}
                            aria-hidden="true"
                          >
                            {shippingMethod === "lp" ? (
                              <span className="h-2 w-2 rounded-full bg-white" />
                            ) : null}
                          </span>

                          <div className="text-left leading-tight">
                            <p className="font-ui text-[13px]">
                              LP EXPRESS delivery to home
                            </p>
                          </div>
                        </div>

                        <p className="font-ui text-[13px] whitespace-nowrap">
                          €4,99
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShippingMethod("omniva")}
                        className={[
                          "w-full border border-black px-4 py-4 flex items-center justify-between gap-4",
                          shippingMethod === "omniva"
                            ? "bg-black text-white"
                            : "bg-white text-black",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={[
                              "h-4 w-4 rounded-full border flex items-center justify-center",
                              shippingMethod === "omniva"
                                ? "border-white"
                                : "border-black",
                            ].join(" ")}
                            aria-hidden="true"
                          >
                            {shippingMethod === "omniva" ? (
                              <span className="h-2 w-2 rounded-full bg-white" />
                            ) : null}
                          </span>

                          <div className="text-left leading-tight">
                            <p className="font-ui text-[13px]">
                              Omniva delivery to home
                            </p>
                          </div>
                        </div>

                        <p className="font-ui text-[13px] whitespace-nowrap">
                          €6,99
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {deliveryType === "pickup" ? (
                <div className="border border-black/20 bg-black/5 px-4 py-4">
                  <p className="font-ui text-sm text-black/60">
                    Pickup flow coming next steps.
                  </p>
                </div>
              ) : null}

              {/* Payment */}
              <div>
                <p className="font-ui text-sm font-semibold">Payment</p>

                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType("card")}
                    className={[
                      "w-full h-12 border border-black px-4",
                      "font-ui text-[14px] flex items-center justify-between gap-3",
                      paymentType === "card"
                        ? "bg-black text-white"
                        : "bg-white text-black",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          "h-4 w-4 rounded-full border flex items-center justify-center",
                          paymentType === "card"
                            ? "border-white"
                            : "border-black",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        {paymentType === "card" ? (
                          <span className="h-2 w-2 rounded-full bg-white" />
                        ) : null}
                      </span>
                      <span>Credit card</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0">
                      <img
                        src={visaIcon}
                        alt="Visa"
                        className={[
                          "h-[16px] w-auto",
                          paymentType === "card" ? "" : "brightness-0",
                        ].join(" ")}
                        draggable={false}
                      />
                      <img
                        src={mastercardIcon}
                        alt="Mastercard"
                        className="h-[16px] w-auto"
                        draggable={false}
                      />
                      <img
                        src={maestroIcon}
                        alt="Maestro"
                        className="h-[16px] w-auto"
                        draggable={false}
                      />
                      <img
                        src={googlePayIcon}
                        alt="Google Pay"
                        className={[
                          "h-[16px] w-auto",
                          paymentType === "card" ? "" : "brightness-0",
                        ].join(" ")}
                        draggable={false}
                      />
                      <img
                        src={applePayIcon}
                        alt="Apple Pay"
                        className={[
                          "h-[16px] w-auto",
                          paymentType === "card" ? "" : "brightness-0",
                        ].join(" ")}
                        draggable={false}
                      />
                    </div>
                  </button>

                  {paymentType === "card" ? (
                    <div className="border border-black p-4 space-y-4">
                      <div>
                        <label className="block font-ui text-[12px] text-black/70">
                          Card number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="mt-2 w-full border border-black px-4 py-4 font-ui text-[14px] outline-none"
                          placeholder="1234 1234 1234 1234"
                          inputMode="numeric"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-ui text-[12px] text-black/70">
                            Date
                          </label>
                          <input
                            type="text"
                            value={cardDate}
                            onChange={(e) => setCardDate(e.target.value)}
                            className="mt-2 w-full border border-black px-4 py-4 font-ui text-[14px] outline-none"
                            placeholder="MM/YY"
                            inputMode="numeric"
                          />
                        </div>

                        <div>
                          <label className="block font-ui text-[12px] text-black/70">
                            CVC
                          </label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="mt-2 w-full border border-black px-4 py-4 font-ui text-[14px] outline-none"
                            placeholder="CVC"
                            inputMode="numeric"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-ui text-[12px] text-black/70">
                          Card owner name, surname
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="mt-2 w-full border border-black px-4 py-4 font-ui text-[14px] outline-none"
                          placeholder="Full name"
                        />
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setPaymentType("bank")}
                    className={[
                      "w-full h-12 border border-black px-4",
                      "font-ui text-[14px] flex items-center justify-between gap-3",
                      paymentType === "bank"
                        ? "bg-black text-white"
                        : "bg-white text-black",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          "h-4 w-4 rounded-full border flex items-center justify-center",
                          paymentType === "bank"
                            ? "border-white"
                            : "border-black",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        {paymentType === "bank" ? (
                          <span className="h-2 w-2 rounded-full bg-white" />
                        ) : null}
                      </span>
                      <span>E. bank payment</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0 h-[20px]">
                      {/* Swedbank (paliekam originalų) */}
                      <img
                        src={swedbankIcon}
                        alt="Swedbank"
                        className="h-[14px] md:h-[16px] w-auto object-contain"
                        draggable={false}
                      />

                      {/* SEB */}
                      <img
                        src={sebIcon}
                        alt="SEB"
                        className={[
                          "h-[14px] md:h-[16px] w-auto object-contain",
                          paymentType === "bank" ? "brightness-0 invert" : "",
                        ].join(" ")}
                        draggable={false}
                      />

                      {/* Luminor */}
                      <img
                        src={luminorIcon}
                        alt="Luminor"
                        className={[
                          "h-[12px] md:h-[16px] w-auto object-contain",
                          paymentType === "bank" ? "brightness-0 invert" : "",
                        ].join(" ")}
                        draggable={false}
                      />

                      {/* Revolut */}
                      <img
                        src={revolutIcon}
                        alt="Revolut"
                        className={[
                          "h-[12px] md:h-[16px] w-auto object-contain",
                          paymentType === "bank" ? "brightness-0 invert" : "",
                        ].join(" ")}
                        draggable={false}
                      />
                    </div>
                  </button>

                  {paymentType === "bank" ? (
                    <div className="border border-black p-4">
                      <p className="font-ui text-sm text-black/60">
                        E-bank payment selection will be added next.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-14 bg-black text-white font-ui text-[14px] flex items-center justify-center disabled:opacity-50"
                disabled={items.length === 0}
              >
                Pay now
              </button>
            </form>
          </section>

          {/* RIGHT: Order summary always visible on tablet/desktop */}
          <div className="hidden md:block">
            <OrderSummary
              variant="desktop"
              items={items}
              subtotal={subtotal}
              isOpen={true}
              onToggle={() => {}}
              calcLineTotal={calcLineTotal}
            />
          </div>
        </div>
      </main>
      <FullWidthDivider />
    </>
  );
}
