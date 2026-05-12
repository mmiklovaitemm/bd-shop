import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiCheck, FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

import logoIcon from "@/assets/ui/logo.svg";
import facebookIcon from "@/assets/ui/facebook.svg";
import tiktokIcon from "@/assets/ui/tiktok.svg";
import instagramIcon from "@/assets/ui/instagram.svg";

import useLanguage from "@/context/useLanguage";

const linkClass =
  "inline-block w-fit font-ui text-[14px] text-black/80 transition-all duration-300 ease-out lg:hover:text-black lg:hover:-translate-y-[2px]";

function SocialButtons({ className = "", onDragStart }) {
  const item =
    "h-8 w-8 md:h-8 md:w-8 bg-black flex items-center justify-center ui-interact select-none";
  const iconClass = "h-5 w-5 select-none";

  return (
    <div className={`flex gap-4 ${className}`}>
      <a href="#" aria-label="Facebook" className={item}>
        <img
          src={facebookIcon}
          alt=""
          draggable={false}
          onDragStart={onDragStart}
          className={iconClass}
        />
      </a>
      <a href="#" aria-label="TikTok" className={item}>
        <img
          src={tiktokIcon}
          alt=""
          draggable={false}
          onDragStart={onDragStart}
          className={iconClass}
        />
      </a>
      <a href="#" aria-label="Instagram" className={item}>
        <img
          src={instagramIcon}
          alt=""
          draggable={false}
          onDragStart={onDragStart}
          className={iconClass}
        />
      </a>
    </div>
  );
}

function LanguageToggle({ onDragStart }) {
  const { lang, setLang } = useLanguage();

  const base = "h-8 w-8 border text-[12px] font-ui ui-interact select-none";

  return (
    <div className="flex gap-2">
      <button
        type="button"
        draggable={false}
        onClick={() => setLang("en")}
        onDragStart={onDragStart}
        className={`${base} ${
          lang === "en"
            ? "bg-black text-white border-black"
            : "bg-white text-black border-black/60"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        draggable={false}
        onClick={() => setLang("lt")}
        onDragStart={onDragStart}
        className={`${base} ${
          lang === "lt"
            ? "bg-black text-white border-black"
            : "bg-white text-black border-black/60"
        }`}
      >
        LT
      </button>
    </div>
  );
}

export default function Footer() {
  const { t } = useLanguage();
  const [showSuccess, setShowSuccess] = useState(false);

  const preventDrag = useCallback((e) => {
    e.preventDefault();
  }, []);

  const preventSelect = useCallback((e) => {
    if (e.target.closest("a,button,input,textarea,select")) return;
    e.preventDefault();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    setShowSuccess(true);
  };

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            key="footer-subscribe-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[400px] border border-black/20 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowSuccess(false)}
                className="absolute right-4 top-4 z-10 text-black/60 transition hover:text-black"
              >
                <FiX size={22} />
              </button>

              <div className="flex flex-col items-center px-10 py-14 text-center">
                <img src={logoIcon} alt="Logo" className="mb-8 h-5 w-auto" />
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.4, type: "spring", stiffness: 300, damping: 20 }}
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-black"
                >
                  <FiCheck size={32} />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="mb-3 font-display text-4xl leading-tight"
                >
                  {t.thankYou}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="font-ui text-sm text-black/70"
                >
                  {t.subscriptionSuccess}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    <footer
      className="bg-white select-none"
      onDragStart={preventDrag}
      onMouseDown={preventSelect}
    >
      <div className="mx-auto w-full max-w-[1200px] px-6 py-10 md:py-10">
        <div className="grid grid-cols-1 md:[grid-template-columns:190px_120px_minmax(360px,1fr)] md:gap-6 lg:grid-cols-3 lg:gap-0 md:items-center">
          {/* RIGHT (subscribe) */}
          <div className="order-1 flex md:order-3 md:justify-end">
            <div className="min-w-0 w-full max-w-[360px] md:w-[360px] lg:w-[380px]">
              <h3 className="font-display text-[18px] font-bold text-black">
                {t.subscribeTitle}
              </h3>

              <p className="mt-2 font-ui text-[14px] leading-[20px] text-black">
                {t.subscribeText}
              </p>

              <form className="mt-4 flex w-full" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  className="h-11 w-full min-w-0 border border-black/50 px-4 text-[14px] outline-none placeholder:text-black/30"
                />
                <button
                  type="submit"
                  draggable={false}
                  onDragStart={preventDrag}
                  className="ui-interact h-11 shrink-0 bg-black px-6 text-[14px] font-medium text-white active:bg-black/80 select-none"
                >
                  {t.subscribeButton}
                </button>
              </form>
            </div>
          </div>

          {/* LEFT (logo + socials desktop) */}
          <div className="order-2 mt-10 md:order-1 md:mt-0">
            <img
              src={logoIcon}
              alt="umstudio logo"
              draggable={false}
              onDragStart={preventDrag}
              className="h-10 w-auto select-none md:h-8"
            />

            <SocialButtons
              className="mt-6 hidden md:flex md:mt-[4rem] lg:mt-[4rem]"
              onDragStart={preventDrag}
            />
          </div>

          {/* MIDDLE (links + mobile bottom row) */}
          <div className="order-3 mt-10 md:order-2 md:mt-0">
            <nav>
              <ul className="space-y-6">
                <li>
                  <NavLink
                    to="/collections"
                    className={`${linkClass} select-none`}
                  >
                    {t.collections}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" className={`${linkClass} select-none`}>
                    {t.aboutUs}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/contact" className={`${linkClass} select-none`}>
                    {t.contacts}
                  </NavLink>
                </li>
              </ul>
            </nav>

            {/* MOBILE: socials left + language right */}
            <div className="mt-10 flex items-center justify-between md:hidden">
              <SocialButtons onDragStart={preventDrag} />
              <LanguageToggle onDragStart={preventDrag} />
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
