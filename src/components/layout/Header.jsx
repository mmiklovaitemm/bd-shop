// src/components/layout/Header.jsx
import { useState, useCallback, memo } from "react";
import { NavLink } from "react-router-dom";

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
  "font-ui text-[12px] font-normal text-black/80 transition-colors lg:text-[14px] lg:hover:text-black";

const LANGUAGE_BUTTON_CLASS =
  "h-7 w-7 font-ui text-[12px] transition-transform duration-300 ease-out lg:hover:-translate-y-[2px]";

const HEADER_HEIGHT = "h-[64px]";
const MAX_WIDTH = "max-w-[1320px]";

const NAV_ITEMS = [
  { to: "/collections", label: "Collections" },
  { to: "/about", label: "About us" },
  { to: "/contact", label: "Contacts" },
];

// Language options
const LANGUAGES = [
  { code: "EN", value: "en" },
  { code: "LT", value: "lt" },
];

const LanguageButton = memo(({ code, isActive, onClick }) => (
  <button
    type="button"
    draggable={false}
    onClick={onClick}
    onDragStart={(e) => e.preventDefault()}
    className={`${LANGUAGE_BUTTON_CLASS} select-none ${
      isActive ? "bg-black text-white" : "border border-black"
    }`}
    aria-label={`Switch to ${code} language`}
  >
    {code}
  </button>
));

const NavItem = memo(({ to, children, className = NAV_LINK_CLASS }) => (
  <NavLink to={to} className={`${className} select-none`}>
    {children}
  </NavLink>
));

const CartItem = memo(({ to, icon, label, count }) => (
  <NavItem to={to} className="flex items-center gap-2 select-none">
    <img
      src={icon}
      alt=""
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      className={`h-4 w-auto select-none ${ICON_HOVER_CLASS}`}
    />
    <span className="font-ui text-[12px] text-black/80 select-none lg:text-[14px]">
      {label} ({count})
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

  const preventDrag = useCallback((e) => {
    e.preventDefault();
  }, []);

  const preventSelect = useCallback((e) => {
    if (e.target.closest("button,a")) return;
    e.preventDefault();
  }, []);

  return (
    <header
      className="border-b border-black bg-white select-none"
      onDragStart={preventDrag}
      onMouseDown={preventSelect}
    >
      {/* MOBILE + TABLET: < lg */}
      <div
        className={`mx-auto grid ${HEADER_HEIGHT} ${MAX_WIDTH} grid-cols-3 items-center px-4 md:px-6 lg:hidden`}
      >
        {/* Left: Menu button */}
        <IconButton
          variant="plain"
          icon={menuIcon}
          alt=""
          aria-label="Open menu"
          onClick={handleMenuOpen}
          className="p-2 justify-self-start select-none"
          iconClassName={`h-[17px] w-auto select-none ${ICON_HOVER_CLASS}`}
          draggable={false}
          onDragStart={preventDrag}
        />

        {/* Center: Logo */}
        <NavItem to="/" className="justify-self-center flex items-center">
          <img
            src={logoIcon}
            alt="um studio"
            draggable={false}
            onDragStart={preventDrag}
            className="h-[24px] md:h-[26px] w-auto select-none"
          />
        </NavItem>

        {/* Right: Icons and languages */}
        <div className="justify-self-end flex items-center gap-2 md:gap-5">
          <NavItem
            to="/favorites"
            className="p-1 flex items-center gap-1 md:mr-[-10px]"
          >
            <img
              src={heartIcon}
              alt="Favorites"
              draggable={false}
              onDragStart={preventDrag}
              className={`h-[16px] mt-[1px] w-auto select-none ${ICON_HOVER_CLASS}`}
            />
            <span className="font-ui text-[11px] text-black/80 select-none md:text-[12px]">
              ({favoritesCount})
            </span>
          </NavItem>

          {/* BAG */}
          <button
            type="button"
            onClick={openBag}
            className="p-1 select-none flex items-center gap-1"
            style={{ WebkitTapHighlightColor: "transparent" }}
            aria-label="Open bag"
            draggable={false}
            onDragStart={preventDrag}
          >
            <img
              src={bagIcon}
              alt=""
              draggable={false}
              onDragStart={preventDrag}
              className={`h-[17px] w-auto select-none ${ICON_HOVER_CLASS}`}
            />
            <span className="font-ui text-[11px] text-black/80 select-none md:text-[12px]">
              ({cartCount})
            </span>
          </button>

          {/* MOBILE/TABLET */}
          {/* Languages shown from tablet */}
          <div className="hidden md:flex items-center gap-3">
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
      </div>

      {/* DESKTOP: lg+ */}
      <div
        className={`hidden ${HEADER_HEIGHT} items-center bg-white lg:flex px-6`}
      >
        {/* Left: Logo */}
        <NavItem to="/" className="flex items-center">
          <img
            src={logoIcon}
            alt="um studio"
            draggable={false}
            onDragStart={preventDrag}
            className="h-[28px] w-auto select-none"
          />
        </NavItem>

        {/* Middle */}
        <nav className="flex flex-1 items-center justify-end gap-10 pr-10">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavItem key={to} to={to}>
              {label}
            </NavItem>
          ))}
          <div className="h-px w-[220px] bg-black/30" />
        </nav>

        {/* Right: Cart items, login, languages */}
        <div className="flex items-center gap-5">
          <CartItem
            to="/favorites"
            icon={heartIcon}
            label={t.wishlist}
            count={favoritesCount}
          />

          {/* BAG */}
          <button
            type="button"
            onClick={openBag}
            className="flex items-center gap-2 select-none"
            aria-label="Open bag"
            style={{ WebkitTapHighlightColor: "transparent" }}
            draggable={false}
            onDragStart={preventDrag}
          >
            <img
              src={bagIcon}
              alt=""
              draggable={false}
              onDragStart={preventDrag}
              className={`h-4 w-auto select-none ${ICON_HOVER_CLASS}`}
            />

            <span className="font-ui text-[12px] text-black/80 select-none lg:text-[15px]">
              {t.bag} ({cartCount})
            </span>
          </button>

          {user ? (
            <NavItem to="/account" className="flex items-center">
              <img
                src={userIcon}
                alt="Account"
                draggable={false}
                onDragStart={preventDrag}
                className={`h-4 w-auto select-none ${ICON_HOVER_CLASS}`}
              />
            </NavItem>
          ) : (
            <NavItem to="/login">{t.logIn}</NavItem>
          )}

          <div className="flex items-center gap-2">
            {LANGUAGES.map(({ code, isActive }) => (
              <LanguageButton key={code} code={code} isActive={isActive} />
            ))}
          </div>
        </div>
      </div>

      <MobileMenu open={isMenuOpen} onClose={handleMenuClose} />
    </header>
  );
}
