import { Link } from "react-router-dom";
import ArrowUpRight from "@/assets/ui/arrow-up-right.svg";

export default function BestSellersIntro() {
  return (
    <section className="px-5 pt-8 pb-6 md:px-10 md:pt-10 md:pb-8 lg:px-16 lg:pt-12 lg:pb-10">
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="font-display text-[40px] leading-[1.1] tracking-[-0.015em] text-black md:text-[44px] lg:text-[48px]">
          Best sellers
        </h2>

        <p className="mx-auto mt-4 max-w-[60ch] text-[15px] leading-[1.8] text-black/75 md:mt-5 md:text-[16px]">
          Every piece of our jewelry is created to capture a feeling — love,
          beauty, and timeless elegance. Crafted with exquisite detail and the
          finest materials, each design is meant to be cherished. Here, luxury
          becomes part of your story.
        </p>
      </div>

      <Link
        to="/collections?filter=best-sellers&page=1"
        className="ui-interact mt-6 mx-auto flex w-full max-w-[320px] cursor-pointer items-center justify-center gap-2 bg-black px-6 py-4 text-[14px] text-white md:mt-8"
      >
        <span>Shop now</span>
        <img
          src={ArrowUpRight}
          alt=""
          className="h-3 w-3 invert"
          aria-hidden="true"
        />
      </Link>
    </section>
  );
}
