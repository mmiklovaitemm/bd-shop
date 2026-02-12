import { useCallback } from "react";
import { NavLink } from "react-router-dom";

import logoIcon from "@/assets/ui/logo.svg";
import facebookIcon from "@/assets/ui/facebook.svg";
import tiktokIcon from "@/assets/ui/tiktok.svg";
import instagramIcon from "@/assets/ui/instagram.svg";

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
  const base = "h-8 w-8 border text-[12px] font-ui ui-interact select-none";

  return (
    <div className="flex gap-2">
      <button
        type="button"
        draggable={false}
        onDragStart={onDragStart}
        className={`${base} bg-black text-white border-black active:bg-black/80`}
      >
        EN
      </button>

      <button
        type="button"
        draggable={false}
        onDragStart={onDragStart}
        className={`${base} bg-white text-black border-black/60 active:bg-black/5`}
      >
        LT
      </button>
    </div>
  );
}

export default function Footer() {
  const preventDrag = useCallback((e) => {
    e.preventDefault();
  }, []);

  const preventSelect = useCallback((e) => {
    if (e.target.closest("a,button,input,textarea,select")) return;
    e.preventDefault();
  }, []);

  return (
    <footer
      className="bg-white select-none"
      onDragStart={preventDrag}
      onMouseDown={preventSelect}
    >
      <div className="mx-auto w-full max-w-[1200px] px-6 py-10 md:py-10">
        <div className="grid grid-cols-1 md:[grid-template-columns:190px_120px_minmax(360px,1fr)] md:gap-6 lg:grid-cols-3 lg:gap-0 md:items-center">
          {/* RIGHT (subscribe) */}
          <div className="order-1 md:order-3 flex md:justify-end">
            <div className="w-full max-w-[360px] md:w-[360px] lg:w-[380px] min-w-0">
              <h3 className="font-display text-[18px] text-black font-bold">
                Subscribe &amp; save
              </h3>

              <p className="mt-2 text-[14px] leading-[20px] text-black font-ui">
                Subscribe to our email newsletter and receive the best offers
                and discounts
              </p>

              <form className="mt-4 flex w-full">
                <input
                  type="email"
                  placeholder="Email"
                  className="h-11 w-full min-w-0 border border-black/50 px-4 text-[14px] outline-none placeholder:text-black/30"
                />
                <button
                  type="submit"
                  draggable={false}
                  onDragStart={preventDrag}
                  className="h-11 shrink-0 bg-black px-6 text-[14px] font-medium text-white ui-interact active:bg-black/80 select-none"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* LEFT (logo + socials desktop) */}
          <div className="order-2 md:order-1 mt-10 md:mt-0">
            <img
              src={logoIcon}
              alt="umstudio logo"
              draggable={false}
              onDragStart={preventDrag}
              className="h-10 w-auto md:h-8 select-none"
            />

            {/* socials - desktop/tablet (nuo md rodom, bet hover veiks tik lg+) */}
            <SocialButtons
              className="mt-6 hidden md:flex md:mt-[4rem] lg:mt-[4rem]"
              onDragStart={preventDrag}
            />
          </div>

          {/* MIDDLE (links + mobile bottom row) */}
          <div className="order-3 md:order-2 mt-10 md:mt-0">
            <nav>
              <ul className="space-y-6">
                <li>
                  <NavLink
                    to="/collections"
                    className={`${linkClass} select-none`}
                  >
                    Collections
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" className={`${linkClass} select-none`}>
                    About us
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/contact" className={`${linkClass} select-none`}>
                    Contacts
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
  );
}
