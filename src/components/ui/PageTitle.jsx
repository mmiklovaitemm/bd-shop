import { Reveal } from "@/components/sections/Reveal";
import FullWidthDivider from "./FullWidthDivider";

export default function PageTitle({ title }) {
  return (
    <section className="px-6 pt-3">
      <Reveal>
        <h1 className="font-display text-[42px] leading-[1.1] tracking-tight text-black lg:text-[64px]">
          {title}
        </h1>
      </Reveal>
      <FullWidthDivider className="mt-4 mb-0" />
    </section>
  );
}
