import { useNavigate } from "react-router-dom";
import FullWidthDivider from "@/components/ui/FullWidthDivider";

// HERO images
import heroDesktop from "@/assets/images/about-studio/about-studio-hero-desktop.webp";
import heroTablet from "@/assets/images/about-studio/about-studio-hero-tablet.webp";
import heroMobile from "@/assets/images/about-studio/about-studio-hero-mobile.webp";

// UI
import backArrow from "@/assets/ui/back-arrow.svg";

export default function ThankYou() {
  const navigate = useNavigate();

  return (
    <>
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <div className="w-full mt-4 px-6">
          <div className="border border-black overflow-hidden relative">
            {/* ================= DESKTOP / TABLET ================= */}
            <div className="hidden md:grid md:grid-cols-2">
              {/* LEFT IMAGE */}
              <div className="relative h-[360px] lg:h-[420px] overflow-hidden">
                <picture>
                  <source srcSet={heroDesktop} media="(min-width:1024px)" />
                  <img
                    src={heroTablet}
                    alt="Thank you"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>

                <div className="pointer-events-none absolute inset-y-0 right-0 w-[220px] bg-gradient-to-r from-transparent to-black" />
              </div>

              {/* RIGHT CONTENT */}
              <div className="bg-black h-[360px] lg:h-[420px] text-white flex items-center">
                <div className="w-full px-10 lg:px-12 text-right">
                  <h1 className="font-display text-[32px] lg:text-[40px] leading-tight mb-4">
                    Thank you for your purchase!
                  </h1>

                  <p className="font-ui text-white/80 text-[14px] lg:text-[15px] leading-[1.6] mb-8">
                    We will send all information to your email.
                    <br />
                    Wait for you soon!
                  </p>

                  {/* BUTTON (match design) */}
                  <button
                    type="button"
                    onClick={() => navigate("/collections")}
                    className={[
                      "group",
                      "w-full max-w-[420px] h-[52px]",
                      "border border-white/70 bg-white/10",
                      "flex items-center justify-center gap-4",
                      "font-ui text-[14px] tracking-wide text-white",
                      "transition-colors duration-200",
                      "hover:bg-white hover:text-black",
                      "ml-auto md:ml-auto",
                    ].join(" ")}
                  >
                    <img
                      src={backArrow}
                      alt=""
                      className="h-4 w-4 invert transition duration-200 group-hover:invert-0"
                    />
                    <span>Go back shopping</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ================= MOBILE ================= */}
            <div className="md:hidden">
              {/* IMAGE */}
              <div className="relative">
                <img
                  src={heroMobile}
                  alt="Thank you"
                  className="block w-full h-[22rem] object-cover"
                  loading="lazy"
                  decoding="async"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[240px] bg-gradient-to-t from-black via-black/80 to-transparent" />
              </div>

              {/* CONTENT */}
              <div className="bg-black px-6 pt-12 pb-10 text-white text-center">
                <h1 className="font-display text-[28px] leading-tight mb-4">
                  Thank you for your purchase!
                </h1>

                <p className="font-ui text-white/80 text-[14px] leading-[1.6] mb-6">
                  We will send all information to your email.
                  <br />
                  Wait for you soon!
                </p>

                {/* BUTTON */}
                <button
                  type="button"
                  onClick={() => navigate("/collections")}
                  className={[
                    "group",
                    "block mx-auto",
                    "w-full max-w-[420px] h-[52px]",
                    "border border-white/70 bg-white/10",
                    "flex items-center justify-center gap-4",
                    "font-ui text-[14px] tracking-wide text-white",
                    "transition-colors duration-200",
                    "hover:bg-white hover:text-black",
                  ].join(" ")}
                >
                  <img
                    src={backArrow}
                    alt=""
                    className="h-3 w-3 invert transition duration-200 group-hover:invert-0"
                  />
                  <span>Go back shopping</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FullWidthDivider className="mt-4" />
    </>
  );
}
