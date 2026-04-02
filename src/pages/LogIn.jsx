import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/sections/Reveal";

import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import OurSalons from "./about/OurSalons";
import useAuth from "@/store/useAuth";
import cn from "@/utils/cn";

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const formVariants = {
  hidden: (isRegister) => ({
    opacity: 0,
    x: isRegister ? 20 : -20,
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: (isRegister) => ({
    opacity: 0,
    x: isRegister ? -20 : 20,
    transition: { duration: 0.3, ease: "easeIn" },
  }),
};

function InputError({ error, visible }) {
  return (
    <AnimatePresence>
      {error && visible && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 text-sm text-red-600 overflow-hidden"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
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
          className={cn(
            "w-full px-4 py-4 pr-12 text-[15px] font-semibold outline-none transition-all duration-200 bg-transparent border",
            isFocused ? "bg-black/5 border-black" : "border-black/40",
            error && !isFocused ? "border-red-600" : "",
            "focus:border-black",
          )}
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
      <InputError error={error} visible={!isFocused} />
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
        className={cn(
          "mt-2 w-full px-4 py-4 text-[15px] font-semibold outline-none transition-all duration-200 bg-transparent border",
          isFocused ? "bg-black/5 border-black" : "border-black/40",
          error && !isFocused ? "border-red-600" : "",
          "focus:border-black",
        )}
        aria-invalid={!!error}
      />
      <InputError error={error} visible={!isFocused} />
    </div>
  );
}

export default function Login() {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const location = useLocation();
  const navigate = useNavigate();

  const isRegister = pathname === "/register";
  const from = location.state?.from || "/account";

  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);
  const user = useAuth((s) => s.user);

  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (isRegister) {
      if (!firstName.trim()) nextErrors.firstName = t.thisFieldIsRequired;
      if (!lastName.trim()) nextErrors.lastName = t.thisFieldIsRequired;
      if (!email.includes("@")) nextErrors.email = t.enterValidEmailAddress;
      if (!registerPassword.trim())
        nextErrors.registerPassword = t.thisFieldIsRequired;
      if (registerPassword !== confirmPassword)
        nextErrors.confirmPassword = t.passwordsDoNotMatch;
    } else {
      if (!email.trim()) nextErrors.email = t.thisFieldIsRequired;
      if (!loginPassword.trim())
        nextErrors.loginPassword = t.thisFieldIsRequired;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setServerError("");
    setSubmitting(true);

    try {
      let response;

      if (isRegister) {
        response = await register({
          email,
          password: registerPassword,
          firstName,
          lastName,
        });
      } else {
        response = await login({ email, password: loginPassword });
      }

      if (response?.token) {
        localStorage.setItem("access_token", response.token);
      }

      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || t.somethingWentWrong);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <motion.main
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="overflow-x-hidden py-6"
      >
        <section className="mx-auto w-full max-w-[420px] bg-white md:max-w-[560px] md:border md:border-black/40 lg:max-w-[680px]">
          <div className="px-6 pb-8 pt-6">
            <div className="flex w-full gap-3">
              <Link
                to="/login"
                className={cn(
                  "block min-w-0 flex-1 py-4 text-center text-base tracking-wide transition-all duration-300 border",
                  !isRegister
                    ? "bg-black text-white border-black"
                    : "border-black/40 bg-white text-black",
                )}
              >
                {t.signIn}
              </Link>
              <Link
                to="/register"
                className={cn(
                  "block min-w-0 flex-1 py-4 text-center text-base tracking-wide transition-all duration-300 border",
                  isRegister
                    ? "bg-black text-white border-black"
                    : "border-black/40 bg-white text-black",
                )}
              >
                {t.createAccount}
              </Link>
            </div>

            <AnimatePresence mode="wait" custom={isRegister}>
              <motion.form
                key={isRegister ? "register-form" : "login-form"}
                custom={isRegister}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700 overflow-hidden"
                  >
                    {serverError}
                  </motion.div>
                )}

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
                      className={cn(
                        "mt-6 w-full bg-black py-5 text-center text-base tracking-wide text-white transition-opacity active:scale-[0.99]",
                        submitting && "opacity-60 cursor-not-allowed",
                      )}
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
                        name="forgot-password"
                        className="text-sm text-black/50 underline underline-offset-2 hover:text-black transition-colors"
                      >
                        {t.forgotPassword}
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className={cn(
                        "mt-6 w-full bg-black py-5 text-center text-base tracking-wide text-white transition-opacity active:scale-[0.99]",
                        submitting && "opacity-60 cursor-not-allowed",
                      )}
                    >
                      {submitting ? t.pleaseWait : t.logIn}
                    </button>
                  </>
                )}
              </motion.form>
            </AnimatePresence>
          </div>
        </section>
      </motion.main>

      <FullWidthDivider />
      <Reveal>
        <OurSalons />
      </Reveal>
      <FullWidthDivider />
    </>
  );
}
