export default function AddToBagButton({
  onClick,
  icon,
  label = "Add to bag",
  ariaLabel = "Add to bag",
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-2 shrink-0
        whitespace-nowrap border border-white text-white bg-white/20
        backdrop-blur-sm font-ui leading-none transition-transform
        duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02]
        active:scale-[0.98]

        h-[28px] px-3 min-w-[92px] text-[11px]

        md:h-[32px] md:px-4 md:min-w-[118px] md:text-[12px]

        lg:h-[36px] lg:px-5 lg:min-w-[140px] lg:text-[13px]

      ${className}`}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          className="h-[14px] w-[14px] invert shrink-0 md:h-[18px] md:w-[18px]"
        />
      )}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
