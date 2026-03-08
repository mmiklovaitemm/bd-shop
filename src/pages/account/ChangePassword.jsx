import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import AboutStudioSection from "@/components/ui/AboutStudioSection";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import backArrowIcon from "@/assets/ui/back-arrow.svg";
import useAuth from "@/store/useAuth";

function RequiredStar() {
  return <span className="text-red-600">*</span>;
}

function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  required = false,
  error,
  inputRef,
}) {
  const [show, setShow] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const type = show ? "text" : "password";

  return (
    <div>
      <label className="block text-sm">
        {label} {required && <RequiredStar />}
      </label>

      <div className="relative mt-2">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={autoComplete}
          className={[
            "w-full px-4 py-4 pr-12 text-[15px] font-semibold outline-none transition-all duration-200",
            "bg-transparent focus:bg-black/5",
            error && !isFocused
              ? "border border-red-600"
              : "border border-black focus:border-black",
          ].join(" ")}
          aria-invalid={!!error}
        />

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
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
      </div>

      {error && !isFocused ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const changePassword = useAuth((s) => s.changePassword);

  // refs for scroll-to-error
  const currentRef = useRef(null);
  const newRef = useRef(null);
  const repeatRef = useRef(null);

  const MIN_LEN = 8;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const clearError = (key) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validatePasswordMin = (val) => {
    if (String(val || "").trim().length < MIN_LEN) {
      return `Password must be at least ${MIN_LEN} characters.`;
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!currentPassword.trim())
      nextErrors.currentPassword = "This field is required.";
    if (!newPassword.trim()) nextErrors.newPassword = "This field is required.";
    if (!repeatNewPassword.trim())
      nextErrors.repeatNewPassword = "This field is required.";

    if (newPassword.trim()) {
      const minErr = validatePasswordMin(newPassword);
      if (minErr) nextErrors.newPassword = minErr;
    }

    if (
      newPassword.trim() &&
      repeatNewPassword.trim() &&
      newPassword !== repeatNewPassword
    ) {
      nextErrors.repeatNewPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const order = [
        ["currentPassword", currentRef],
        ["newPassword", newRef],
        ["repeatNewPassword", repeatRef],
      ];

      const first = order.find(([key]) => nextErrors[key]);
      const ref = first?.[1]?.current;

      if (ref) {
        ref.focus();
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setServerError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      // logout po password change
      await useAuth.getState().logout();

      navigate("/login", { replace: true });

      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setRepeatNewPassword("");
    } catch (err) {
      setServerError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <main className="px-2 pt-3 pb-10">
        <section className="mx-auto w-full max-w-6xl">
          <h1 className="font-display text-4xl leading-none">
            Change password
          </h1>

          <FullWidthDivider className="my-4" />

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-ui"
          >
            <img src={backArrowIcon} alt="" className="h-3 w-3" />
            <span>Back</span>
          </button>

          <FullWidthDivider className="my-4" />

          <div className="md:mx-auto md:border md:border-black/40 md:bg-white md:max-w-[560px] lg:max-w-[680px]">
            <div className="md:px-8 md:py-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {serverError ? (
                  <div className="border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {serverError}
                  </div>
                ) : null}

                {success ? (
                  <div className="border border-black/30 bg-black/5 px-4 py-3 text-sm text-black/80">
                    {success}
                  </div>
                ) : null}

                <PasswordInput
                  label="Current password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    clearError("currentPassword");
                    setServerError("");
                    setSuccess("");
                  }}
                  autoComplete="current-password"
                  required
                  error={errors.currentPassword}
                  inputRef={currentRef}
                />

                <PasswordInput
                  label="New password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    clearError("newPassword");
                    setServerError("");
                    setSuccess("");
                  }}
                  autoComplete="new-password"
                  required
                  error={errors.newPassword}
                  inputRef={newRef}
                />

                <PasswordInput
                  label="Repeat new password"
                  value={repeatNewPassword}
                  onChange={(e) => {
                    setRepeatNewPassword(e.target.value);
                    clearError("repeatNewPassword");
                    setServerError("");
                    setSuccess("");
                  }}
                  autoComplete="new-password"
                  required
                  error={errors.repeatNewPassword}
                  inputRef={repeatRef}
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className={[
                    "mt-4 w-full bg-black py-5 text-center text-base tracking-wide text-white",
                    submitting ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
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
