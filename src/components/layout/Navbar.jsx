import { NavLink } from "react-router-dom";

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
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <NavLink to="/" className="text-lg font-semibold tracking-tight">
          bd-shop
        </NavLink>

        <nav className="flex items-center gap-2">
          <Link to="/" end>
            Home
          </Link>
          <Link to="/products">Products</Link>
          <Link to="/favorites">Favorites</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/account">Account</Link>
        </nav>
      </div>
    </header>
  );
}
