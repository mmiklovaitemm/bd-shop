import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import useLanguage from "@/context/useLanguage";
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
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const type = show ? "text" : "password";

  return (
    <div className="animate-in fade-in duration-500">
      <label className="block text-sm font-ui">
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
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-opacity hover:opacity-100 opacity-50"
          aria-label={show ? t.hidePassword : t.showPassword}
        >
          {show ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
        <p className="mt-2 text-sm text-red-600 animate-in slide-in-from-top-1">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function ChangePassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const changePassword = useAuth((s) => s.changePassword);
  const logout = useAuth((s) => s.logout);

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

  /**
   * Helper to translate error keys to current language
   */
  const getErrorMessage = (field) => {
    const errorKey = errors[field];
    if (!errorKey) return "";

    if (errorKey === "required") return t.thisFieldIsRequired;
    if (errorKey === "minLength")
      return `${t.passwordMustBeAtLeast} ${MIN_LEN} ${t.characters}.`;
    if (errorKey === "mismatch") return t.passwordsDoNotMatch;

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!currentPassword.trim()) nextErrors.currentPassword = "required";
    if (!newPassword.trim()) nextErrors.newPassword = "required";
    if (!repeatNewPassword.trim()) nextErrors.repeatNewPassword = "required";

    if (newPassword.trim() && newPassword.length < MIN_LEN) {
      nextErrors.newPassword = "minLength";
    }

    if (
      newPassword.trim() &&
      repeatNewPassword.trim() &&
      newPassword !== repeatNewPassword
    ) {
      nextErrors.repeatNewPassword = "mismatch";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const order = [
        ["currentPassword", currentRef],
        ["newPassword", newRef],
        ["repeatNewPassword", repeatRef],
      ];
      const first = order.find(([key]) => nextErrors[key]);
      first?.[1]?.current?.focus();
      return;
    }

    setServerError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess(t.passwordUpdatedSuccessfully);
      setCurrentPassword("");
      setNewPassword("");
      setRepeatNewPassword("");

      setTimeout(async () => {
        await logout();
        navigate("/login", { replace: true });
      }, 2500);
    } catch (err) {
      setServerError(err.message || t.somethingWentWrong);
      setSubmitting(false);
    }
  };

  return (
    <>
      <main className="px-2 pb-10 pt-3">
        <section className="mx-auto w-full max-w-6xl">
          <h1 className="font-display text-4xl leading-none">
            {t.changePassword}
          </h1>
          <FullWidthDivider className="my-4" />
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-ui transition-transform active:scale-95"
            disabled={submitting}
          >
            <img src={backArrowIcon} alt="" className="h-3 w-3" />
            <span>{t.back}</span>
          </button>
          <FullWidthDivider className="my-4" />

          <div className="md:mx-auto md:max-w-[560px] md:border md:border-black/40 md:bg-white lg:max-w-[680px] shadow-sm">
            <div className="md:px-8 md:py-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {serverError && (
                  <div className="border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {serverError}
                  </div>
                )}
                {success && (
                  <div className="border border-green-600 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                  </div>
                )}

                <PasswordInput
                  label={t.currentPassword}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    clearError("currentPassword");
                  }}
                  autoComplete="current-password"
                  required
                  error={getErrorMessage("currentPassword")}
                  inputRef={currentRef}
                />

                <PasswordInput
                  label={t.newPassword}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    clearError("newPassword");
                  }}
                  autoComplete="new-password"
                  required
                  error={getErrorMessage("newPassword")}
                  inputRef={newRef}
                />

                <PasswordInput
                  label={t.repeatNewPassword}
                  value={repeatNewPassword}
                  onChange={(e) => {
                    setRepeatNewPassword(e.target.value);
                    clearError("repeatNewPassword");
                  }}
                  autoComplete="new-password"
                  required
                  error={getErrorMessage("repeatNewPassword")}
                  inputRef={repeatRef}
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className={[
                    "mt-4 w-full bg-black py-5 text-center text-base tracking-wide text-white transition-all",
                    submitting
                      ? "cursor-not-allowed opacity-60"
                      : "hover:bg-neutral-800 active:scale-[0.99]",
                  ].join(" ")}
                >
                  {submitting ? t.pleaseWait : t.save}
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
