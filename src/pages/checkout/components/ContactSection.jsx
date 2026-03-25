import useLanguage from "@/context/useLanguage";
import TextInput from "./TextInput";

export default function ContactSection({
  email,
  setEmail,
  error,
  clearError,
  emailRef,
}) {
  const { t } = useLanguage();

  return (
    <div>
      <p className="font-ui text-sm font-semibold">
        {t.checkoutPage.contactTitle}
      </p>

      <div className="mt-4">
        <TextInput
          label={t.checkoutPage.emailLabel}
          required
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError?.("email");
          }}
          autoComplete="email"
          placeholder={t.checkoutPage.emailPlaceholder}
          error={error}
          inputRef={emailRef}
        />
      </div>
    </div>
  );
}
