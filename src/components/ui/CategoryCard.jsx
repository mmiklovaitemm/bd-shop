export default function CategoryCard({ category, onClick, onMediaReady }) {
  return (
    <article
      data-card
      onClick={onClick}
      className="
        group bg-white shrink-0 cursor-pointer
        w-[260px] md:w-[300px] lg:w-[300px]
        transition-transform duration-200 ease-out
        hover:scale-[1.02]
      "
    >
      <div className="relative w-full h-[340px] overflow-hidden">
        <img
          src={category.image}
          alt={category.title}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          onLoad={onMediaReady}
        />

        {/* Hover dark overlay (kaip ProductCard) */}
        <div className="pointer-events-none absolute inset-0 bg-black/55 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />

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
