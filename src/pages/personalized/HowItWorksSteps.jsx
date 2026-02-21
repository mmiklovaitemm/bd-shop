import FullWidthDivider from "@/components/ui/FullWidthDivider";

import Step1 from "@/assets/images/personalized-jewelry/1-choose-jewellery.webp";
import Step2 from "@/assets/images/personalized-jewelry/2-add-print.webp";
import Step3 from "@/assets/images/personalized-jewelry/3-take-your-jewellery.webp";

const STEPS = [
  {
    number: "1.",
    title: "Choose Jewellery",
    text: "Select your preferred piece from our collection of rings and necklaces. Choose the material — gold or silver — and the size that fits you best.",
    image: Step1,
    alt: "Choose jewellery",
    reverseOnTablet: false,
  },
  {
    number: "2.",
    title: "Add Your Personal Touch",
    text: (
      <>
        <span className="font-semibold font-display">Shipping option:</span>
        <br />
        Complete your order and we will send you a kit to capture the print you
        would like engraved on your jewellery. Once ready, send it back to us
        and we will begin crafting your personalized piece.
        <br />
        <br />
        <span className="font-semibold font-display">In-store option:</span>
        <br />
        Visit our store and we will take the print on-site. After that, simply
        wait while we carefully engrave it onto your selected jewellery. You can
        choose to have it shipped to you or collect it in person.
      </>
    ),
    image: Step2,
    alt: "Add print",
    reverseOnTablet: true,
  },
  {
    number: "3.",
    title: "Receive Your Jewellery",
    text: "Once your piece is ready, we will carefully package and ship it to you — or you can pick it up from our store. Your personalized jewellery is now ready to be worn and treasured.",
    image: Step3,
    alt: "Take your jewellery",
    reverseOnTablet: false,
  },
];

export default function HowItWorksSteps() {
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
              {/* IMAGE */}
              <div
                className={`
                  sm:w-1/2
                  ${index === 0 ? "mt-6 sm:mt-0" : ""}
                `}
              >
                <div className="overflow-hidden -mx-4 sm:mx-0">
                  <img
                    src={step.image}
                    alt={step.alt}
                    className="
                      w-full object-cover
                      h-[300px]
                      sm:h-[320px]
                      lg:h-[420px]
                    "
                    loading="lazy"
                  />
                </div>
              </div>

              {/* TEXT */}
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
