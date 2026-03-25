import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import OurSalons from "./about/OurSalons";
import useAuth from "@/store/useAuth";

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
    <div>
      <label className="block text-sm">
        {label} {required && <span className="text-red-600">*</span>}
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
          aria-label={show ? t.hidePassword : t.showPassword}
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

function TextInput({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  autoComplete,
  error,
  inputRef,
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div>
      <label className="block text-sm">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete={autoComplete}
        className={[
          "mt-2 w-full px-4 py-4 text-[15px] font-semibold outline-none transition-all duration-200",
          "bg-transparent focus:bg-black/5",
          error && !isFocused
            ? "border border-red-600"
            : "border border-black focus:border-black",
        ].join(" ")}
        aria-invalid={!!error}
      />

      {error && !isFocused ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

export default function Login() {
  const { t } = useLanguage();
  const location = useLocation();
  const { pathname } = useLocation();
  const isRegister = pathname === "/register";

  const navigate = useNavigate();
  const from = location.state?.from || "/account";

  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);
  const user = useAuth((s) => s.user);

  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const loginPasswordRef = useRef(null);
  const registerPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const [email, setEmail] = useState("");

  const [loginPassword, setLoginPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});

  const clearError = (key) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const resetLoginFields = () => {
    setEmail("");
    setLoginPassword("");
  };

  const resetRegisterFields = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setRegisterPassword("");
    setConfirmPassword("");
  };

  const validateEmail = (val) => {
    const v = String(val || "").trim();
    if (!v) return t.thisFieldIsRequired;
    if (!v.includes("@") || !v.includes(".")) {
      return t.enterValidEmailAddress;
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (isRegister) {
      if (!firstName.trim()) nextErrors.firstName = t.thisFieldIsRequired;
      if (!lastName.trim()) nextErrors.lastName = t.thisFieldIsRequired;

      const emailErr = validateEmail(email);
      if (emailErr) nextErrors.email = emailErr;

      if (!registerPassword.trim()) {
        nextErrors.registerPassword = t.thisFieldIsRequired;
      }

      if (!confirmPassword.trim()) {
        nextErrors.confirmPassword = t.thisFieldIsRequired;
      }

      if (
        registerPassword.trim() &&
        confirmPassword.trim() &&
        registerPassword !== confirmPassword
      ) {
        nextErrors.confirmPassword = t.passwordsDoNotMatch;
      }
    } else {
      const emailErr = validateEmail(email);
      if (emailErr) nextErrors.email = emailErr;
      if (!loginPassword.trim()) {
        nextErrors.loginPassword = t.thisFieldIsRequired;
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const order = isRegister
        ? [
            ["firstName", firstNameRef],
            ["lastName", lastNameRef],
            ["email", emailRef],
            ["registerPassword", registerPasswordRef],
            ["confirmPassword", confirmPasswordRef],
          ]
        : [
            ["email", emailRef],
            ["loginPassword", loginPasswordRef],
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
    setSubmitting(true);

    try {
      if (isRegister) {
        await register({
          email,
          password: registerPassword,
          firstName,
          lastName,
        });
        navigate(from, { replace: true });
      } else {
        await login({ email, password: loginPassword });
        navigate(from, { replace: true });
      }
    } catch (err) {
      setServerError(err.message || t.somethingWentWrong);
    } finally {
      setSubmitting(false);
    }
  };

  const goLogin = () => {
    setErrors({});
    setServerError("");
    resetLoginFields();
  };

  const goRegister = () => {
    setErrors({});
    setServerError("");
    resetRegisterFields();
  };

  return (
    <>
      <main className="overflow-x-hidden py-6">
        <section className="mx-auto w-full max-w-[420px] bg-white md:max-w-[560px] md:border md:border-black/40 lg:max-w-[680px]">
          <div className="px-6 pb-8 pt-6">
            <div className="flex w-full gap-3">
              {isRegister ? (
                <Link
                  to="/login"
                  className="block min-w-0 flex-1 border border-black/60 bg-white py-4 text-center text-base tracking-wide"
                  onClick={goLogin}
                >
                  {t.signIn}
                </Link>
              ) : (
                <div className="block min-w-0 flex-1 bg-black py-4 text-center text-base tracking-wide text-white">
                  {t.signIn}
                </div>
              )}

              {isRegister ? (
                <div className="block min-w-0 flex-1 bg-black py-4 text-center text-base tracking-wide text-white">
                  {t.createAccount}
                </div>
              ) : (
                <Link
                  to="/register"
                  className="block min-w-0 flex-1 border border-black/60 bg-white py-4 text-center text-base tracking-wide"
                  onClick={goRegister}
                >
                  {t.createAccount}
                </Link>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {serverError ? (
                <div className="border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {serverError}
                </div>
              ) : null}

              {isRegister ? (
                <>
                  <TextInput
                    label={t.firstName}
                    required
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      clearError("firstName");
                    }}
                    autoComplete="given-name"
                    error={errors.firstName}
                    inputRef={firstNameRef}
                  />

                  <TextInput
                    label={t.lastName}
                    required
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      clearError("lastName");
                    }}
                    autoComplete="family-name"
                    error={errors.lastName}
                    inputRef={lastNameRef}
                  />

                  <TextInput
                    label={t.emailAddress}
                    required
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError("email");
                    }}
                    autoComplete="email"
                    error={errors.email}
                    inputRef={emailRef}
                  />

                  <PasswordInput
                    label={t.password}
                    value={registerPassword}
                    onChange={(e) => {
                      setRegisterPassword(e.target.value);
                      clearError("registerPassword");
                    }}
                    autoComplete="new-password"
                    required
                    error={errors.registerPassword}
                    inputRef={registerPasswordRef}
                  />

                  <PasswordInput
                    label={t.confirmPassword}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearError("confirmPassword");
                    }}
                    autoComplete="new-password"
                    required
                    error={errors.confirmPassword}
                    inputRef={confirmPasswordRef}
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className={[
                      "mt-6 w-full bg-black py-5 text-center text-base tracking-wide text-white",
                      submitting ? "cursor-not-allowed opacity-60" : "",
                    ].join(" ")}
                  >
                    {submitting ? t.pleaseWait : t.createAccount}
                  </button>
                </>
              ) : (
                <>
                  <TextInput
                    label={t.emailAddress}
                    required
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError("email");
                    }}
                    autoComplete="email"
                    error={errors.email}
                    inputRef={emailRef}
                  />

                  <PasswordInput
                    label={t.password}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      clearError("loginPassword");
                    }}
                    autoComplete="current-password"
                    required
                    error={errors.loginPassword}
                    inputRef={loginPasswordRef}
                  />

                  <div className="-mt-2 flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-black/50 underline underline-offset-2"
                    >
                      {t.forgotPassword}
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={[
                      "mt-6 w-full bg-black py-5 text-center text-base tracking-wide text-white",
                      submitting ? "cursor-not-allowed opacity-60" : "",
                    ].join(" ")}
                  >
                    {submitting ? t.pleaseWait : t.logIn}
                  </button>
                </>
              )}
            </form>
          </div>
        </section>
      </main>

      <FullWidthDivider />
      <OurSalons />
      <FullWidthDivider />
    </>
  );
}
