import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";

import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import OurSalons from "./about/OurSalons";
import { Reveal } from "@/components/sections/Reveal";

import logo from "@/assets/ui/logo.svg";

// Helper for initial random position
const getRandomPos = () => Math.random() * 150;

export default function NotFound() {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const logoRef = useRef(null);

  const [initialX] = useState(getRandomPos);
  const [initialY] = useState(getRandomPos);

  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);

  const [isDragging, setIsDragging] = useState(false);

  // Slow velocity
  const velocity = useRef({ x: 0.8, y: 0.8 });

  // Animation loop
  useAnimationFrame(() => {
    if (isDragging) return;

    const container = containerRef.current;
    const element = logoRef.current;
    if (!container || !element) return;

    const cRect = container.getBoundingClientRect();
    const eRect = element.getBoundingClientRect();

    let nextX = x.get() + velocity.current.x;
    let nextY = y.get() + velocity.current.y;

    // Boundary bounce logic
    if (nextX <= 0 || nextX + eRect.width >= cRect.width) {
      velocity.current.x *= -1;
      nextX = x.get() + velocity.current.x;
    }

    if (nextY <= 0 || nextY + eRect.height >= cRect.height) {
      velocity.current.y *= -1;
      nextY = y.get() + velocity.current.y;
    }

    x.set(nextX);
    y.set(nextY);
  });

  return (
    <>
      <main className="mx-auto w-full max-w-[1400px] px-4 py-10 md:px-8 md:py-14 lg:px-10 lg:py-16">
        <section className="overflow-hidden border border-black bg-white">
          <div className="grid min-h-[600px] lg:grid-cols-[1fr_1fr]">
            {/* Content side */}
            <div className="flex flex-col justify-between border-b border-black px-6 py-8 md:px-10 md:py-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
              <div>
                <p className="font-ui text-[12px] uppercase tracking-[0.18em] text-black/55 md:text-[13px]">
                  {t.pageNotFound}
                </p>

                <h1 className="mt-4 font-display text-[100px] leading-none md:text-[140px] lg:text-[180px] select-none text-black">
                  404
                </h1>

                <h2 className="mt-6 max-w-[12ch] font-display text-[30px] leading-[0.95] md:text-[42px] lg:text-[52px]">
                  {t.thisPageDoesNotExist}
                </h2>

                <p className="mt-5 max-w-[40ch] font-ui text-[14px] leading-[1.65] text-black/70 md:text-[15px]">
                  {t.notFoundText ||
                    "The page you are looking for does not exist."}
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/"
                  className="inline-flex min-h-[52px] items-center justify-center border border-black bg-black px-8 text-center font-ui text-[14px] text-white transition-all hover:bg-white hover:text-black"
                >
                  {t.backToHome}
                </Link>
                <Link
                  to="/collections"
                  className="inline-flex min-h-[52px] items-center justify-center border border-black bg-white px-8 text-center font-ui text-[14px] text-black transition-all hover:bg-black hover:text-white"
                >
                  {t.viewCollections}
                </Link>
              </div>
            </div>

            {/* Interactive side */}
            <div
              ref={containerRef}
              className="relative bg-[#F9F9F9] overflow-hidden min-h-[400px]"
            >
              {/* Subtle background pattern */}
              <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle, black 1px, transparent 1px)`,
                  backgroundSize: "32px 32px",
                }}
              />

              {/* Bouncing Logo */}
              <motion.div
                ref={logoRef}
                drag
                dragConstraints={containerRef}
                dragElastic={0.1}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => {
                  setIsDragging(false);
                  velocity.current = { x: 0.8, y: 0.8 };
                }}
                style={{ x, y }}
                className="absolute z-20 touch-none select-none p-6 cursor-grab active:cursor-grabbing"
              >
                <img
                  src={logo}
                  alt="UM Studio Logo"
                  className="h-7 md:h-9 w-auto opacity-80"
                  draggable="false"
                />
              </motion.div>

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01),transparent)] pointer-events-none" />
            </div>
          </div>
        </section>
      </main>

      <FullWidthDivider />
      <Reveal>
        <OurSalons />
      </Reveal>
      <FullWidthDivider />
    </>
  );
}
