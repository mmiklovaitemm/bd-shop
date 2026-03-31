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

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:4000";

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

function getSelectedVariant(product, color, size) {
  if (!product || !usesVariantLevelStock(product)) return null;

  const entries = getColorEntries(product, color);

  return (
    entries.find((variant) => String(variant?.size) === String(size)) || null
  );
}

function getVariantStock(product, color, size) {
  if (!product) return 0;

  if (!usesVariantLevelStock(product)) {
    return Math.max(0, Number(product?.stockQuantity) || 0);
  }

  const selectedVariant = getSelectedVariant(product, color, size);
  return Math.max(0, Number(selectedVariant?.stock) || 0);
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

  const clearError = (key) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const [email, setEmail] = useState(() => getEmailFromLocalStorage());

  const [deliveryType, setDeliveryType] = useState("ship");
  const [shippingMethod, setShippingMethod] = useState("lp");
  const [pickupLocation, setPickupLocation] = useState("vilnius");

  const SHIPPING_KIT_FEE = 15;

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const base = Number(item.price) || 0;
      const qty = Number(item.quantity || 1);

      const service = String(item.serviceOption || "").toLowerCase();
      const isShippingKit =
        service === "shipping" ||
        service === "shipping-kit" ||
        service === "shipping_kit";

      const fee = isShippingKit ? SHIPPING_KIT_FEE : 0;

      return sum + (base + fee) * qty;
    }, 0);
  }, [items]);

  const deliveryPrice = useMemo(() => {
    if (deliveryType !== "ship") return 0;
    return shippingMethod === "lp" ? 2 : 2.5;
  }, [deliveryType, shippingMethod]);

  const total = useMemo(() => {
    return subtotal + deliveryPrice;
  }, [subtotal, deliveryPrice]);

  const calcLineTotal = (item) => {
    const base = Number(item.price) || 0;
    const qty = Number(item.quantity || 1);

    const service = String(item.serviceOption || "").toLowerCase();
    const isShippingKit =
      service === "shipping" ||
      service === "shipping-kit" ||
      service === "shipping_kit";

    const fee = isShippingKit ? SHIPPING_KIT_FEE : 0;

    return (base + fee) * qty;
  };

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

  const validate = () => {
    const next = {};

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      next.email = t.checkoutPage.errors.enterValidEmail;
    }

    if (deliveryType === "ship") {
      if (!firstName.trim())
        next.firstName = t.checkout.errors.firstNameRequired;
      if (!lastName.trim()) next.lastName = t.checkout.errors.lastNameRequired;
      if (!address.trim()) next.address = t.checkout.errors.addressRequired;
      if (!city.trim()) next.city = t.checkout.errors.cityRequired;
      if (!postalCode.trim())
        next.postalCode = t.checkout.errors.postalCodeRequired;
      if (!phone.trim()) next.phone = t.checkout.errors.phoneRequired;
    }

    if (paymentType === "card") {
      const digits = (s) => String(s || "").replace(/\D/g, "");

      if (digits(cardNumber).length < 12) {
        next.cardNumber = t.checkout.errors.invalidCardNumber;
      }

      if (!/^\d{2}\/\d{2}$/.test(cardDate)) {
        next.cardDate = t.checkout.errors.useCardDateFormat;
      }

      if (digits(cardCvc).length < 3) {
        next.cardCvc = t.checkout.errors.invalidCvc;
      }

      if (!cardName.trim()) {
        next.cardName = t.checkout.errors.cardOwnerNameRequired;
      }
    }

    setErrors(next);

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

  const validateCartStock = async () => {
    const products = await fetch(`${API_ORIGIN}/api/products`, {
      credentials: "include",
    }).then((res) => res.json());

    const list = Array.isArray(products)
      ? products
      : Array.isArray(products?.products)
        ? products.products
        : [];

    const productsById = new Map(list.map((p) => [String(p.id), p]));
    const stockErrors = [];

    for (const item of items) {
      const productId =
        item.id ??
        item.productId ??
        item.product?.id ??
        item.product?.productId ??
        null;

      const qty = Number(item.qty ?? item.quantity ?? 1);
      const product = productsById.get(String(productId));

      if (!product) {
        stockErrors.push(
          t.checkout.errors.productNoLongerExists.replace(
            "{productName}",
            item.name || item.title || productId || t.product.label,
          ),
        );
        continue;
      }

      const color = String(item.color || "").trim();
      const size = String(item.size || "").trim();

      if (usesVariantLevelStock(product)) {
        if (!color || !size) {
          stockErrors.push(
            t.checkout.errors.productSoldOut.replace(
              "{productName}",
              product.name,
            ),
          );
          continue;
        }

        const variantStock = getVariantStock(product, color, size);

        if (variantStock <= 0) {
          stockErrors.push(
            t.checkout.errors.productSoldOut.replace(
              "{productName}",
              product.name,
            ),
          );
          continue;
        }

        if (qty > variantStock) {
          stockErrors.push(
            t.checkout.errors.notEnoughStock
              .replace("{stockQuantity}", variantStock)
              .replace("{productName}", product.name)
              .replace("{qty}", qty),
          );
        }

        continue;
      }

      if (product.isSoldOut || Number(product.stockQuantity || 0) <= 0) {
        stockErrors.push(
          t.checkout.errors.productSoldOut.replace(
            "{productName}",
            product.name,
          ),
        );
        continue;
      }

      if (qty > Number(product.stockQuantity || 0)) {
        stockErrors.push(
          t.checkout.errors.notEnoughStock
            .replace("{stockQuantity}", product.stockQuantity)
            .replace("{productName}", product.name)
            .replace("{qty}", qty),
        );
      }
    }

    return stockErrors;
  };

  const handlePay = async (e) => {
    e.preventDefault();

    if (payStatus === "success") return;

    const ok = validate();
    if (!ok) return;

    setIsSubmitting(true);

    try {
      const stockErrors = await validateCartStock();

      if (stockErrors.length > 0) {
        setErrors((prev) => ({
          ...prev,
          submit: stockErrors[0],
        }));
        setIsSubmitting(false);
        return;
      }

      const payload = {
        items: items.map((it) => ({
          productId: it.id ?? it.productId ?? null,
          title: it.title ?? it.name ?? "",
          price: Number(it.price ?? 0),
          qty: Number(it.qty ?? it.quantity ?? 1),
          image: it.image ?? it.img ?? null,
          color: it.color ?? null,
          size: it.size ?? null,
          serviceOption: it.serviceOption ?? null,
          variant: it.variant ?? null,
        })),

        contact: {
          email,
        },

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
        throw new Error(data?.message || t.somethingWentWrong);
      }

      clearCart();
      setIsSubmitting(false);

      navigate("/thank-you", {
        state: {
          orderId: data?.orderId ?? null,
          deliveryType,
          pickupLocation: deliveryType === "pickup" ? pickupLocation : null,
          email,
        },
      });
    } catch (err) {
      setIsSubmitting(false);
      setErrors((prev) => ({
        ...prev,
        submit: err?.message || t.somethingWentWrong,
      }));
    }
  };

  return (
    <>
      <main className="px-0 py-6 md:px-2 lg:px-4">
        <div className="mx-auto grid w-full max-w-[980px] grid-cols-1 gap-6 md:grid-cols-[1fr_360px]">
          <section className="mx-auto w-full max-w-[420px] bg-white md:mx-0 md:w-full md:max-w-none md:border md:border-black lg:border lg:border-black">
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
              {errors.submit ? (
                <div className="border border-black bg-black/5 px-4 py-4">
                  <p className="font-ui text-sm">{errors.submit}</p>
                </div>
              ) : null}

              {payStatus === "success" ? (
                <div className="border border-black bg-black/5 px-4 py-4">
                  <p className="font-ui text-sm font-semibold">
                    {t.checkout.paymentSuccess}
                  </p>

                  <button
                    type="button"
                    className="mt-4 h-12 w-full border border-black bg-white font-ui text-[14px]"
                    onClick={() => setPayStatus("idle")}
                  >
                    {t.checkout.backToCheckout}
                  </button>
                </div>
              ) : null}

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
                <PickupSection
                  pickupLocation={pickupLocation}
                  setPickupLocation={setPickupLocation}
                />
              ) : null}

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
                className="flex h-14 w-full items-center justify-center bg-black font-ui text-[14px] text-white disabled:opacity-50"
                disabled={
                  items.length === 0 || isSubmitting || payStatus === "success"
                }
              >
                {isSubmitting
                  ? t.checkoutPage.processing
                  : t.checkoutPage.payNow}
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
