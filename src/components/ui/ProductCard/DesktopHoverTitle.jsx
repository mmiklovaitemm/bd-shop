import cn from "@/utils/cn";
import useLanguage from "@/context/useLanguage";
import { getTranslatedProductName } from "@/utils/getTranslatedProductName";

export default function DesktopHoverTitle({ product }) {
  const { t } = useLanguage();
  const translatedName = getTranslatedProductName(product.name, t);
  const textStyle = {
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  return (
    <div className="pointer-events-none absolute inset-0 hidden items-center justify-center px-6 text-center lg:flex">
      <p
        className={cn(
          "opacity-0 translate-y-2",
          "lg:group-hover:translate-y-0 lg:group-hover:opacity-100",
          "transition-all duration-200 ease-out",
          "max-w-[90%] font-display text-[20px] leading-tight text-white",
        )}
        style={textStyle}
      >
        {translatedName}
      </p>
    </div>
  );
}
