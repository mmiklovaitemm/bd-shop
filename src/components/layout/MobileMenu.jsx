import { NavLink } from "react-router-dom";

import logoIcon from "@/assets/ui/logo.svg";
import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";

import userIcon from "@/assets/ui/user.svg";
import facebookIcon from "@/assets/ui/facebook.svg";
import tiktokIcon from "@/assets/ui/tiktok.svg";
import instagramIcon from "@/assets/ui/instagram.svg";

import useLanguage from "@/context/useLanguage";
import useAuth from "@/store/useAuth";

const linkClass =
  "block font-ui text-[14px] text-black/80 transition-all duration-300 ease-out hover:text-black hover:-translate-y-[2px]";

const iconBtnHover =
  "transition-transform duration-300 ease-out hover:-translate-y-[2px] hover:scale-105";

const LANGUAGES = [
  { code: "LT", value: "lt", label: "Lietuvių" },
  { code: "EN", value: "en", label: "English" },
];

export default function MobileMenu({ open, onClose }) {
  const { lang, setLang, t } = useLanguage();
  const user = useAuth((s) => s.user);

  const closeLabel = t.close || (lang === "lt" ? "Uždaryti" : "Close");
  const accountLabel = t.account || (lang === "lt" ? "Paskyra" : "Account");

  const navItems = [
    { to: "/collections", label: t.collections },
    { to: "/about", label: t.aboutUs },
    { to: "/contact", label: t.contacts },
  ];

  return (
    <div
      className={[
        "fixed inset-0 z-50",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <button
        type="button"
        onClick={onClose}
        className={[
          "absolute inset-0 bg-black/30 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-label={closeLabel}
      />

      {/* Panel */}
      <aside
        className={[
          "absolute left-0 top-0 h-full w-[400px] max-w-[88vw] bg-white",
          "border-r border-black",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        {/* Top row */}
        <div className="flex h-[64px] items-center justify-between border-b border-black px-4">
          {/* LOGO */}
          <NavLink to="/" onClick={onClose} className="flex items-center">
            <img src={logoIcon} alt="um studio" className="h-[22px] w-auto" />
          </NavLink>

          {/* Close btn */}
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="group inline-flex cursor-pointer items-center gap-2 font-ui text-[12px] text-black"
          >
            <span className="inline-flex items-center gap-2 transition-transform duration-300 ease-out will-change-transform group-hover:translate-x-[1px] group-hover:-translate-y-[1px]">
              <span className="inline-block">{closeLabel}</span>

              <img
                src={arrowUpRightIcon}
                alt=""
                aria-hidden="true"
                className="h-3 w-3 transition-transform duration-300 ease-out"
              />
            </span>
          </button>
        </div>

        {/* Links */}
        <nav className="space-y-8 px-6 py-8">
          {navItems.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={onClose} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-black" />

        {/* Language btns */}
        <div className="flex gap-4 px-6 py-6">
          {LANGUAGES.map(({ code, value, label }) => {
            const isActive = lang === value;

            return (
              <button
                key={code}
                type="button"
                onClick={() => setLang(value)}
                className={[
                  "h-10 flex-1 font-ui text-[14px] transition-transform duration-300 ease-out hover:-translate-y-[2px]",
                  isActive
                    ? "bg-black text-white"
                    : "border border-black text-black",
                ].join(" ")}
                aria-label={`Switch to ${label}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Bottom row */}
        <div className="border-t border-black" />
        <div className="flex h-[72px] items-center justify-between px-6">
          {/* Log in / Account */}
          <NavLink
            to={user ? "/account" : "/login"}
            onClick={onClose}
            className="group flex items-center gap-2 font-ui text-[14px] text-black/80 transition-all duration-300 ease-out hover:-translate-y-[2px] hover:text-black"
          >
            <img src={userIcon} alt="" className="h-4 w-4" />
            <span>{user ? accountLabel : t.logIn}</span>
          </NavLink>

          {/* Socials */}
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Facebook" className={iconBtnHover}>
              <span className="flex h-8 w-8 items-center justify-center bg-black">
                <img src={facebookIcon} alt="" className="h-4 w-4" />
              </span>
            </a>

            <a href="#" aria-label="TikTok" className={iconBtnHover}>
              <span className="flex h-8 w-8 items-center justify-center bg-black">
                <img src={tiktokIcon} alt="" className="h-4 w-4" />
              </span>
            </a>

            <a href="#" aria-label="Instagram" className={iconBtnHover}>
              <span className="flex h-8 w-8 items-center justify-center bg-black">
                <img src={instagramIcon} alt="" className="h-4 w-4" />
              </span>
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
