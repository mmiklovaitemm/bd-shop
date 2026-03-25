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
          <span className="font-semibold font-display">
            {t.personalized.steps.step2.shippingTitle}
          </span>
          <br />
          {t.personalized.steps.step2.shippingText}
          <br />
          <br />
          <span className="font-semibold font-display">
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
    <section className="px-0 lg:px-10">
      {STEPS.map((step, index) => {
        const rowDirection = step.reverseOnTablet
          ? "sm:flex-row-reverse"
          : "sm:flex-row";

        return (
          <div key={step.number}>
            <article
              className={`sm:flex ${rowDirection} sm:items-stretch sm:gap-8 lg:gap-12 mb-10 sm:mb-2 sm:py-10`}
            >
              <div className={`sm:w-1/2 ${index === 0 ? "mt-6 sm:mt-0" : ""}`}>
                <div className="overflow-hidden -mx-4 sm:mx-0">
                  <img
                    src={step.image}
                    alt={step.alt}
                    className="w-full object-cover h-[300px] sm:h-[320px] lg:h-[420px]"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="mt-5 sm:mt-0 sm:w-1/2 flex flex-col justify-center px-2 sm:px-0">
                <h3 className="font-display text-[32px] leading-[1.05] tracking-[-0.02em] lg:text-[42px]">
                  <span className="mr-2">{step.number}</span>
                  {step.title}
                </h3>

                <p className="mt-3 text-[14px] font-ui leading-relaxed text-black/80 lg:text-[14px] max-w-prose">
                  {step.text}
                </p>
              </div>
            </article>

            <FullWidthDivider />
          </div>
        );
      })}
    </section>
  );
}
