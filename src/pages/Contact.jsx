import { useState } from "react";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import OurSalons from "./AboutUs/OurSalons";
import checkSendMessageIcon from "@/assets/ui/check-send-message.svg";

export default function Contact() {
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const fieldClass =
    "w-full border border-black px-4 py-3 bg-transparent " +
    "placeholder:text-black/40 transition-all duration-200 " +
    "focus:outline-none focus:border-black focus:bg-black/5";

  const handleChange = (e) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.message.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setIsSent(true);

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
            <label className="text-sm font-ui">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className={fieldClass}
            />
          </div>

          {/* Email + Phone row on tablet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-ui">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-ui">Phone number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className={fieldClass}
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-ui">Your message</label>
            <textarea
              rows="5"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter message"
              className={`${fieldClass} resize-none`}
            />
          </div>

          {/* Error message */}
          {error && <p className="text-sm text-red-600 font-ui">{error}</p>}

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
