import { useState, useCallback, memo } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import MobileMenu from "@/components/layout/MobileMenu";
import IconButton from "@/components/ui/IconButton";

import menuIcon from "@/assets/ui/menu.svg";
import logoIcon from "@/assets/ui/logo.svg";
import heartIcon from "@/assets/ui/heart.svg";
import bagIcon from "@/assets/ui/shopping-bag.svg";

import useBagDrawer from "@/store/useBagDrawer";
import useCart from "@/store/useCart";
import useFavorites from "@/context/useFavorites";

import userIcon from "@/assets/ui/user.svg";
import useAuth from "@/store/useAuth";
import useLanguage from "@/context/useLanguage";

const ICON_HOVER_CLASS =
  "transition-transform duration-300 ease-out lg:hover:-translate-y-[2px]";

const NAV_LINK_CLASS =
  "font-ui text-[12px] font-normal text-black/80 transition-colors lg:text-[14px] lg:hover:text-black relative " +
  "after:absolute after:bottom-[-2px] after:left-0 after:h-[0.5px] after:w-0 after:bg-black/80 after:transition-all after:duration-300 " +
  "hover:after:w-full";

const LANGUAGE_BUTTON_CLASS =
  "h-7 w-7 font-ui text-[12px] transition-transform duration-300 ease-out lg:hover:-translate-y-[2px]";

const HEADER_HEIGHT = "h-[64px]";
const MAX_WIDTH = "max-w-[1320px]";

const LANGUAGES = [
  { code: "EN", value: "en" },
  { code: "LT", value: "lt" },
];

const CountBadge = ({ count }) => (
  <AnimatePresence mode="popLayout">
    {count > 0 && (
      <motion.span
        key={count}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className="inline-block"
      >
        ({count})
      </motion.span>
    )}
  </AnimatePresence>
);

const LanguageButton = memo(({ code, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`${LANGUAGE_BUTTON_CLASS} select-none ${
      isActive ? "bg-black text-white" : "border border-black"
    }`}
  >
    {code}
  </button>
));

const NavItem = memo(({ to, children, className = NAV_LINK_CLASS }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `${className} select-none ${isActive ? "text-black after:w-full opacity-100" : ""}`
    }
  >
    {children}
  </NavLink>
));

const CartItem = memo(({ to, icon, label, count }) => (
  <NavItem to={to} className="flex items-center gap-2 select-none">
    <img
      src={icon}
      alt=""
      className={`h-4 w-auto select-none ${ICON_HOVER_CLASS}`}
    />
    <span className="font-ui text-[12px] text-black/80 select-none lg:text-[14px] whitespace-nowrap">
      {label} <CountBadge count={count} />
    </span>
  </NavItem>
));

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const openBag = useBagDrawer((s) => s.open);
  const user = useAuth((s) => s.user);
  const { lang, setLang, t } = useLanguage();

  const NAV_ITEMS = [
    { to: "/collections", label: t.collections },
    { to: "/about", label: t.aboutUs },
    { to: "/contact", label: t.contacts },
  ];

  const cartCount = useCart((s) =>
    s.items.reduce((sum, item) => sum + (item.quantity || 1), 0),
  );

  const { favoriteIds } = useFavorites();
  const favoritesCount = favoriteIds.length;

  const handleMenuOpen = useCallback(() => setIsMenuOpen(true), []);
  const handleMenuClose = useCallback(() => setIsMenuOpen(false), []);

  return (
    <header className="fixed top-[40px] left-0 right-0 z-[50] border-b border-black bg-white select-none">
      {/* MOBILE + TABLET */}
      <div
        className={`mx-auto grid ${HEADER_HEIGHT} ${MAX_WIDTH} grid-cols-3 items-center px-4 md:px-6 lg:hidden`}
      >
        <IconButton
          variant="plain"
          icon={menuIcon}
          onClick={handleMenuOpen}
          className="p-2 justify-self-start"
          iconClassName={`h-[17px] w-auto ${ICON_HOVER_CLASS}`}
        />

        <NavItem
          to="/"
          className="justify-self-center flex items-center after:hidden"
        >
          <img
            src={logoIcon}
            alt="um studio"
            className="h-[24px] md:h-[26px] w-auto"
          />
        </NavItem>

        <div className="justify-self-end flex items-center gap-2 md:gap-5">
          <NavItem
            to="/favorites"
            className="p-1 flex items-center gap-1 md:mr-[-10px] after:hidden"
          >
            <img
              src={heartIcon}
              alt="Favorites"
              className={`h-[16px] mt-[1px] w-auto ${ICON_HOVER_CLASS}`}
            />
            <span className="font-ui text-[11px] text-black/80 md:text-[12px]">
              <CountBadge count={favoritesCount} />
            </span>
          </NavItem>

          <button onClick={openBag} className="p-1 flex items-center gap-1">
            <img
              src={bagIcon}
              alt=""
              className={`h-[17px] w-auto ${ICON_HOVER_CLASS}`}
            />
            <span className="font-ui text-[11px] text-black/80 md:text-[12px]">
              <CountBadge count={cartCount} />
            </span>
          </button>
        </div>
      </div>

      {/* DESKTOP */}
      <div
        className={`hidden ${HEADER_HEIGHT} items-center bg-white lg:flex px-6 mx-auto ${MAX_WIDTH} relative`}
      >
        <NavItem to="/" className="flex items-center after:hidden">
          <img src={logoIcon} alt="um studio" className="h-[28px] w-auto" />
        </NavItem>

        <nav className="flex flex-1 items-center justify-end gap-10 pr-10">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavItem key={to} to={to}>
              {label}
            </NavItem>
          ))}
          <div className="h-px w-[220px] bg-black/30" />
        </nav>

        <div className="flex items-center gap-5 pr-20">
          <CartItem
            to="/favorites"
            icon={heartIcon}
            label={t.wishlist}
            count={favoritesCount}
          />

          <button onClick={openBag} className="flex items-center gap-2 group">
            <img
              src={bagIcon}
              alt=""
              className={`h-4 w-auto ${ICON_HOVER_CLASS}`}
            />
            <span className="font-ui text-[12px] text-black/80 lg:text-[14px]">
              {t.bag} <CountBadge count={cartCount} />
            </span>
          </button>

          {user ? (
            <NavItem
              to="/account"
              className="flex items-center gap-2 after:hidden"
            >
              <img
                src={userIcon}
                alt="Account"
                className={`h-4 w-auto ${ICON_HOVER_CLASS}`}
              />
              <span className="font-ui text-[12px] text-black/80 lg:text-[14px]">
                {t.profile}
              </span>
            </NavItem>
          ) : (
            <NavItem to="/login">{t.logIn}</NavItem>
          )}
        </div>

        {/* Language buttons at far right */}
        <div className="absolute right-6 flex items-center gap-2">
          {LANGUAGES.map(({ code, value }) => (
            <LanguageButton
              key={code}
              code={code}
              isActive={lang === value}
              onClick={() => setLang(value)}
            />
          ))}
        </div>
      </div>

      <MobileMenu open={isMenuOpen} onClose={handleMenuClose} />
    </header>
  );
}
