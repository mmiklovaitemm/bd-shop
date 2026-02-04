// src/components/TestimonialCard.jsx
export default function TestimonialCard({ testimonial, onClick }) {
  const { name, quote, rating = 5, image } = testimonial;

  return (
    <article
      data-card
      onClick={onClick}
      className="
        group bg-white shrink-0 cursor-pointer
        w-[260px] md:w-[300px] lg:w-[300px]
        transition-transform duration-200 ease-out
        will-change-transform
        hover:scale-[1.02]
      "
    >
      <div className="relative w-full h-[340px] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />

        {/* Content overlay – responsive height */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div
            className="
              bg-black/55 backdrop-blur-md
              px-6 py-5 text-white
              h-[140px] 
              flex flex-col justify-between
            "
          >
            {/* Quote with subtle fade */}
            <p
              className="font-ui text-[14px] leading-[1.45] text-white/90 overflow-hidden"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
                maskImage:
                  "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
              }}
            >
              {quote}
            </p>

            {/* Bottom row */}
            <div className="flex items-end justify-between gap-4">
              <p className="font-display text-[18px] leading-none text-white">
                {name}
              </p>

              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < rating ? "text-[#D9A441]" : "text-white/25"}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
