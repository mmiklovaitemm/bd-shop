import { useRef, useState } from "react";
import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import OurSalons from "./about/OurSalons";
import checkSendMessageIcon from "@/assets/ui/check-send-message.svg";

export default function Contact() {
  const { t } = useLanguage();

  const [isSent, setIsSent] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const messageRef = useRef(null);

  const baseFieldClass =
    "w-full px-4 py-3 bg-transparent " +
    "placeholder:text-black/40 transition-all duration-200 " +
    "focus:outline-none focus:border-black focus:bg-black/5";

  const getFieldClass = (key) =>
    `${baseFieldClass} ${
      errors[key] ? "border border-red-600" : "border border-black"
    }`;

  const clearError = (key) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateEmail = (val) => {
    const v = String(val || "").trim();
    if (!v) return t.pleaseFillInThisField;
    if (!v.includes("@") || !v.includes(".")) return t.enterValidEmailAddress;
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (isSent) setIsSent(false);

    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = t.pleaseFillInThisField;
    const emailErr = validateEmail(formData.email);
    if (emailErr) nextErrors.email = emailErr;

    if (!formData.phone.trim()) nextErrors.phone = t.pleaseFillInThisField;
    if (!formData.message.trim()) {
      nextErrors.message = t.pleaseFillInThisField;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const order = [
        ["name", nameRef],
        ["email", emailRef],
        ["phone", phoneRef],
        ["message", messageRef],
      ];

      const first = order.find(([key]) => nextErrors[key]);
      const ref = first?.[1]?.current;

      if (ref) {
        ref.focus();
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSent(true);
    setErrors({});
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  return (
    <div className="w-full">
      <div className="px-4 py-6 md:px-8">
        <h1 className="font-display text-4xl md:text-5xl">{t.contacts}</h1>
      </div>

      <FullWidthDivider />

      <div className="px-4 py-6 font-ui text-base md:px-8">
        <div className="space-y-3 md:flex md:items-center md:justify-between md:space-y-0">
          <p>{t.phone}: +37067456723</p>
          <p>{t.email}: eshop@umstudio.com</p>
        </div>
      </div>

      <FullWidthDivider />

      <div className="px-4 py-8 md:px-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="font-ui text-sm">
              {t.name} <span className="text-red-600">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t.enterYourName}
              className={getFieldClass("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name ? (
              <p className="font-ui text-sm text-red-600">{errors.name}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="font-ui text-sm">
                {t.email} <span className="text-red-600">*</span>
              </label>
              <input
                ref={emailRef}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t.enterYourEmail}
                className={getFieldClass("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email ? (
                <p className="font-ui text-sm text-red-600">{errors.email}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="font-ui text-sm">
                {t.phoneNumber} <span className="text-red-600">*</span>
              </label>
              <input
                ref={phoneRef}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t.enterYourPhoneNumber}
                className={getFieldClass("phone")}
                aria-invalid={!!errors.phone}
              />
              {errors.phone ? (
                <p className="font-ui text-sm text-red-600">{errors.phone}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-ui text-sm">
              {t.yourMessage} <span className="text-red-600">*</span>
            </label>
            <textarea
              ref={messageRef}
              rows="5"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t.enterMessage}
              className={`${getFieldClass("message")} resize-none`}
              aria-invalid={!!errors.message}
            />
            {errors.message ? (
              <p className="font-ui text-sm text-red-600">{errors.message}</p>
            ) : null}
          </div>

          {!isSent ? (
            <button
              type="submit"
              className="w-full bg-black py-4 font-ui text-white transition-all duration-300 hover:bg-black/90 active:scale-[0.99]"
            >
              {t.sendMessage}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-4 pt-2">
              <p className="font-display text-lg">
                {t.yourMessageSentSuccessfully}
              </p>

              <img
                src={checkSendMessageIcon}
                alt={t.messageSent}
                className="h-6 w-6"
                draggable={false}
              />
            </div>
          )}
        </form>
      </div>

      <FullWidthDivider />

      <OurSalons />
      <FullWidthDivider />
    </div>
  );
}
