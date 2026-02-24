import { useState } from "react";

export default function TextInput({
  label,
  required = false,
  type = "text",
  value,
  onChange,
  autoComplete,
  error,
  inputRef,
  placeholder,
  inputMode,
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
        placeholder={placeholder}
        inputMode={inputMode}
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
