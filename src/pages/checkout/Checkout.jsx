import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

import useLanguage from "@/context/useLanguage";
import useCart from "@/store/useCart";
import { getEmailFromLocalStorage } from "@/utils/checkout";

import OrderSummary from "./components/OrderSummary";
import ContactSection from "./components/ContactSection";
import DeliveryToggle from "./components/DeliveryToggle";
import ShippingForm from "./components/ShippingForm";
import ShippingMethodSelector from "./components/ShippingMethodSelector";
import PaymentSection from "./components/PaymentSection";
import PickupSection from "./components/PickupSection";

import FullWidthDivider from "@/components/ui/FullWidthDivider";
import { getStoredToken } from "@/store/useAuth";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const API_ORIGIN = "https://bd-shop-gfva.onrender.com";

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clearCart);

  const emailRef = useRef(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const addressRef = useRef(null);
  const cityRef = useRef(null);
  const postalCodeRef = useRef(null);
  const phoneRef = useRef(null);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [stripeCardError, setStripeCardError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payStatus, setPayStatus] = useState("idle");

  const [email, setEmail] = useState(() => getEmailFromLocalStorage());
  const [deliveryType, setDeliveryType] = useState("ship");
  const [shippingMethod, setShippingMethod] = useState("lp");
  const [pickupLocation, setPickupLocation] = useState("vilnius");

  const [country, setCountry] = useState("Lithuania");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");

  const [paymentType, setPaymentType] = useState("card");
  const [selectedBank, setSelectedBank] = useState("swedbank");

  const SHIPPING_KIT_FEE = 15;

  const clearError = (key) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const base = Number(item.price?.toString().replace("€", "")) || 0;
      const qty = Number(item.quantity || 1);
      const service = String(item.serviceOption || "").toLowerCase();
      const fee = service.includes("shipping") ? SHIPPING_KIT_FEE : 0;
      return sum + (base + fee) * qty;
    }, 0);
  }, [items]);

  const deliveryPrice = useMemo(() => {
    if (deliveryType !== "ship") return 0;
    return shippingMethod === "lp" ? 2 : 2.5;
  }, [deliveryType, shippingMethod]);

  const total = useMemo(
    () => subtotal + deliveryPrice,
    [subtotal, deliveryPrice],
  );

  const calcLineTotal = (item) => {
    const base = Number(item.price?.toString().replace("€", "")) || 0;
    const qty = Number(item.quantity || 1);
    const fee = String(item.serviceOption || "")
      .toLowerCase()
      .includes("shipping")
      ? SHIPPING_KIT_FEE
      : 0;
    return (base + fee) * qty;
  };

  const validate = () => {
    const next = {};

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) next.email = true;

    if (deliveryType === "ship") {
      if (!firstName.trim()) next.firstName = true;
      if (!lastName.trim()) next.lastName = true;
      if (!address.trim()) next.address = true;
      if (!city.trim()) next.city = true;
      if (!postalCode.trim()) next.postalCode = true;
      if (!phone.trim()) next.phone = true;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const getErrorMessage = (field) => {
    if (!errors[field]) return null;
    const errText = t?.checkoutPage?.errors || {};

    const fieldMapping = {
      email: errText.enterValidEmail,
      firstName: errText.firstNameRequired,
      lastName: errText.lastNameRequired,
      address: errText.addressRequired,
      city: errText.cityRequired,
      postalCode: errText.postalCodeRequired,
      phone: errText.phoneRequired,
    };

    return fieldMapping[field] || "Error";
  };

  const handlePay = async (e) => {
    if (e) e.preventDefault();
    if (payStatus === "success" || isSubmitting) return;

    const ok = validate();
    if (!ok) return;

    setIsSubmitting(true);
    setStripeCardError(null);

    // Demo mode: simulate order processing + save to localStorage
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const orderId = "DEMO-" + Date.now();
      const newOrder = {
        id: orderId,
        created_at: new Date().toISOString(),
        status: "Confirmed",
        total_cents: Math.round(total * 100),
        contact_email: email,
        delivery_type: deliveryType,
        delivery_method: deliveryType === "pickup" ? pickupLocation : shippingMethod,
        ship_first_name: firstName,
        ship_last_name: lastName,
        ship_address: address,
        ship_city: city,
        ship_postal_code: postalCode,
        items: items.map((it) => ({
          product_name: it.name,
          product_id: it.productId ?? it.id,
          color: it.color,
          size: it.size,
          quantity: it.quantity ?? 1,
          price_cents: Math.round(Number(String(it.price).replace(/[^0-9.]/g, "")) * 100),
          image_url: it.image,
        })),
      };

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem("demo_orders") || "[]");
      existing.unshift(newOrder);
      localStorage.setItem("demo_orders", JSON.stringify(existing));

      clearCart();
      setIsSubmitting(false);
      setPayStatus("success");

      navigate("/thank-you", {
        state: {
          orderId,
          deliveryType,
          pickupLocation: deliveryType === "pickup" ? pickupLocation : null,
          email,
        },
        replace: true,
      });
    } catch (err) {
      setIsSubmitting(false);
      setErrors((prev) => ({ ...prev, submit: err?.message || "Checkout failed" }));
    }
  };

  return (
    <>
      <main className="px-0 py-6 md:px-2 lg:px-4">
        <div className="mx-auto grid w-full max-w-[980px] grid-cols-1 gap-6 md:grid-cols-[1fr_360px]">
          <section className="mx-auto w-full max-w-[420px] bg-white md:mx-0 md:w-full md:max-w-none md:border md:border-black">
            <div className="md:hidden">
              <OrderSummary
                variant="mobile"
                items={items}
                subtotal={subtotal}
                deliveryPrice={deliveryPrice}
                deliveryType={deliveryType}
                total={total}
                isOpen={isSummaryOpen}
                onToggle={() => setIsSummaryOpen((v) => !v)}
                calcLineTotal={calcLineTotal}
              />
            </div>

            <form onSubmit={handlePay} className="space-y-8 px-4 py-6">
              {errors.submit && (
                <div className="border border-black bg-black/5 px-4 py-4 text-red-600 font-ui text-sm">
                  {typeof errors.submit === "string"
                    ? errors.submit
                    : t?.somethingWentWrong}
                </div>
              )}

              <ContactSection
                email={email}
                setEmail={setEmail}
                error={getErrorMessage("email")}
                clearError={clearError}
                emailRef={emailRef}
              />

              <DeliveryToggle
                deliveryType={deliveryType}
                setDeliveryType={setDeliveryType}
              />

              {deliveryType === "ship" && (
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
                    errors={{
                      firstName: getErrorMessage("firstName"),
                      lastName: getErrorMessage("lastName"),
                      address: getErrorMessage("address"),
                      city: getErrorMessage("city"),
                      postalCode: getErrorMessage("postalCode"),
                      phone: getErrorMessage("phone"),
                    }}
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
              )}

              {deliveryType === "pickup" && (
                <PickupSection
                  pickupLocation={pickupLocation}
                  setPickupLocation={setPickupLocation}
                />
              )}

              <PaymentSection
                paymentType={paymentType}
                setPaymentType={setPaymentType}
                selectedBank={selectedBank}
                setSelectedBank={setSelectedBank}
                stripeCardError={stripeCardError}
              />

              <button
                type="submit"
                disabled={items.length === 0 || isSubmitting}
                className="flex h-14 w-full items-center justify-center bg-black font-ui text-[14px] text-white transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting
                  ? t?.checkoutPage?.processing || "Processing..."
                  : t?.checkoutPage?.payNow || "Pay now"}
              </button>
            </form>
          </section>

          <div className="hidden md:block">
            <OrderSummary
              variant="desktop"
              items={items}
              subtotal={subtotal}
              deliveryPrice={deliveryPrice}
              deliveryType={deliveryType}
              total={total}
              isOpen
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

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
