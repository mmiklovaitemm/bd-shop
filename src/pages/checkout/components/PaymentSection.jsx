import visaIcon from "@/assets/ui/VISA-icon.svg";
import mastercardIcon from "@/assets/ui/mastercard-icon.svg";
import maestroIcon from "@/assets/ui/maestro-icon.svg";
import googlePayIcon from "@/assets/ui/google-pay-icon.svg";
import applePayIcon from "@/assets/ui/apple-pay-icon.svg";

import swedbankIcon from "@/assets/ui/swedbank-icon.svg";
import sebIcon from "@/assets/ui/seb-icon.svg";
import luminorIcon from "@/assets/ui/Luminor-icon.svg";
import revolutIcon from "@/assets/ui/Revolut-icon.svg";

import TextInput from "./TextInput";

const formatExpiry = (value) => {
  if (!value) return "";

  const digits = String(value).replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) return digits;

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export default function PaymentSection({
  paymentType,
  setPaymentType,

  cardNumber,
  setCardNumber,
  cardDate,
  setCardDate,
  cardCvc,
  setCardCvc,
  cardName,
  setCardName,

  errors = {},
  clearError,

  cardNumberRef,
  cardDateRef,
  cardCvcRef,
  cardNameRef,
}) {
  return (
    <div>
      <p className="font-ui text-sm font-semibold">Payment</p>

      <div className="mt-4 space-y-3">
        {/* CARD OPTION */}
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
            <span>Credit card</span>
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
          <div className="border border-black p-4 space-y-4">
            <TextInput
              label="Card number"
              required
              value={cardNumber}
              onChange={(e) => {
                setCardNumber(e.target.value);
                clearError?.("cardNumber");
              }}
              placeholder="1234 1234 1234 1234"
              inputMode="numeric"
              error={errors.cardNumber}
              inputRef={cardNumberRef}
            />

            <div className="grid grid-cols-2 gap-3">
              <TextInput
                label="Date"
                required
                value={cardDate}
                onChange={(e) => {
                  const val = e.target.value || "";
                  setCardDate(formatExpiry(val));
                  clearError?.("cardDate");
                }}
                placeholder="MM/YY"
                inputMode="numeric"
                autoComplete="cc-exp"
                maxLength={5}
                error={errors.cardDate}
                inputRef={cardDateRef}
              />

              <TextInput
                label="CVC"
                required
                value={cardCvc}
                onChange={(e) => {
                  setCardCvc(e.target.value);
                  clearError?.("cardCvc");
                }}
                placeholder="CVC"
                inputMode="numeric"
                error={errors.cardCvc}
                inputRef={cardCvcRef}
              />
            </div>

            <TextInput
              label="Card owner name, surname"
              required
              value={cardName}
              onChange={(e) => {
                setCardName(e.target.value);
                clearError?.("cardName");
              }}
              placeholder="Full name"
              autoComplete="cc-name"
              error={errors.cardName}
              inputRef={cardNameRef}
            />
          </div>
        ) : null}

        {/* BANK OPTION */}
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
            <span>E. bank payment</span>
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-1">
            <img
              src={swedbankIcon}
              alt="Swedbank"
              className="h-[14px] md:h-[16px] w-auto object-contain"
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
          <div className="border border-black p-4">
            <p className="font-ui text-sm text-black/60">
              E-bank payment selection will be added next.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
