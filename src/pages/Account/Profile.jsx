import AboutStudioSection from "@/components/ui/AboutStudioSection";
import FullWidthDivider from "@/components/ui/FullWidthDivider";

export default function Profile() {
  return (
    <>
      <main className="px-2 pt-3 pb-10">
        <section className="mx-auto w-full max-w-6xl">
          <h1 className="font-display text-4xl leading-none">Profile</h1>
          <FullWidthDivider className="my-4" />
          <p className="text-sm text-neutral-600">
            Placeholder. Vėliau čia bus profilio informacija ir redagavimas.
          </p>
        </section>
      </main>

      <FullWidthDivider />
      <AboutStudioSection />
    </>
  );
}
