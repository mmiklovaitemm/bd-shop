import useLanguage from "@/context/useLanguage";

export default function ClearAllButton({ onClick, disabled = false }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        onClick?.();
      }}
      disabled={disabled}
      className={[
        "w-full h-12 border border-black font-ui text-[14px] transition-all duration-300 ease-out",
        disabled
          ? "bg-black/40 text-white/80 cursor-not-allowed"
          : "bg-black text-white hover:-translate-y-[2px]",
      ].join(" ")}
    >
      {t.clearAll}
    </button>
  );
}
