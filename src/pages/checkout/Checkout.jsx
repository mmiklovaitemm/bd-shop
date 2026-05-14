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

    try {
      const orderPayload = {
        items: items.map((it) => ({
          productId: it.productId ?? it.id ?? null,
          title: it.name ?? "",
          price: Number(it.price?.toString().replace("€", "") ?? 0),
          qty: Number(it.quantity ?? 1),
          image: it.image ?? null,
          color: it.color ?? null,
          size: it.size ?? null,
          serviceOption: it.serviceOption ?? null,
        })),
        contact: { email },
        delivery: {
          type: deliveryType,
          method: deliveryType === "ship" ? shippingMethod : pickupLocation,
        },
        payment: {
          type: paymentType,
          bank: paymentType === "bank" ? selectedBank : null,
        },
        shipping:
          deliveryType === "ship"
            ? { country, firstName, lastName, address, apartment, city, postalCode, phone }
            : null,
      };

      const authHeaders = {
        "Content-Type": "application/json",
        ...(getStoredToken() ? { Authorization: `Bearer ${getStoredToken()}` } : {}),
      };

      if (paymentType === "card") {
        const intentRes = await fetch(`${API_ORIGIN}/api/payments/create-intent`, {
          method: "POST",
          headers: authHeaders,
          credentials: "include",
          body: JSON.stringify({ amount: Math.round(total * 100) }),
        });
        const intentData = await intentRes.json().catch(() => ({}));
        if (!intentRes.ok) throw new Error(intentData?.message || "Payment setup failed");

        const cardElement = elements.getElement(CardElement);
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          intentData.clientSecret,
          { payment_method: { card: cardElement, billing_details: { email } } },
        );

        if (error) {
          setStripeCardError(error.message);
          setIsSubmitting(false);
          return;
        }

        if (paymentIntent.status !== "succeeded") {
          throw new Error("Payment was not completed.");
        }

        orderPayload.payment.intentId = paymentIntent.id;
      }

      const res = await fetch(`${API_ORIGIN}/api/orders`, {
        method: "POST",
        headers: authHeaders,
        credentials: "include",
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || t?.somethingWentWrong || "Something went wrong");

      clearCart();
      setIsSubmitting(false);
      setPayStatus("success");

      navigate("/thank-you", {
        state: {
          orderId: data?.orderId || data?.id || "ORDER-" + Date.now(),
          deliveryType,
          pickupLocation: deliveryType === "pickup" ? pickupLocation : null,
          email,
        },
        replace: true,
      });
    } catch (err) {
      console.error("Pay error:", err);
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
