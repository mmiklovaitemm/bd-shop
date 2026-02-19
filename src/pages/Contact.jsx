import { useRef, useState } from "react";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import OurSalons from "./AboutUs/OurSalons";
import checkSendMessageIcon from "@/assets/ui/check-send-message.svg";

export default function Contact() {
  const [isSent, setIsSent] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // field-level errors
  const [errors, setErrors] = useState({});

  // refs for scroll-to-error
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
    if (!v) return "Please fill in this field.";
    if (!v.includes("@") || !v.includes("."))
      return "Enter a valid email address.";
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

    if (!formData.name.trim()) nextErrors.name = "Please fill in this field.";
    const emailErr = validateEmail(formData.email);
    if (emailErr) nextErrors.email = emailErr;

    if (!formData.phone.trim()) nextErrors.phone = "Please fill in this field.";
    if (!formData.message.trim())
      nextErrors.message = "Please fill in this field.";

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

    // success
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
      {/* Title */}
      <div className="px-4 md:px-8 py-6">
        <h1 className="text-4xl md:text-5xl font-display">Contacts</h1>
      </div>

      <FullWidthDivider />

      {/* Contact info */}
      <div className="px-4 md:px-8 py-6 text-base font-ui">
        <div className="space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
          <p>Phone: +37067456723</p>
          <p>Email: eshop@umstudio.com</p>
        </div>
      </div>

      <FullWidthDivider />

      {/* Contact form */}
      <div className="px-4 md:px-8 py-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-ui">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className={getFieldClass("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name ? (
              <p className="text-sm text-red-600 font-ui">{errors.name}</p>
            ) : null}
          </div>

          {/* Email + Phone row on tablet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-ui">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                ref={emailRef}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={getFieldClass("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email ? (
                <p className="text-sm text-red-600 font-ui">{errors.email}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-ui">
                Phone number <span className="text-red-600">*</span>
              </label>
              <input
                ref={phoneRef}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className={getFieldClass("phone")}
                aria-invalid={!!errors.phone}
              />
              {errors.phone ? (
                <p className="text-sm text-red-600 font-ui">{errors.phone}</p>
              ) : null}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-ui">
              Your message <span className="text-red-600">*</span>
            </label>
            <textarea
              ref={messageRef}
              rows="5"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter message"
              className={`${getFieldClass("message")} resize-none`}
              aria-invalid={!!errors.message}
            />
            {errors.message ? (
              <p className="text-sm text-red-600 font-ui">{errors.message}</p>
            ) : null}
          </div>

          {/* Button OR Success */}
          {!isSent ? (
            <button
              type="submit"
              className="w-full bg-black text-white py-4 font-ui transition-all duration-300 hover:bg-black/90 active:scale-[0.99]"
            >
              Send message
            </button>
          ) : (
            <div className="pt-2 flex items-center justify-center gap-4">
              <p className="font-display text-lg">
                Your message sent successfully
              </p>

              <img
                src={checkSendMessageIcon}
                alt="Message sent"
                className="w-6 h-6"
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
