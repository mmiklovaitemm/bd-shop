import { NavLink } from "react-router-dom";

import logoIcon from "@/assets/ui/logo.svg";
import facebookIcon from "@/assets/ui/facebook.svg";
import tiktokIcon from "@/assets/ui/tiktok.svg";
import instagramIcon from "@/assets/ui/instagram.svg";

const linkClass =
  "inline-block w-fit font-ui text-[14px] text-black/80 transition-all duration-300 ease-out hover:text-black hover:-translate-y-[2px]";

const iconBtnHover =
  "transition-transform duration-300 ease-out hover:-translate-y-[2px] hover:scale-105";

const subscribeBtnHover =
  "transition-transform duration-300 ease-out hover:-translate-y-[2px] hover:scale-105";

/* ================== socials ================== */
function SocialButtons({ className = "" }) {
  const item = `h-10 w-10 lg:h-8 lg:w-8 md:h-8 md:w-8 bg-black flex items-center justify-center ${iconBtnHover}`;
  const iconClass = "h-5 w-5";

  return (
    <div className={`flex gap-4 ${className}`}>
      <a href="#" aria-label="Facebook" className={item}>
        <img src={facebookIcon} alt="" className={iconClass} />
      </a>
      <a href="#" aria-label="TikTok" className={item}>
        <img src={tiktokIcon} alt="" className={iconClass} />
      </a>
      <a href="#" aria-label="Instagram" className={item}>
        <img src={instagramIcon} alt="" className={iconClass} />
      </a>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-10 md:py-10">
        <div className="grid grid-cols-1 md:[grid-template-columns:190px_120px_minmax(360px,1fr)] md:gap-6 lg:grid-cols-3 lg:gap-0 md:items-center">
          {/* ================= RIGHT (subscribe) ================= */}
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
                  className={`h-11 shrink-0 bg-black px-6 text-[14px] font-medium text-white ${subscribeBtnHover}`}
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* ================= LEFT (logo + socials desktop/tablet) ================= */}
          <div className="order-2 md:order-1 mt-10 md:mt-0">
            <img
              src={logoIcon}
              alt="umstudio logo"
              className="h-10 w-auto md:h-8"
            />

            {/* socials - desktop/tablet */}
            <SocialButtons className="mt-6 hidden md:flex md:mt-[4rem] lg:mt-[4rem]" />
          </div>

          {/* ================= MIDDLE (links + socials mobile) ================= */}
          <div className="order-3 md:order-2 mt-10 md:mt-0 flex items-start justify-between md:block">
            <nav>
              <ul className="space-y-6">
                <li>
                  <NavLink to="/collections" className={linkClass}>
                    Collections
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" className={linkClass}>
                    About us
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/contact" className={linkClass}>
                    Contacts
                  </NavLink>
                </li>
              </ul>
            </nav>

            {/* socials - mobile */}
            <SocialButtons className="md:hidden pt-[4.5rem]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
