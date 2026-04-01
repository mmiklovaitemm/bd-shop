import { useRef, useState } from "react";
import { motion } from "framer-motion"; // Added for smooth loading
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = t.pleaseFillInThisField;
    if (!formData.email.trim() || !formData.email.includes("@"))
      nextErrors.email = t.enterValidEmailAddress;
    if (!formData.phone.trim()) nextErrors.phone = t.pleaseFillInThisField;
    if (!formData.message.trim()) nextErrors.message = t.pleaseFillInThisField;

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setIsSent(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1400px]">
        <div className="px-4 py-6 md:px-8">
          <h1 className="font-display text-4xl md:text-5xl">{t.contacts}</h1>
        </div>

        <FullWidthDivider />

        <div className="px-4 py-6 font-ui text-base md:px-8">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <p>{t.phone || "Phone"}: +37067456723</p>
            <p>{t.email || "Email"}: eshop@umstudio.com</p>
          </div>
        </div>

        <FullWidthDivider />

        {/* Contact Form with Scroll Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto max-w-[800px] px-4 py-10 md:px-8 md:py-16"
        >
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
                <p className="text-xs text-red-600">{errors.name}</p>
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
                  <p className="text-xs text-red-600">{errors.email}</p>
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
                  <p className="text-xs text-red-600">{errors.phone}</p>
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
                <p className="text-xs text-red-600">{errors.message}</p>
              )}
            </div>

            {!isSent ? (
              <button
                type="submit"
                className="w-full bg-black py-4 font-ui text-white transition-all hover:bg-neutral-900"
              >
                {t.sendMessage || "Send message"}
              </button>
            ) : (
              <div className="flex items-center justify-center gap-4 py-4 border border-black bg-black/5">
                <p className="font-display text-lg">
                  {t.yourMessageSentSuccessfully}
                </p>
                <img src={checkSendMessageIcon} alt="" className="h-6 w-6" />
              </div>
            )}
          </form>
        </motion.div>
      </div>

      <FullWidthDivider />

      {/* Our Salons with Scroll Animation */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <OurSalons />
      </motion.div>

      <FullWidthDivider />
    </div>
  );
}
