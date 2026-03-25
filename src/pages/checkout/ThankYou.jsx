import { useLocation, useNavigate } from "react-router-dom";
import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";

// HERO images
import heroDesktop from "@/assets/images/about-studio/about-studio-hero-desktop.webp";
import heroTablet from "@/assets/images/about-studio/about-studio-hero-tablet.webp";
import heroMobile from "@/assets/images/about-studio/about-studio-hero-mobile.webp";

// UI
import backArrow from "@/assets/ui/back-arrow.svg";
import OurSalons from "../about/OurSalons";

export default function ThankYou() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const deliveryType = location.state?.deliveryType || "ship";
  const pickupLocation = location.state?.pickupLocation || null;
  const email = location.state?.email || "";
  const orderId = location.state?.orderId || null;

  const pickupLocationLabel =
    pickupLocation === "vilnius"
      ? t.checkoutThankYou.pickupLocations.vilnius
      : pickupLocation === "kaunas"
        ? t.checkoutThankYou.pickupLocations.kaunas
        : t.checkoutThankYou.pickupLocations.default;

  const message =
    deliveryType === "pickup"
      ? t.checkoutThankYou.pickupMessage.replace(
          "{pickupLocation}",
          pickupLocationLabel,
        )
      : t.checkoutThankYou.shippingMessage;

  return (
    <>
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <div className="mt-4 w-full px-6">
          <div className="relative overflow-hidden border border-black">
            <div className="hidden md:grid md:grid-cols-2">
              <div className="relative h-[360px] overflow-hidden lg:h-[420px]">
                <picture>
                  <source srcSet={heroDesktop} media="(min-width:1024px)" />
                  <img
                    src={heroTablet}
                    alt={t.checkoutThankYou.imageAlt}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>

                <div className="pointer-events-none absolute inset-y-0 right-0 w-[220px] bg-gradient-to-r from-transparent to-black" />
              </div>

              <div className="flex h-[360px] items-center bg-black text-white lg:h-[420px]">
                <div className="w-full px-10 text-right lg:px-12">
                  <h1 className="mb-4 font-display text-[32px] leading-tight lg:text-[40px]">
                    {t.checkoutThankYou.title}
                  </h1>

                  {orderId && (
                    <p className="mb-3 font-ui text-[13px] text-white/60 lg:text-[14px]">
                      {t.checkoutThankYou.orderIdLabel}: #{orderId}
                    </p>
                  )}

                  <p className="mb-3 font-ui text-[14px] leading-[1.6] text-white/80 lg:text-[15px]">
                    {message}
                  </p>

                  {email ? (
                    <p className="mb-8 font-ui text-[13px] text-white/60 lg:text-[14px]">
                      {t.checkoutThankYou.confirmationEmailLabel}: {email}
                    </p>
                  ) : (
                    <div className="mb-8" />
                  )}

                  <button
                    type="button"
                    onClick={() => navigate("/collections")}
                    className={[
                      "group",
                      "ml-auto w-full max-w-[420px] h-[52px]",
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
                      className="h-4 w-4 invert transition duration-200 group-hover:invert-0"
                    />
                    <span>{t.checkoutThankYou.backToShopping}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="md:hidden">
              <div className="relative">
                <img
                  src={heroMobile}
                  alt={t.checkoutThankYou.imageAlt}
                  className="block h-[22rem] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[240px] bg-gradient-to-t from-black via-black/80 to-transparent" />
              </div>

              <div className="bg-black px-6 pt-12 pb-10 text-center text-white">
                <h1 className="mb-4 font-display text-[28px] leading-tight">
                  {t.checkoutThankYou.title}
                </h1>

                {orderId && (
                  <p className="mb-3 font-ui text-[13px] text-white/60">
                    {t.checkoutThankYou.orderIdLabel}: #{orderId}
                  </p>
                )}

                <p className="mb-3 font-ui text-[14px] leading-[1.6] text-white/80">
                  {message}
                </p>

                {email ? (
                  <p className="mb-6 font-ui text-[13px] leading-[1.5] text-white/60">
                    {t.checkoutThankYou.confirmationEmailLabel}: {email}
                  </p>
                ) : (
                  <div className="mb-6" />
                )}

                <button
                  type="button"
                  onClick={() => navigate("/collections")}
                  className={[
                    "group",
                    "mx-auto block",
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
                  <span>{t.checkoutThankYou.backToShopping}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FullWidthDivider className="mt-4" />

      <OurSalons />
      <FullWidthDivider />
    </>
  );
}
