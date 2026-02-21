import { Link } from "react-router-dom";

import ArrowUpRight from "@/assets/ui/arrow-up-right.svg";

export default function TwoImageStrip({
  left,
  right,
  altLeft = "",
  altRight = "",
}) {
  return (
    <section className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-0">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* LEFT */}
        <div className="relative group overflow-hidden">
          <picture>
            <source media="(min-width: 1024px)" srcSet={left.desktop} />
            <source media="(min-width: 768px)" srcSet={left.tablet} />
            <img
              src={left.mobile}
              alt={altLeft}
              className="w-full h-full object-cover lg:transition-transform lg:duration-700 lg:ease-out lg:group-hover:scale-105"
              loading="lazy"
            />
          </picture>

          {/* Gradient overlay */}
          <div
            className="
            absolute inset-0
            bg-gradient-to-t from-black/70 via-black/35 to-transparent
            lg:from-black/0 lg:via-black/0 lg:to-transparent
            lg:group-hover:from-black/70 lg:group-hover:via-black/35
            transition-all duration-500
            "
          />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 transition-opacity duration-500 lg:opacity-0 lg:group-hover:opacity-100">
            <h3 className="font-display text-white text-[40px] leading-[1.05] tracking-[-0.02em]">
              Explore our products
            </h3>

            <Link
              to="/collections"
              className="ui-interact mt-4 inline-flex cursor-pointer items-center gap-2 self-start bg-white/10 text-white px-4 py-2 text-[14px] backdrop-blur-sm"
            >
              <span>Shop now</span>
              <img
                src={ArrowUpRight}
                alt=""
                className="h-3 w-3 invert"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative group overflow-hidden">
          <picture>
            <source media="(min-width: 1024px)" srcSet={right.desktop} />
            <source media="(min-width: 768px)" srcSet={right.tablet} />
            <img
              src={right.mobile}
              alt={altRight}
              className="w-full h-full object-cover lg:transition-transform lg:duration-700 lg:ease-out lg:group-hover:scale-105"
              loading="lazy"
            />
          </picture>

          {/* Gradient overlay */}
          <div
            className="
      absolute inset-0
      bg-gradient-to-t from-black/70 via-black/35 to-transparent
      lg:from-black/0 lg:via-black/0 lg:to-transparent
      lg:group-hover:from-black/70 lg:group-hover:via-black/35
      transition-all duration-500
    "
          />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 transition-opacity duration-500 lg:opacity-0 lg:group-hover:opacity-100">
            <h3 className="font-display text-white text-[40px] leading-[1.05] tracking-[-0.02em]">
              Personalized products
            </h3>

            <Link
              to="/personalized"
              className="ui-interact mt-4 inline-flex cursor-pointer items-center gap-2 self-start bg-white/10 text-white px-4 py-2 text-[14px] backdrop-blur-sm"
            >
              <span>Shop now</span>
              <img
                src={ArrowUpRight}
                alt=""
                className="h-3 w-3 invert"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
