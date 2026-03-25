// src/pages/Account.jsx
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import { useNavigate } from "react-router-dom";

import useLanguage from "@/context/useLanguage";
import useAuth from "@/store/useAuth";

import shoppingBagIcon from "@/assets/ui/shopping-bag.svg";
import userIcon from "@/assets/ui/user.svg";
import logoutIcon from "@/assets/ui/log-out.svg";
import AboutStudioSection from "@/components/ui/AboutStudioSection";

function ActionButton({ icon, label, onClick, invertIcon = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full
        rounded-none
        bg-black
        px-4
        py-4
        text-sm
        tracking-wide
        text-white
        shadow-sm
        active:scale-[0.99]
      "
    >
      <span className="flex items-center justify-center gap-3">
        <img
          src={icon}
          alt=""
          aria-hidden="true"
          className={`h-5 w-5 ${invertIcon ? "invert" : ""}`}
        />
        <span>{label}</span>
      </span>
    </button>
  );
}

export default function Account() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);

  const handleOrderHistory = () => navigate("/account/orders");
  const handleProfile = () => navigate("/account/profile");

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <main className="px-2 pt-3">
        <section className="mx-auto w-full max-w-6xl">
          <h1 className="py-1 font-display text-4xl leading-none">
            {t.account}
          </h1>

          <FullWidthDivider className="my-4" />

          <div className="mx-auto w-full max-w-md space-y-4 font-ui">
            <ActionButton
              icon={shoppingBagIcon}
              label={t.orderHistory}
              onClick={handleOrderHistory}
              invertIcon
            />

            <ActionButton
              icon={userIcon}
              label={t.profile}
              onClick={handleProfile}
              invertIcon
            />

            <ActionButton
              icon={logoutIcon}
              label={t.logOut}
              onClick={handleLogout}
            />
          </div>

          <FullWidthDivider className="my-6" />
        </section>
      </main>

      <AboutStudioSection />
      <FullWidthDivider />
    </>
  );
}
