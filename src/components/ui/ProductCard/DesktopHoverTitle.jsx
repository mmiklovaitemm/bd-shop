import cn from "@/utils/cn";

export default function DesktopHoverTitle({ product }) {
  const textStyle = {
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:flex items-center justify-center px-6 text-center">
      <p
        className={cn(
          "opacity-0 translate-y-2",
          "lg:group-hover:opacity-100 lg:group-hover:translate-y-0",
          "transition-all duration-200 ease-out",
          "text-white font-display text-[20px] leading-tight",
          "max-w-[90%]",
        )}
        style={textStyle}
      >
        {product.name}
      </p>
    </div>
  );
}
