import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";

// HERO images
import heroDesktop from "@/assets/images/about-studio/about-studio-hero-desktop.webp";
import heroTablet from "@/assets/images/about-studio/about-studio-hero-tablet.webp";
import heroMobile from "@/assets/images/about-studio/about-studio-hero-mobile.webp";

// LOGO
import logoDesktop from "@/assets/graphics/about-studio/about-studio-desktop-logo.svg";
import logoTablet from "@/assets/graphics/about-studio/about-studio-tablet-logo.svg";
import logoMobile from "@/assets/graphics/about-studio/about-studio-mobile-logo.svg";

// BLUR LINE
import blurLineTablet from "@/assets/graphics/about-studio/about-studio-tablet-blur-line.svg";
import blurLineDesktop from "@/assets/graphics/about-studio/about-studio-desktop-blur-line.svg";

export default function AboutStudioSection({ text }) {
  const { t } = useLanguage();

  const finalText = text || t.aboutStudioText;

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      <div className="mt-4 w-full px-6">
        <div className="relative overflow-visible border border-black">
          {/* ================= TABLET + DESKTOP ================= */}
          <div className="relative hidden md:grid md:grid-cols-2">
            {/* LEFT (HERO) */}
            <div className="relative h-[360px] overflow-hidden lg:h-[420px]">
              <picture>
                <source srcSet={heroDesktop} media="(min-width:1024px)" />
                <img
                  src={heroTablet}
                  alt={t.aboutStudioImageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </picture>

              <div className="pointer-events-none absolute inset-y-0 right-0 w-[220px] bg-gradient-to-r from-transparent to-black" />
            </div>

            {/* RIGHT (BLACK PANEL) */}
            <div className="relative h-[360px] bg-black text-white lg:h-[420px]">
              <div className="absolute bottom-10 right-10 z-30 text-right lg:right-12">
                <div className="ml-auto mb-6 h-[2.5px] w-20 bg-white/80" />

                <p className="max-w-[520px] font-ui text-[15px] leading-[1.55] text-white/90 lg:text-[16px]">
                  {finalText}
                </p>
              </div>
            </div>

            {/* LOGO */}
            <picture className="pointer-events-none">
              <source srcSet={logoDesktop} media="(min-width:1024px)" />
              <img
                src={logoTablet}
                alt={t.studioLogoAlt}
                className="
                  absolute
                  top-[-6px]
                  right-[-5px]
                  z-20
                  w-[560px]
                  max-w-none
                  select-none
                  lg:top-[-10px]
                  lg:right-[-6px]
                  lg:w-[960px]
                "
                loading="lazy"
                decoding="async"
              />
            </picture>

            {/* BLUR LINE */}
            <picture className="pointer-events-none">
              <source srcSet={blurLineDesktop} media="(min-width:1024px)" />
              <img
                src={blurLineTablet}
                alt=""
                aria-hidden
                className="
                  absolute
                  top-[3.5rem]
                  right-0
                  z-10
                  w-[570px]
                  max-w-none
                  select-none
                  lg:top-[6rem]
                  lg:w-[980px]
                "
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>

          {/* ================= MOBILE ================= */}
          <div className="md:hidden">
            <div className="relative">
              <img
                src={heroMobile}
                alt={t.aboutStudioImageAlt}
                className="block h-[22rem] w-full object-cover"
                loading="lazy"
                decoding="async"
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[240px] bg-gradient-to-t from-black via-black/80 to-transparent" />
            </div>

            <div className="relative bg-black px-8 pb-12 pt-20">
              <div className="pointer-events-none absolute inset-x-0 -top-14 h-14 bg-gradient-to-t from-black to-transparent" />

              <img
                src={logoMobile}
                alt={t.studioLogoAlt}
                className="absolute left-0 -top-[3.5rem] z-10 w-full px-2"
                loading="lazy"
                decoding="async"
              />

              <div className="ml-auto max-w-[420px] text-right">
                <div className="ml-auto mb-6 h-[3px] w-12 bg-white/80" />

                <p className="font-ui text-[15px] leading-[1.55] text-white/90">
                  {finalText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FullWidthDivider className="mt-4" />
    </section>
  );
}
