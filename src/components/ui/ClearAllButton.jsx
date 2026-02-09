export default function ClearAllButton({
  onClick,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "h-12 w-full bg-black text-white font-ui text-[14px]",
        "transition-all duration-300 ease-out hover:-translate-y-[2px] hover:scale-[1.01]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100",
        className,
      ].join(" ")}
    >
      Clear all
    </button>
  );
}
