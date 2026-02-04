import { NavLink } from "react-router-dom";

import logoIcon from "@/assets/ui/logo.svg";
import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";

import userIcon from "@/assets/ui/user.svg";
import facebookIcon from "@/assets/ui/facebook.svg";
import tiktokIcon from "@/assets/ui/tiktok.svg";
import instagramIcon from "@/assets/ui/instagram.svg";

const linkClass =
  "block font-ui text-[14px] text-black/80 transition-all duration-300 ease-out hover:text-black hover:-translate-y-[2px]";

const iconBtnHover =
  "transition-transform duration-300 ease-out hover:-translate-y-[2px] hover:scale-105";

export default function MobileMenu({ open, onClose }) {
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
        aria-label="Close menu overlay"
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
        <div className="flex items-center justify-between px-4 h-[64px] border-b border-black">
          {/* LOGO */}
          <NavLink to="/" onClick={onClose} className="flex items-center">
            <img src={logoIcon} alt="um studio" className="h-[22px] w-auto" />
          </NavLink>

          {/* Close btn */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="group inline-flex items-center gap-2 font-ui text-[16px] text-black cursor-pointer"
          >
            <span className="inline-flex items-center gap-2 transition-transform duration-300 ease-out will-change-transform group-hover:translate-x-[1px] group-hover:-translate-y-[1px]">
              <span className="inline-block">Close</span>

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
        <nav className="px-6 py-8 space-y-8">
          <NavLink to="/collections" onClick={onClose} className={linkClass}>
            Collections
          </NavLink>
          <NavLink to="/about" onClick={onClose} className={linkClass}>
            About us
          </NavLink>
          <NavLink to="/contact" onClick={onClose} className={linkClass}>
            Contacts
          </NavLink>
        </nav>

        {/* Divider */}
        <div className="border-t border-black" />

        {/* Language btns */}
        <div className="px-6 py-6 flex gap-4">
          <button
            type="button"
            className="h-10 flex-1 border border-black font-ui text-[14px] transition-transform duration-300 ease-out hover:-translate-y-[2px]"
          >
            Lithuanian
          </button>
          <button
            type="button"
            className="h-10 flex-1 bg-black text-white font-ui text-[14px] transition-transform duration-300 ease-out hover:-translate-y-[2px]"
          >
            English
          </button>
        </div>

        {/* Bottom row */}
        <div className="border-t border-black" />
        <div className="px-6 h-[72px] flex items-center justify-between">
          {/* Log in btn */}
          <NavLink
            to="/account"
            onClick={onClose}
            className="group flex items-center gap-2 font-ui text-[14px] text-black/80 transition-all duration-300 ease-out hover:text-black hover:-translate-y-[2px]"
          >
            <img src={userIcon} alt="" className="h-4 w-4" />
            <span>Log in</span>
          </NavLink>

          {/* Socials */}
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Facebook" className={iconBtnHover}>
              <span className="h-8 w-8 bg-black flex items-center justify-center">
                <img src={facebookIcon} alt="" className="h-4 w-4" />
              </span>
            </a>

            <a href="#" aria-label="TikTok" className={iconBtnHover}>
              <span className="h-8 w-8 bg-black flex items-center justify-center">
                <img src={tiktokIcon} alt="" className="h-4 w-4" />
              </span>
            </a>

            <a href="#" aria-label="Instagram" className={iconBtnHover}>
              <span className="h-8 w-8 bg-black flex items-center justify-center">
                <img src={instagramIcon} alt="" className="h-4 w-4" />
              </span>
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
