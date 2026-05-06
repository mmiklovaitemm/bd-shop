import { CardElement } from "@stripe/react-stripe-js";
import useLanguage from "@/context/useLanguage";

import visaIcon from "@/assets/ui/VISA-icon.svg";
import mastercardIcon from "@/assets/ui/mastercard-icon.svg";
import maestroIcon from "@/assets/ui/maestro-icon.svg";
import googlePayIcon from "@/assets/ui/google-pay-icon.svg";
import applePayIcon from "@/assets/ui/apple-pay-icon.svg";

import swedbankIcon from "@/assets/ui/swedbank-icon.svg";
import sebIcon from "@/assets/ui/seb-icon.svg";
import luminorIcon from "@/assets/ui/Luminor-icon.svg";
import revolutIcon from "@/assets/ui/Revolut-icon.svg";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "14px",
      fontFamily: "Montserrat, sans-serif",
      color: "#000000",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#dc2626" },
  },
};

export default function PaymentSection({
  paymentType,
  setPaymentType,
  selectedBank,
  setSelectedBank,
  stripeCardError,
}) {
  const { t } = useLanguage();

  return (
    <div>
      <p className="font-ui text-sm font-semibold">
        {t.checkoutPage.paymentTitle}
      </p>

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
                "h-4 w-4 flex-none rounded-full border flex items-center justify-center",
                paymentType === "card" ? "border-white" : "border-black",
              ].join(" ")}
              aria-hidden="true"
            >
              {paymentType === "card" ? (
                <span className="h-2 w-2 rounded-full bg-white" />
              ) : null}
            </span>
            <span>{t.checkoutPage.creditCard}</span>
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-1">
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
          <div className="border border-black p-4">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
            {stripeCardError && (
              <p className="mt-2 font-ui text-xs text-red-600">{stripeCardError}</p>
            )}
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
                "h-4 w-4 flex-none rounded-full border flex items-center justify-center",
                paymentType === "bank" ? "border-white" : "border-black",
              ].join(" ")}
              aria-hidden="true"
            >
              {paymentType === "bank" ? (
                <span className="h-2 w-2 rounded-full bg-white" />
              ) : null}
            </span>

            <span>{t.checkoutPage.bankPayment}</span>
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-1">
            <img
              src={swedbankIcon}
              alt="Swedbank"
              className="h-[14px] w-auto object-contain md:h-[16px]"
              draggable={false}
            />
            <img
              src={sebIcon}
              alt="SEB"
              className={[
                "h-[14px] md:h-[16px] w-auto object-contain",
                paymentType === "bank" ? "brightness-0 invert" : "",
              ].join(" ")}
              draggable={false}
            />
            <img
              src={luminorIcon}
              alt="Luminor"
              className={[
                "h-[12px] md:h-[16px] w-auto object-contain",
                paymentType === "bank" ? "brightness-0 invert" : "",
              ].join(" ")}
              draggable={false}
            />
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
          <div className="space-y-3 border border-black p-4">
            <p className="font-ui text-sm font-semibold">
              {t.checkoutPage.chooseYourBank}
            </p>

            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="h-12 w-full border border-black bg-white px-4 font-ui text-sm outline-none"
            >
              <option value="swedbank">Swedbank</option>
              <option value="seb">SEB</option>
              <option value="luminor">Luminor</option>
              <option value="revolut">Revolut</option>
            </select>

            <p className="font-ui text-sm text-black/60">
              {t.checkoutPage.bankRedirectText}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
