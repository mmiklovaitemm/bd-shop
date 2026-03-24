import { NavLink } from "react-router-dom";
import useLanguage from "@/context/useLanguage";

const base =
  "rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-neutral-100";
const active = "bg-neutral-900 text-white hover:bg-neutral-900";

function Link({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `${base} ${isActive ? active : ""}`}
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { t } = useLanguage();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <NavLink to="/" className="text-lg font-semibold tracking-tight">
          bd-shop
        </NavLink>

        <nav className="flex items-center gap-2">
          <Link to="/" end>
            {t.home}
          </Link>
          <Link to="/products">{t.products}</Link>
          <Link to="/favorites">{t.favorites}</Link>
          <Link to="/about">{t.aboutUs}</Link>
          <Link to="/contact">{t.contacts}</Link>
          <Link to="/account">{t.account}</Link>
        </nav>
      </div>
    </header>
  );
}
