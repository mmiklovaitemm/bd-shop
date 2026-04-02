// src/pages/PersonalizedProducts.jsx
import { motion } from "framer-motion";
import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import HowItWorksSteps from "./HowItWorksSteps";
import BestSellersIntro from "../about/BestSellersIntro";
import { Reveal } from "@/components/sections/Reveal";

export default function PersonalizedProducts() {
  const { t } = useLanguage();

  return (
    <>
      <section className="px-2 py-4 lg:py-8">
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

      <section className="py-6">
        <Reveal>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: false }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
            className="flex flex-col items-center"
          >
            <BestSellersIntro
              title={t.personalized.readyTitle}
              to="/collections?filter=personal&page=1"
            />
          </motion.div>
        </Reveal>
      </section>

      <FullWidthDivider className="mt-4" />
    </>
  );
}
