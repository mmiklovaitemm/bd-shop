const VARIANTS = {
  nav: {
    button:
      "h-10 w-10 bg-[#F5F5F5] flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 disabled:opacity-40 disabled:transition-none disabled:hover:transform-none",
    icon: "h-4 w-4",
  },
  overlay: {
    button:
      "absolute top-3 h-10 w-10 bg-black/30 backdrop-blur-md flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105",
    icon: "h-5 w-5 invert",
  },
  plain: {
    button: "",
    icon: "h-5 w-5",
  },
};

export default function IconButton({
  icon,
  alt = "",
  "aria-label": ariaLabel,
  onClick,
  type = "button",
  disabled = false,
  variant = "plain",
  className = "",
  iconClassName = "",
}) {
  const styles = VARIANTS[variant] || VARIANTS.plain;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${styles.button} ${className}`}
    >
      <img src={icon} alt={alt} className={`${styles.icon} ${iconClassName}`} />
    </button>
  );
}
