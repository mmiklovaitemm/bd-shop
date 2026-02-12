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
      className={`
        inline-flex items-center justify-center gap-2 shrink-0
        whitespace-nowrap border border-white text-white bg-white/20
        backdrop-blur-sm font-ui leading-none
        transition-transform duration-200 ease-out

        lg:hover:-translate-y-0.5 lg:hover:scale-[1.02]
        active:scale-[0.97]
        h-[30px] px-5 min-w-[150px] text-[14px]
        md:h-[42px] md:px-6 md:min-w-[170px] md:text-[15px]
        lg:h-[36px] lg:px-5 lg:min-w-[140px] lg:text-[13px]

        ${className}
      `}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="
            h-[18px] w-[18px] invert shrink-0

            md:h-[20px] md:w-[20px]

            lg:h-[16px] lg:w-[16px]
          "
        />
      )}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
