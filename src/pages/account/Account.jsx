// src/pages/Account.jsx
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import { useNavigate } from "react-router-dom";

import shoppingBagIcon from "@/assets/ui/shopping-bag.svg";
import userIcon from "@/assets/ui/user.svg";
import logoutIcon from "@/assets/ui/log-out.svg";
import OurSalons from "../about/OurSalons";
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
  const navigate = useNavigate();

  const handleOrderHistory = () => {
    // kol kas nuvedam į placeholder route arba paliekam čia.
    // vėliau susikursim /account/orders
    navigate("/account/orders");
  };

  const handleProfile = () => {
    // vėliau susikursim /account/profile
    navigate("/account/profile");
  };

  const handleLogout = () => {
    // jei turi tokeną/localStorage – išvalom (pritaikyk pagal savo auth)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <main className="px-2 pt-3">
        <section className="mx-auto w-full max-w-6xl">
          <h1 className="font-display text-4xl leading-none py-1">Account</h1>

          <FullWidthDivider className="my-4" />

          <div className="mx-auto w-full max-w-md space-y-4 font-ui">
            <ActionButton
              icon={shoppingBagIcon}
              label="Order history"
              onClick={handleOrderHistory}
              invertIcon
            />

            <ActionButton
              icon={userIcon}
              label="Profile"
              onClick={handleProfile}
              invertIcon
            />

            <ActionButton
              icon={logoutIcon}
              label="Log out"
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
