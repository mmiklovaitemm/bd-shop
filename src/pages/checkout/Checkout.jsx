import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import useCart from "@/store/useCart";
import {
  getEmailFromLocalStorage,
  calcLineTotal as calcLineTotalUtil,
  calcSubtotal,
  SHIPPING_KIT_FEE_DEFAULT,
} from "@/utils/checkout";

import OrderSummary from "./components/OrderSummary";
import ContactSection from "./components/ContactSection";
import DeliveryToggle from "./components/DeliveryToggle";
import ShippingForm from "./components/ShippingForm";
import ShippingMethodSelector from "./components/ShippingMethodSelector";
import PaymentSection from "./components/PaymentSection";

import FullWidthDivider from "@/components/ui/FullWidthDivider";

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);

  // refs for scroll-to-error
  const emailRef = useRef(null);

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const addressRef = useRef(null);
  const cityRef = useRef(null);
  const postalCodeRef = useRef(null);
  const phoneRef = useRef(null);

  const cardNumberRef = useRef(null);
  const cardDateRef = useRef(null);
  const cardCvcRef = useRef(null);
  const cardNameRef = useRef(null);

  const subtotal = useMemo(() => {
    return calcSubtotal(items, SHIPPING_KIT_FEE_DEFAULT);
  }, [items]);

  const calcLineTotal = (item) =>
    calcLineTotalUtil(item, SHIPPING_KIT_FEE_DEFAULT);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // errors + submitting + status
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payStatus, setPayStatus] = useState("idle"); // "idle" | "success"

  const clearError = (key) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Contact
  const [email, setEmail] = useState(() => getEmailFromLocalStorage());

  // Delivery toggle
  const [deliveryType, setDeliveryType] = useState("ship"); // "ship" | "pickup"

  // Shipping method (LP vs Omniva)
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

  const validate = () => {
    const next = {};

    // Contact
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      next.email = "Enter a valid email.";
    }

    // Delivery: Ship
    if (deliveryType === "ship") {
      if (!firstName.trim()) next.firstName = "First name is required.";
      if (!lastName.trim()) next.lastName = "Last name is required.";
      if (!address.trim()) next.address = "Address is required.";
      if (!city.trim()) next.city = "City is required.";
      if (!postalCode.trim()) next.postalCode = "Postal code is required.";
      if (!phone.trim()) next.phone = "Phone is required.";
    }

    // Payment
    if (paymentType === "card") {
      const digits = (s) => String(s || "").replace(/\D/g, "");

      if (digits(cardNumber).length < 12)
        next.cardNumber = "Invalid card number.";
      if (!/^\d{2}\/\d{2}$/.test(cardDate)) next.cardDate = "Use MM/YY.";
      if (digits(cardCvc).length < 3) next.cardCvc = "Invalid CVC.";
      if (!cardName.trim()) next.cardName = "Card owner name is required.";
    }

    setErrors(next);

    // scroll-to-first-error
    if (Object.keys(next).length > 0) {
      const order = [
        ["email", emailRef],

        ...(deliveryType === "ship"
          ? [
              ["firstName", firstNameRef],
              ["lastName", lastNameRef],
              ["address", addressRef],
              ["city", cityRef],
              ["postalCode", postalCodeRef],
              ["phone", phoneRef],
            ]
          : []),

        ...(paymentType === "card"
          ? [
              ["cardNumber", cardNumberRef],
              ["cardDate", cardDateRef],
              ["cardCvc", cardCvcRef],
              ["cardName", cardNameRef],
            ]
          : []),
      ];

      const first = order.find(([key]) => next[key]);
      const node = first?.[1]?.current;

      if (node && typeof node.focus === "function") {
        node.focus();
        node.scrollIntoView?.({ behavior: "smooth", block: "center" });
      }
    }

    return Object.keys(next).length === 0;
  };

  const handlePay = (e) => {
    e.preventDefault();

    if (payStatus === "success") return;

    const ok = validate();
    if (!ok) return;

    setIsSubmitting(true);

    // demo submit
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/thank-you");
    }, 800);
  };

  return (
    <>
      <main className="px-0 md:px-2 lg:px-4 py-6">
        <div className="mx-auto w-full max-w-[980px] grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
          {/* LEFT */}
          <section className="w-full max-w-[420px] mx-auto md:mx-0 md:max-w-none md:w-full bg-white md:border md:border-black lg:border lg:border-black">
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
              {/* Success message */}
              {payStatus === "success" ? (
                <div className="border border-black bg-black/5 px-4 py-4">
                  <p className="font-ui text-sm font-semibold">
                    Payment successful
                  </p>

                  <button
                    type="button"
                    className="mt-4 h-12 w-full border border-black bg-white font-ui text-[14px]"
                    onClick={() => setPayStatus("idle")}
                  >
                    Back to checkout
                  </button>
                </div>
              ) : null}

              {/* Contact */}
              <ContactSection
                email={email}
                setEmail={setEmail}
                error={errors.email}
                clearError={clearError}
                emailRef={emailRef}
              />

              {/* Delivery information toggle */}
              <DeliveryToggle
                deliveryType={deliveryType}
                setDeliveryType={setDeliveryType}
              />

              {/* Ship flow */}
              {deliveryType === "ship" ? (
                <div>
                  <ShippingForm
                    country={country}
                    setCountry={setCountry}
                    firstName={firstName}
                    setFirstName={setFirstName}
                    lastName={lastName}
                    setLastName={setLastName}
                    address={address}
                    setAddress={setAddress}
                    apartment={apartment}
                    setApartment={setApartment}
                    city={city}
                    setCity={setCity}
                    postalCode={postalCode}
                    setPostalCode={setPostalCode}
                    phone={phone}
                    setPhone={setPhone}
                    errors={errors}
                    clearError={clearError}
                    firstNameRef={firstNameRef}
                    lastNameRef={lastNameRef}
                    addressRef={addressRef}
                    cityRef={cityRef}
                    postalCodeRef={postalCodeRef}
                    phoneRef={phoneRef}
                  />

                  <ShippingMethodSelector
                    shippingMethod={shippingMethod}
                    setShippingMethod={setShippingMethod}
                  />
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
              <PaymentSection
                paymentType={paymentType}
                setPaymentType={setPaymentType}
                cardNumber={cardNumber}
                setCardNumber={setCardNumber}
                cardDate={cardDate}
                setCardDate={setCardDate}
                cardCvc={cardCvc}
                setCardCvc={setCardCvc}
                cardName={cardName}
                setCardName={setCardName}
                errors={errors}
                clearError={clearError}
                cardNumberRef={cardNumberRef}
                cardDateRef={cardDateRef}
                cardCvcRef={cardCvcRef}
                cardNameRef={cardNameRef}
              />

              <button
                type="submit"
                className="w-full h-14 bg-black text-white font-ui text-[14px] flex items-center justify-center disabled:opacity-50"
                disabled={
                  items.length === 0 || isSubmitting || payStatus === "success"
                }
              >
                {isSubmitting ? "Processing..." : "Pay now"}
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
