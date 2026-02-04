import FullWidthDivider from "@/components/ui/FullWidthDivider";

// HERO images
import heroDesktop from "@/assets/images/about-studio/about-studio-hero-desktop.jpg";
import heroTablet from "@/assets/images/about-studio/about-studio-hero-tablet.jpg";
import heroMobile from "@/assets/images/about-studio/about-studio-hero-mobile.jpg";

// LOGO
import logoDesktop from "@/assets/graphics/about-studio/about-studio-desktop-logo.svg";
import logoTablet from "@/assets/graphics/about-studio/about-studio-tablet-logo.svg";
import logoMobile from "@/assets/graphics/about-studio/about-studio-mobile-logo.svg";

// BLUR LINE
import blurLineTablet from "@/assets/graphics/about-studio/about-studio-tablet-blur-line.svg";
import blurLineDesktop from "@/assets/graphics/about-studio/about-studio-desktop-blur-line.svg";

export default function AboutStudioSection({
  text = `Every piece of our jewelry is created to capture a feeling —
love, beauty, and timeless elegance. Crafted with exquisite detail and the finest materials, each design is meant to be cherished. Here, luxury becomes part of your story.`,
}) {
  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      <div className="w-full mt-4 px-6">
        <div className="border border-black overflow-visible relative">
          {/* ================= TABLET + DESKTOP ================= */}
          <div className="hidden md:grid md:grid-cols-2 relative">
            {/* LEFT (HERO) */}
            <div className="relative h-[360px] lg:h-[420px] overflow-hidden">
              <picture>
                <source srcSet={heroDesktop} media="(min-width:1024px)" />
                <img
                  src={heroTablet}
                  alt="About our studio"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </picture>

              {/* Gradient on picture */}
              <div className="pointer-events-none absolute inset-y-0 right-0 w-[220px] bg-gradient-to-r from-transparent to-black" />
            </div>

            {/* RIGHT (BLACK PANEL) */}
            <div className="relative bg-black h-[360px] lg:h-[420px] text-white">
              <div className="absolute right-10 lg:right-12 bottom-10 text-right z-30">
                {/* Divider */}
                <div className="ml-auto mb-6 h-[2.5px] w-20 bg-white/80" />

                <p className="max-w-[520px] font-ui text-white/90 text-[15px] lg:text-[16px] leading-[1.55]">
                  {text}
                </p>
              </div>
            </div>

            {/* LOGO */}
            <picture className="pointer-events-none">
              <source srcSet={logoDesktop} media="(min-width:1024px)" />
              <img
                src={logoTablet}
                alt="Studio logo"
                className="
                  absolute
                  top-[-6px]
                  right-[-5px]
                  lg:top-[-10px]
                  lg:right-[-6px]
                  z-20
                  w-[560px]
                  lg:w-[960px]
                  max-w-none
                  select-none
                "
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
                  lg:w-[980px]
                  lg:top-[6rem]
                  max-w-none
                  select-none
                "
              />
            </picture>
          </div>

          {/* ================= MOBILE ================= */}
          <div className="md:hidden">
            {/* HERO */}
            <div className="relative">
              <img
                src={heroMobile}
                alt="About our studio"
                className="block w-full h-[22rem] object-cover"
                loading="lazy"
              />

              {/* Gradient on picture */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[240px] bg-gradient-to-t from-black via-black/80 to-transparent" />
            </div>

            {/* BLACK PANEL */}
            <div className="relative bg-black px-8 pt-20 pb-12">
              {/* Gradient on top of black panel to blend with foto */}
              <div className="pointer-events-none absolute inset-x-0 -top-14 h-14 bg-gradient-to-t from-black to-transparent" />

              {/* LOGO */}
              <img
                src={logoMobile}
                alt="Studio logo"
                className="absolute left-0 -top-[3.5rem] z-10 w-full"
              />

              <div className="max-w-[420px] ml-auto text-right">
                <div className="ml-auto mb-6 h-[3px] w-12 bg-white/80" />

                <p className="font-ui text-white/90 text-[15px] leading-[1.55]">
                  {text}
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
