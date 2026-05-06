// src/pages/Contact.jsx
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import PageTitle from "@/components/ui/PageTitle"; // Naudojame naują standartą
import OurSalons from "./about/OurSalons";
import { Reveal } from "@/components/sections/Reveal";
import checkSendMessageIcon from "@/assets/ui/check-send-message.svg";

export default function Contact() {
  const { t } = useLanguage();

  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
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
    "focus:outline-none focus:border-black focus:bg-black/5 border border-black";

  const getFieldClass = (key) =>
    `${baseFieldClass} ${errors[key] ? "border-red-600" : "border-black"}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isSent) setIsSent(false);
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = t.pleaseFillInThisField;
    if (!formData.email.trim() || !formData.email.includes("@"))
      nextErrors.email = t.enterValidEmailAddress;
    if (!formData.phone.trim()) nextErrors.phone = t.pleaseFillInThisField;
    if (!formData.message.trim()) nextErrors.message = t.pleaseFillInThisField;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "5b16109a-df01-4fd8-822c-c8acf7775321",
          subject: "UM Studio – naujas kontaktų žinutė",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSent(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setSubmitError(t.somethingWentWrong || "Something went wrong. Try again.");
      }
    } catch {
      setSubmitError(t.somethingWentWrong || "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <PageTitle title={t.contacts} />

      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <div className="px-8 py-10 font-ui text-base">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <p className="text-black/80">
                <span className="font-display mr-2">{t.phone || "Phone"}:</span>
                +37067456723
              </p>
              <p className="text-black/80">
                <span className="font-display mr-2">{t.email || "Email"}:</span>
                eshop@umstudio.com
              </p>
            </div>
          </div>
        </Reveal>

        <FullWidthDivider />

        <div className="mx-auto max-w-[800px] px-8 py-12 md:py-20">
          <Reveal>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="font-ui text-sm block">
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
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-ui text-sm block">
                    {t.email || "Email"} <span className="text-red-600">*</span>
                  </label>
                  <input
                    ref={emailRef}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t.enterYourEmail}
                    className={getFieldClass("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-ui text-sm block">
                    {t.phoneNumber || "Phone number"}{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    ref={phoneRef}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t.enterYourPhoneNumber}
                    className={getFieldClass("phone")}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-ui text-sm block">
                  {t.yourMessage || "Your message"}{" "}
                  <span className="text-red-600">*</span>
                </label>
                <textarea
                  ref={messageRef}
                  rows="5"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t.enterMessage}
                  className={`${getFieldClass("message")} resize-none`}
                />
                {errors.message && (
                  <p className="text-xs text-red-600 mt-1">{errors.message}</p>
                )}
              </div>

              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}

              {!isSent ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black py-5 font-ui text-base tracking-widest text-white transition-all hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-60"
                >
                  {isSubmitting ? "..." : (t.sendMessage || "Send message")}
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-4 py-6 border border-black bg-black/5"
                >
                  <p className="font-display text-lg">
                    {t.yourMessageSentSuccessfully}
                  </p>
                  <img src={checkSendMessageIcon} alt="" className="h-6 w-6" />
                </motion.div>
              )}
            </form>
          </Reveal>
        </div>
      </div>

      <FullWidthDivider />

      {/* Salonų sekcija */}
      <Reveal>
        <div className="py-10">
          <OurSalons />
        </div>
      </Reveal>

      <FullWidthDivider />
    </div>
  );
}
