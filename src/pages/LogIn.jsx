import FullWidthDivider from "@/components/ui/FullWidthDivider";
import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

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
  const { pathname } = useLocation();
  const isRegister = pathname === "/register";

  // refs for scroll-to-error
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const loginPasswordRef = useRef(null);
  const registerPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // shared
  const [email, setEmail] = useState("");

  // login
  const [loginPassword, setLoginPassword] = useState("");

  // register
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // errors
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
    if (!v) return "This field is required.";
    if (!v.includes("@") || !v.includes("."))
      return "Enter a valid email address.";
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (isRegister) {
      if (!firstName.trim()) nextErrors.firstName = "This field is required.";
      if (!lastName.trim()) nextErrors.lastName = "This field is required.";

      const emailErr = validateEmail(email);
      if (emailErr) nextErrors.email = emailErr;

      if (!registerPassword.trim())
        nextErrors.registerPassword = "This field is required.";

      if (!confirmPassword.trim())
        nextErrors.confirmPassword = "This field is required.";

      if (
        registerPassword.trim() &&
        confirmPassword.trim() &&
        registerPassword !== confirmPassword
      ) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    } else {
      const emailErr = validateEmail(email);
      if (emailErr) nextErrors.email = emailErr;
      if (!loginPassword.trim())
        nextErrors.loginPassword = "This field is required.";
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

    // TODO: prijungsi auth logiką
  };

  // reset + clear errors when switching tabs
  const goLogin = () => {
    setErrors({});
    resetLoginFields();
  };

  const goRegister = () => {
    setErrors({});
    resetRegisterFields();
  };

  return (
    <>
      <main className="py-6 overflow-x-hidden">
        <section className="mx-auto w-full max-w-[420px] md:max-w-[560px] lg:max-w-[680px] md:border md:border-black/40 bg-white">
          <div className="px-6 pt-6 pb-8">
            {/* Top buttons */}
            <div className="flex gap-3 w-full">
              {isRegister ? (
                <Link
                  to="/login"
                  className="block flex-1 min-w-0 border border-black/60 bg-white py-4 text-center text-base tracking-wide"
                  onClick={goLogin}
                >
                  Sign in
                </Link>
              ) : (
                <div className="block flex-1 min-w-0 bg-black py-4 text-center text-base tracking-wide text-white">
                  Sign in
                </div>
              )}

              {isRegister ? (
                <div className="block flex-1 min-w-0 bg-black py-4 text-center text-base tracking-wide text-white">
                  Create an account
                </div>
              ) : (
                <Link
                  to="/register"
                  className="block flex-1 min-w-0 border border-black/60 bg-white py-4 text-center text-base tracking-wide"
                  onClick={goRegister}
                >
                  Create an account
                </Link>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {isRegister ? (
                <>
                  <TextInput
                    label="First name"
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
                    label="Last name"
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
                    label="Email address"
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
                    label="Password"
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
                    label="Confirm password"
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
                    className="mt-6 w-full bg-black py-5 text-center text-base tracking-wide text-white"
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  <TextInput
                    label="Email address"
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
                    label="Password"
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
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="mt-6 w-full bg-black py-5 text-center text-base tracking-wide text-white"
                  >
                    Log in
                  </button>
                </>
              )}
            </form>
          </div>
        </section>
      </main>

      <FullWidthDivider />
    </>
  );
}
