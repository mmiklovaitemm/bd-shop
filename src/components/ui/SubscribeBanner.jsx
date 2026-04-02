// src/ui/SubscribeBanner.jsx
import { useCallback, useEffect, useState } from "react";
import { FiX, FiCheck } from "react-icons/fi"; // Added check icon for success

import useLanguage from "@/context/useLanguage";
import bannerImg from "@/assets/images/banner/banner-img.webp";
import logo from "@/assets/ui/logo.svg";

const STORAGE_KEY = "um_studio_subscribe_timestamp";
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

export default function SubscribeBanner({ delayMs = 3000 }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Close banner and store current timestamp to localStorage
  const close = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());

    // Delay unmounting to allow fade-out animation
    setTimeout(() => setOpen(false), 300);
  }, []);

  // Show banner logic with 7-day check
  useEffect(() => {
    const lastDismissed = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (lastDismissed) {
      const timePassed = now - parseInt(lastDismissed, 10);
      if (timePassed < SEVEN_DAYS_IN_MS) return;
    }

    const tmr = setTimeout(() => {
      setOpen(true);
      setTimeout(() => setIsVisible(true), 10);
    }, delayMs);

    return () => clearTimeout(tmr);
  }, [delayMs]);

  // Accessibility: Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic for API call would go here
    setIsSubscribed(true);

    // Automatically close the banner after 3 seconds of showing success message
    setTimeout(() => {
      close();
    }, 3000);
  };

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={close}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`relative w-full border border-black/20 bg-white shadow-2xl transition-all duration-500 ease-out 
          max-w-[360px] sm:max-w-[520px] lg:max-w-[980px] ${
            isVisible ? "translate-y-0 scale-100" : "translate-y-10 scale-95"
          }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 z-10 text-black/60 transition hover:text-black"
          aria-label={t.close}
        >
          <FiX
            size={25}
            className="lg:hover:rotate-90 lg:transition-transform"
          />
        </button>

        <div className="grid lg:grid-cols-2">
          {/* Banner Image - Hidden on mobile to save space if success message is long */}
          <div
            className={`${isSubscribed ? "hidden lg:block" : "block"} h-[200px] lg:h-[480px] w-full overflow-hidden`}
          >
            <img
              src={bannerImg}
              alt={t.subscribeBannerImageAlt}
              className="h-full w-full object-cover"
              draggable="false"
            />
          </div>

          <div className="flex flex-col justify-center px-6 py-12 text-center sm:px-12">
            <div className="mb-6 flex justify-center">
              <img
                src={logo}
                alt="Logo"
                className="h-5 w-auto lg:h-6"
                draggable="false"
              />
            </div>

            {isSubscribed ? (
              /* Success Message View */
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-black">
                  <FiCheck size={32} />
                </div>
                <h2 className="mb-3 font-display text-4xl leading-tight lg:text-5xl">
                  {t.thankYou}
                </h2>
                <p className="mx-auto max-w-[30ch] font-ui text-base text-black/70">
                  {t.subscriptionSuccess}
                </p>
              </div>
            ) : (
              /* Subscription Form View */
              <>
                <h2 className="mb-3 font-display text-4xl leading-tight lg:text-5xl xl:text-6xl">
                  {t.subscribeAndSave}
                </h2>
                <p className="mx-auto mb-8 max-w-[34ch] font-ui text-sm text-black/70 sm:text-base">
                  {t.subscribeBannerText}
                </p>

                <form
                  className="mx-auto flex w-full max-w-[460px]"
                  onSubmit={handleSubmit}
                >
                  <input
                    type="email"
                    required
                    placeholder={t.emailPlaceholder}
                    className="h-11 w-full border border-black/30 px-3 text-base outline-none focus:border-black lg:h-12"
                  />
                  <button
                    type="submit"
                    className="h-11 shrink-0 bg-black px-6 font-ui text-sm text-white transition-all hover:bg-neutral-800 lg:h-12 lg:px-8 lg:text-base"
                  >
                    {t.subscribeButton}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
