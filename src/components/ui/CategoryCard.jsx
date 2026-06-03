import useMediaQuery from "@/hooks/useMediaQuery";
import useLanguage from "@/context/useLanguage";
import cn from "@/utils/cn";

const DESKTOP_BREAKPOINT = "1024px";

export default function CategoryCard({ category, onClick, onMediaReady }) {
  const isDesktop = useMediaQuery(`(min-width: ${DESKTOP_BREAKPOINT})`);
  const { t } = useLanguage();

  const preventImgDrag = (e) => {
    e.preventDefault();
  };

  return (
    <article
      data-card
      onClick={onClick}
      className={cn(
        "group shrink-0 cursor-pointer bg-white",
        "w-[260px] md:w-[300px] lg:w-[300px]",
        isDesktop
          ? "transition-all duration-200 ease-out lg:hover:scale-[1.02]"
          : "transition-none active:scale-100",
      )}
      style={
        !isDesktop
          ? { WebkitTapHighlightColor: "transparent", outline: "none" }
          : undefined
      }
      tabIndex={!isDesktop ? -1 : undefined}
    >
      <div className="relative h-[340px] w-full overflow-hidden">
        <img
          src={category.image}
          alt={category.title}
          draggable={false}
          onDragStart={preventImgDrag}
          className="absolute inset-0 h-full w-full select-none object-cover"
          loading="lazy"
          onLoad={onMediaReady}
        />

        {isDesktop ? (
          <div className="pointer-events-none absolute inset-0 bg-black/55 opacity-0 transition-opacity duration-200 ease-out lg:group-hover:opacity-100" />
        ) : null}

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="flex h-16 items-center justify-center bg-black/55 backdrop-blur-md">
            <p className="font-display text-[16px] text-white/95">
              {t[category.id] || category.title}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
