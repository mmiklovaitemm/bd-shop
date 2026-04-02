import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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

const API_ORIGIN = "https://bd-shop-gfva.onrender.com";

function isVariantObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray(value.images)
  );
}

function usesVariantLevelStock(product) {
  return Object.values(product?.variants || {}).some(
    (value) =>
      Array.isArray(value) && value.length > 0 && isVariantObject(value[0]),
  );
}

function getColorEntries(product, color) {
  if (!product) return [];
  return Array.isArray(product?.variants?.[color])
    ? product.variants[color]
    : [];
}

function getVariantStock(product, color, size) {
  if (!product) return 0;
  if (!usesVariantLevelStock(product)) {
    return Math.max(0, Number(product?.stockQuantity) || 0);
  }
  const entries = getColorEntries(product, color);
  const variant = entries.find((v) => String(v?.size) === String(size));
  return Math.max(0, Number(variant?.stock) || 0);
}

export default function Checkout() {
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

  const cardNumberRef = useRef(null);
  const cardDateRef = useRef(null);
  const cardCvcRef = useRef(null);
  const cardNameRef = useRef(null);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [errors, setErrors] = useState({});
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
  const [cardNumber, setCardNumber] = useState("");
  const [cardDate, setCardDate] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

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
      const base = Number(item.price) || 0;
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
    const base = Number(item.price) || 0;
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
    const errText = t?.checkout?.errors || {};
    const pageErrText = t?.checkoutPage?.errors || {};

    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      next.email = pageErrText.enterValidEmail || "Enter valid email";

    if (deliveryType === "ship") {
      if (!firstName.trim())
        next.firstName = errText.firstNameRequired || "First name required";
      if (!lastName.trim())
        next.lastName = errText.lastNameRequired || "Last name required";
      if (!address.trim())
        next.address = errText.addressRequired || "Address required";
      if (!city.trim()) next.city = errText.cityRequired || "City required";
      if (!postalCode.trim())
        next.postalCode = errText.postalCodeRequired || "Postal code required";
      if (!phone.trim()) next.phone = errText.phoneRequired || "Phone required";
    }

    if (paymentType === "card") {
      const digits = (s) => String(s || "").replace(/\D/g, "");
      if (digits(cardNumber).length < 12)
        next.cardNumber = errText.invalidCardNumber || "Invalid card number";
      if (!/^\d{2}\/\d{2}$/.test(cardDate))
        next.cardDate = errText.useCardDateFormat || "Use MM/YY format";
      if (digits(cardCvc).length < 3)
        next.cardCvc = errText.invalidCvc || "Invalid CVC";
      if (!cardName.trim())
        next.cardName =
          errText.cardOwnerNameRequired || "Card owner name required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateCartStock = async () => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/products`, {
        credentials: "include",
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.products || [];

      const productsById = new Map();
      list.forEach((p) => {
        if (p.id) productsById.set(String(p.id), p);
        if (p.slug) productsById.set(String(p.slug), p);
      });

      const stockErrors = [];
      const errText = t?.checkout?.errors || {};

      for (const item of items) {
        const pid = String(item.productId || item.id || "");
        const product = productsById.get(pid);
        if (!product) continue;

        const qty = Number(item.quantity || 1);
        const stockAvailable = getVariantStock(product, item.color, item.size);

        if (stockAvailable <= 0) {
          const msg = errText.productSoldOut || "{productName} is sold out";
          stockErrors.push(msg.replace("{productName}", item.name));
        } else if (qty > stockAvailable) {
          const msg =
            errText.notEnoughStock ||
            "Only {stockQuantity} left for {productName}";
          stockErrors.push(
            msg
              .replace("{stockQuantity}", stockAvailable)
              .replace("{productName}", item.name)
              .replace("{qty}", qty),
          );
        }
      }
      return stockErrors;
    } catch (err) {
      console.error("Stock validation error:", err);
      return [];
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (payStatus === "success" || isSubmitting) return;

    const ok = validate();
    if (!ok) return;

    setIsSubmitting(true);

    try {
      const stockErrors = await validateCartStock();
      if (stockErrors.length > 0) {
        setErrors((prev) => ({ ...prev, submit: stockErrors[0] }));
        setIsSubmitting(false);
        return;
      }

      const payload = {
        items: items.map((it) => ({
          productId: it.productId ?? it.id ?? null,
          title: it.name ?? "",
          price: Number(it.price ?? 0),
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
            ? {
                country,
                firstName,
                lastName,
                address,
                apartment,
                city,
                postalCode,
                phone,
              }
            : null,
      };

      const res = await fetch(`${API_ORIGIN}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message || t?.somethingWentWrong || "Something went wrong",
        );
      }

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
      setErrors((prev) => ({
        ...prev,
        submit: err?.message || "Checkout failed",
      }));
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
                  {errors.submit}
                </div>
              )}

              <ContactSection
                email={email}
                setEmail={setEmail}
                error={errors.email}
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
