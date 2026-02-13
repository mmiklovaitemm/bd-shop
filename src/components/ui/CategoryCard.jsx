// src/components/ui/CategoryCard.jsx
import useMediaQuery from "@/hooks/useMediaQuery";
import cn from "@/utils/cn";

const DESKTOP_BREAKPOINT = "1024px";

export default function CategoryCard({ category, onClick, onMediaReady }) {
  const isDesktop = useMediaQuery(`(min-width: ${DESKTOP_BREAKPOINT})`);

  const preventImgDrag = (e) => {
    e.preventDefault();
  };

  return (
    <article
      data-card
      onClick={onClick}
      className={cn(
        "group bg-white shrink-0 cursor-pointer",
        "w-[260px] md:w-[300px] lg:w-[300px]",
        // Desktop hover: subtle scale and darken overlay
        isDesktop
          ? "transition-all duration-200 ease-out lg:hover:scale-[1.02]"
          : // Mobile/Tablet: disable all transitions and scaling to avoid tap highlight issues
            "transition-none active:scale-100",
      )}
      // Mobile/Tablet: disable tap highlight and focus outline
      style={
        !isDesktop
          ? { WebkitTapHighlightColor: "transparent", outline: "none" }
          : undefined
      }
      tabIndex={!isDesktop ? -1 : undefined}
    >
      <div className="relative w-full h-[340px] overflow-hidden">
        <img
          src={category.image}
          alt={category.title}
          draggable={false}
          onDragStart={preventImgDrag}
          className="absolute inset-0 h-full w-full object-cover select-none"
          loading="lazy"
          onLoad={onMediaReady}
        />

        {/* Hover overlay only for desktop */}
        {isDesktop ? (
          <div className="pointer-events-none absolute inset-0 bg-black/55 opacity-0 transition-opacity duration-200 ease-out lg:group-hover:opacity-100" />
        ) : null}

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="bg-black/55 backdrop-blur-md h-16 flex items-center justify-center">
            <p className="font-display text-[16px] text-white/95">
              {category.title}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
