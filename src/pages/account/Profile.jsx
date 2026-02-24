import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AboutStudioSection from "@/components/ui/AboutStudioSection";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import backArrowIcon from "@/assets/ui/back-arrow.svg";

function Label({ children }) {
  return (
    <label className="block font-ui text-sm text-neutral-800">{children}</label>
  );
}

function RequiredStar() {
  return <span className="text-red-600"> *</span>;
}

function EyeButton({ show, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="opacity-70"
        >
          <path
            d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      ) : (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="opacity-70"
        >
          <path
            d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      )}
    </button>
  );
}

export default function Profile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const onChangeField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <>
      <main className="px-2 pt-3 pb-10">
        <section className="mx-auto w-full max-w-6xl">
          <h1 className="font-display text-4xl leading-none">Profile</h1>

          <FullWidthDivider className="my-4" />

          <button
            type="button"
            onClick={() => navigate("/account")}
            className="inline-flex items-center gap-2 text-sm font-ui"
          >
            <img src={backArrowIcon} alt="" className="h-3 w-3" />
            <span>Back</span>
          </button>

          <FullWidthDivider className="my-4" />

          {/* CARD WRAPPER (tablet+ centre) */}
          <div
            className="
              md:mx-auto md:border md:border-black/40 md:bg-white
              md:max-w-[560px] lg:max-w-[680px]
            "
          >
            <div className="md:px-8 md:py-8">
              {/* Form */}
              <form className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label>
                    Email address
                    <RequiredStar />
                  </Label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={onChangeField("email")}
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="w-full border border-black bg-white px-4 py-3 font-ui text-sm outline-none placeholder:text-black/30"
                  />
                </div>

                {/* First name */}
                <div className="space-y-2">
                  <Label>
                    First name
                    <RequiredStar />
                  </Label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={onChangeField("firstName")}
                    autoComplete="given-name"
                    placeholder="Enter your first name"
                    className="w-full border border-black bg-white px-4 py-3 font-ui text-sm outline-none placeholder:text-black/30"
                  />
                </div>

                {/* Last name */}
                <div className="space-y-2">
                  <Label>
                    Last name
                    <RequiredStar />
                  </Label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={onChangeField("lastName")}
                    autoComplete="family-name"
                    placeholder="Enter your last name"
                    className="w-full border border-black bg-white px-4 py-3 font-ui text-sm outline-none placeholder:text-black/30"
                  />
                </div>

                {/* Password row: input + Change button */}
                <div className="space-y-2">
                  <Label>
                    Password
                    <RequiredStar />
                  </Label>

                  <div className="flex items-stretch gap-3">
                    <div className="relative flex-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={onChangeField("password")}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="w-full border border-black bg-white px-4 py-3 pr-12 font-ui text-sm outline-none placeholder:text-black/30"
                      />
                      <EyeButton
                        show={showPassword}
                        onClick={() => setShowPassword((s) => !s)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/account/change-password")}
                      className="shrink-0 border border-black bg-black px-6 py-3 font-ui text-sm text-white"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Save */}
                <div className="pt-3">
                  <button
                    type="button"
                    className="w-full border border-black bg-black py-4 font-ui text-sm text-white"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>

          <FullWidthDivider className="mt-6" />
        </section>
      </main>

      <FullWidthDivider />
      <AboutStudioSection />
    </>
  );
}
