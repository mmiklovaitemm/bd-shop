import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import HowItWorksSteps from "./HowItWorksSteps";
import BestSellersIntro from "../about/BestSellersIntro";

export default function PersonalizedProducts() {
  const { t } = useLanguage();

  return (
    <>
      <section className="px-2 pt-3 pb-3 sm:pt-6 sm:pb-4 lg:pt-8 lg:pb-6">
        <div className="sm:hidden">
          <h1 className="mb-6 font-display text-4xl leading-tight">
            {t.personalized.productsTitleLine1} <br />
            {t.personalized.productsTitleLine2}
          </h1>

          <div className="h-px w-24 bg-black" />

          <h2 className="mt-3 mb-3 font-display text-3xl">
            {t.personalized.howItWorks}
          </h2>
        </div>

        <div className="hidden items-baseline justify-center gap-6 sm:flex lg:gap-16">
          <h1 className="whitespace-nowrap font-display text-3xl leading-none lg:text-4xl">
            {t.personalized.productsTitle}
          </h1>

          <div
            className="h-px w-[100px] translate-y-[-0.45em] bg-black lg:w-72"
            aria-hidden="true"
          />

          <h2 className="whitespace-nowrap font-display text-2xl leading-none lg:text-3xl">
            {t.personalized.howItWorks}
          </h2>
        </div>
      </section>

      <FullWidthDivider />

      <HowItWorksSteps />

      <BestSellersIntro
        title={t.personalized.readyTitle}
        to="/collections?filter=personal&page=1"
      />
      <FullWidthDivider className="mt-4" />
    </>
  );
}
