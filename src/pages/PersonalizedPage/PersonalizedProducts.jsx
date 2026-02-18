import FullWidthDivider from "@/components/ui/FullWidthDivider";
import HowItWorksHero from "./HowItWorksHero";
import HowItWorksSteps from "./HowItWorksSteps";
import BestSellersIntro from "../AboutUs/BestSellersIntro";

export default function PersonalizedProducts() {
  return (
    <>
      <section className="px-2 pt-3 pb-3 sm:pt-6 sm:pb-4 lg:pt-8 lg:pb-6">
        {/* MOBILE */}
        <div className="sm:hidden">
          <h1 className="text-4xl leading-tight font-display mb-6">
            Personalized <br /> products
          </h1>

          <div className="w-24 h-px bg-black" />

          <h2 className="mt-3 mb-3 text-3xl font-display">How it works</h2>
        </div>

        {/* TABLET + DESKTOP */}
        <div className="hidden sm:flex items-baseline justify-center gap-6 lg:gap-16">
          <h1 className="font-display leading-none text-3xl lg:text-4xl whitespace-nowrap">
            Personalized products
          </h1>

          <div
            className="h-px w-[100px] lg:w-72 bg-black translate-y-[-0.45em]"
            aria-hidden="true"
          />

          <h2 className="font-display leading-none text-2xl lg:text-3xl whitespace-nowrap">
            How it works
          </h2>
        </div>
      </section>

      <FullWidthDivider />

      <HowItWorksHero />
      <FullWidthDivider className="mt-6" />

      <HowItWorksSteps />

      <BestSellersIntro
        title="Are You Ready?"
        to="/collections?filter=personal&page=1"
      />
      <FullWidthDivider className="mt-4" />
    </>
  );
}
