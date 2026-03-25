import { Link } from "react-router-dom";

import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import OurSalons from "./about/OurSalons";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <>
      <main className="mx-auto w-full max-w-[1400px] px-4 py-10 md:px-8 md:py-14 lg:px-10 lg:py-16">
        <section className="overflow-hidden border border-black bg-white">
          <div className="grid min-h-[520px] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-between border-b border-black px-6 py-8 md:px-10 md:py-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
              <div>
                <p className="font-ui text-[12px] uppercase tracking-[0.18em] text-black/55 md:text-[13px]">
                  {t.pageNotFound}
                </p>

                <h1 className="mt-4 font-display text-[88px] leading-none md:text-[120px] lg:text-[150px]">
                  404
                </h1>

                <div className="mt-6 h-px w-16 bg-black/70 md:w-24" />

                <h2 className="mt-6 max-w-[12ch] font-display text-[30px] leading-[0.95] md:text-[42px] lg:text-[52px]">
                  {t.thisPageDoesNotExist}
                </h2>

                <p className="mt-5 max-w-[42ch] font-ui text-[14px] leading-[1.65] text-black/70 md:text-[15px]">
                  {t.notFoundText}
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/"
                  className="inline-flex min-h-[52px] items-center justify-center border border-black bg-black px-6 text-center font-ui text-[14px] text-white transition-all duration-300 hover:bg-black/90"
                >
                  {t.backToHome}
                </Link>

                <Link
                  to="/collections"
                  className="inline-flex min-h-[52px] items-center justify-center border border-black bg-white px-6 text-center font-ui text-[14px] text-black transition-all duration-300 hover:-translate-y-[1px]"
                >
                  {t.viewCollections}
                </Link>
              </div>
            </div>

            <div className="relative flex items-end bg-black px-6 py-8 text-white md:px-10 md:py-10 lg:px-12 lg:py-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />

              <div className="relative z-10 ml-auto max-w-[420px] text-right">
                <p className="font-ui text-[12px] uppercase tracking-[0.18em] text-white/60 md:text-[13px]">
                  UM STUDIO
                </p>

                <p className="mt-5 font-display text-[28px] leading-[1.02] md:text-[36px] lg:text-[42px]">
                  {t.discoverJewelryThatStays}
                </p>

                <p className="mt-4 font-ui text-[14px] leading-[1.65] text-white/75 md:text-[15px]">
                  {t.notFoundSideText}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FullWidthDivider />
      <OurSalons />
    </>
  );
}
