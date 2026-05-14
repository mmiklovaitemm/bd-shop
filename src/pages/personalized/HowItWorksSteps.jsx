import { motion } from "framer-motion";
import { Reveal } from "@/components/sections/Reveal";
import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";

import Step1 from "@/assets/images/personalized-jewelry/1-choose-jewellery.webp";
import Step2 from "@/assets/images/personalized-jewelry/2-add-print.webp";
import Step3 from "@/assets/images/personalized-jewelry/3-take-your-jewellery.webp";

export default function HowItWorksSteps() {
  const { t } = useLanguage();

  const STEPS = [
    {
      number: "1.",
      title: t.personalized.steps.step1.title,
      text: t.personalized.steps.step1.text,
      image: Step1,
      alt: t.personalized.steps.step1.alt,
      reverseOnTablet: false,
    },
    {
      number: "2.",
      title: t.personalized.steps.step2.title,
      text: (
        <>
          <span className="font-semibold font-display text-black">
            {t.personalized.steps.step2.shippingTitle}
          </span>
          <br />
          {t.personalized.steps.step2.shippingText}
          <br />
          <br />
          <span className="font-semibold font-display text-black">
            {t.personalized.steps.step2.inStoreTitle}
          </span>
          <br />
          {t.personalized.steps.step2.inStoreText}
        </>
      ),
      image: Step2,
      alt: t.personalized.steps.step2.alt,
      reverseOnTablet: true,
    },
    {
      number: "3.",
      title: t.personalized.steps.step3.title,
      text: t.personalized.steps.step3.text,
      image: Step3,
      alt: t.personalized.steps.step3.alt,
      reverseOnTablet: false,
    },
  ];

  return (
    <section className="px-0 lg:px-10 overflow-hidden">
      {STEPS.map((step) => {
        const isReverse = step.reverseOnTablet;

        return (
          <div key={step.number}>
            <Reveal>
              <article
                className={`flex flex-col sm:flex-row ${
                  isReverse ? "sm:flex-row-reverse" : ""
                } sm:items-stretch sm:gap-8 lg:gap-20 py-12 sm:py-20 lg:py-28`}
              >
                <div className="sm:w-1/2">
                  <div className="overflow-hidden -mx-4 sm:mx-0 bg-neutral-100 group">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{
                        duration: 0.8,
                        ease: [0.215, 0.61, 0.355, 1],
                      }}
                      src={step.image}
                      alt={step.alt}
                      className="w-full object-cover h-[380px] sm:h-[450px] lg:h-[600px]"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="mt-8 sm:mt-0 sm:w-1/2 flex flex-col justify-center px-4 sm:px-0">
                  <div className="max-w-[520px] mx-auto sm:mx-0">
                    <span className="block font-display text-neutral-300 text-2xl lg:text-3xl mb-2 lg:mb-4">
                      {step.number}
                    </span>

                    <h3 className="font-display text-[36px] leading-[1.1] tracking-[-0.02em] lg:text-[52px] xl:text-[60px] text-black">
                      {step.title}
                    </h3>

                    <div className="mt-6 lg:mt-8 h-px w-10 bg-black/20" />

                    <p className="mt-6 lg:mt-8 text-[15px] font-ui leading-relaxed text-black/70 lg:text-[16px]">
                      {step.text}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>

            <FullWidthDivider />
          </div>
        );
      })}
    </section>
  );
}
