import TextInput from "./TextInput";

export default function ContactSection({
  email,
  setEmail,
  error,
  clearError,
  emailRef,
}) {
  return (
    <div>
      <p className="font-ui text-sm font-semibold">Contact</p>

      <div className="mt-4">
        <TextInput
          label="Email address"
          required
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError?.("email");
          }}
          autoComplete="email"
          placeholder="Enter your email"
          error={error}
          inputRef={emailRef}
        />
      </div>
    </div>
  );
}
