import {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import IconButton from "@/components/ui/IconButton";
import FullWidthDivider from "@/components/ui/FullWidthDivider";

import arrowLeft from "@/assets/ui/arrow-left.svg";
import arrowRight from "@/assets/ui/arrow-right.svg";

const NAV_BUTTON_CLASS = `h-10 w-10 bg-[#F5F5F5] flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105 disabled:opacity-40 disabled:transition-none disabled:hover:transform-none`;

const GAP_PX = 16;

const INITIAL_RENDER_COUNT = 10;
const RENDER_BATCH = 8;
const LOAD_AHEAD_PX = 900;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function HorizontalSliderSection({
  title,
  children,

  leftWidthPx = 260,
  titleDesktopClass = "font-display text-[56px] font-medium leading-none",
  titleMobileClass = "font-display text-[40px] font-medium leading-none",

  fullBleed = true,
  outerPxClass = "px-6",
  sectionClassName = "py-8 pb-6",
  trackClassName = "flex gap-4",

  headerMobileRightSlot = null,
  leftBottomSlot = null,
  mobileBottomSlot = null,

  showDivider = true,
  dividerClassName = "",
  emptyText = "No items available at the moment.",
}) {
  const scrollerRef = useRef(null);
  const trackRef = useRef(null);

  const rafRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const [stepPx, setStepPx] = useState(320);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const childArray = useMemo(() => Children.toArray(children), [children]);
  const isEmpty = childArray.length === 0;

  const [renderCount, setRenderCount] = useState(INITIAL_RENDER_COUNT);

  const visibleChildren = useMemo(() => {
    return childArray.slice(0, Math.min(renderCount, childArray.length));
  }, [childArray, renderCount]);

  const getEndPaddingPx = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return 0;
    const styles = window.getComputedStyle(el);
    const pr = parseFloat(styles.paddingRight || "0") || 0;
    return pr;
  }, []);

  const calcStep = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector("[data-card]");
    if (!firstCard) return;

    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || GAP_PX;

    const w = firstCard.getBoundingClientRect().width;
    if (!Number.isFinite(w) || w <= 0) return;

    setStepPx(w + gap);
  }, []);

  const calcButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const endPad = getEndPaddingPx();
    const max = Math.max(0, el.scrollWidth - el.clientWidth - endPad);
    const left = el.scrollLeft;

    setCanPrev(left > 1);
    setCanNext(left < max - 1);
  }, [getEndPaddingPx]);

  const recalcAll = useCallback(() => {
    requestAnimationFrame(() => {
      calcStep();
      calcButtons();
    });
  }, [calcStep, calcButtons]);

  const cancelAnimation = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    isAnimatingRef.current = false;
  }, []);

  const animateScrollTo = useCallback(
    (targetLeft, duration = 560) => {
      const el = scrollerRef.current;
      if (!el) return;

      cancelAnimation();
      isAnimatingRef.current = true;

      const start = el.scrollLeft;
      const change = targetLeft - start;
      const startTime = performance.now();

      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      const tick = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(t);

        el.scrollLeft = start + change * eased;

        calcButtons();

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          rafRef.current = 0;
          isAnimatingRef.current = false;
          calcButtons();
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [calcButtons, cancelAnimation],
  );

  const scrollByStep = useCallback(
    (dir) => {
      const el = scrollerRef.current;
      if (!el) return;

      const endPad = getEndPaddingPx();
      const max = Math.max(0, el.scrollWidth - el.clientWidth - endPad);

      const fallback = Math.max(240, Math.floor(el.clientWidth * 0.85));
      const step = stepPx > 10 ? stepPx : fallback;

      const target = clamp(el.scrollLeft + dir * step, 0, max);

      animateScrollTo(target, 560);
    },
    [stepPx, animateScrollTo, getEndPaddingPx],
  );

  const handlePrev = useCallback(() => scrollByStep(-1), [scrollByStep]);
  const handleNext = useCallback(() => scrollByStep(1), [scrollByStep]);

  const maybeLoadMore = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    if (renderCount >= childArray.length) return;

    const endPad = getEndPaddingPx();
    const max = Math.max(0, el.scrollWidth - el.clientWidth - endPad);
    const left = el.scrollLeft;

    const distanceToEnd = max - left;

    if (distanceToEnd < LOAD_AHEAD_PX) {
      setRenderCount((prev) =>
        Math.min(prev + RENDER_BATCH, childArray.length),
      );
    }
  }, [renderCount, childArray.length, getEndPaddingPx]);

  useEffect(() => {
    if (isEmpty) return;

    const el = scrollerRef.current;
    if (!el) return;

    recalcAll();

    const onScroll = () => {
      if (!isAnimatingRef.current) calcButtons();
      maybeLoadMore();
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => recalcAll());
    ro.observe(el);
    if (trackRef.current) ro.observe(trackRef.current);

    window.addEventListener("resize", recalcAll);

    requestAnimationFrame(() => maybeLoadMore());

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", recalcAll);
      ro.disconnect();
      cancelAnimation();
    };
  }, [isEmpty, recalcAll, calcButtons, cancelAnimation, maybeLoadMore]);

  if (isEmpty) {
    return (
      <section className="px-4 pb-6 py-8 border-b border-black lg:px-0">
        <p className="text-center text-gray-500">{emptyText}</p>
      </section>
    );
  }

  const sectionWrapClassName = fullBleed
    ? [
        sectionClassName,
        "relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen",
      ].join(" ")
    : sectionClassName;

  return (
    <>
      <section className={sectionWrapClassName}>
        <div className={outerPxClass}>
          <div
            className="relative lg:grid lg:items-start lg:gap-6"
            style={{ gridTemplateColumns: `${leftWidthPx}px minmax(0, 1fr)` }}
          >
            {/* LEFT (desktop) */}
            <div className="hidden lg:flex lg:flex-col lg:items-start lg:gap-14 relative z-20">
              <h2 className={titleDesktopClass}>{title}</h2>

              <div className="flex gap-3">
                <IconButton
                  variant="nav"
                  icon={arrowLeft}
                  onClick={handlePrev}
                  disabled={!canPrev}
                  aria-label="Previous"
                  className={NAV_BUTTON_CLASS}
                  iconClassName="h-4 w-4"
                />
                <IconButton
                  variant="nav"
                  icon={arrowRight}
                  onClick={handleNext}
                  disabled={!canNext}
                  aria-label="Next"
                  className={NAV_BUTTON_CLASS}
                  iconClassName="h-4 w-4"
                />
              </div>

              {leftBottomSlot}
            </div>

            {/* RIGHT */}
            <div className="relative z-10 min-w-0">
              <div className="mb-4 flex items-start justify-between lg:hidden">
                <h2 className={titleMobileClass}>{title}</h2>

                {headerMobileRightSlot ?? (
                  <div className="flex gap-3">
                    <IconButton
                      variant="nav"
                      icon={arrowLeft}
                      onClick={handlePrev}
                      disabled={!canPrev}
                      aria-label="Previous"
                      className={NAV_BUTTON_CLASS}
                      iconClassName="h-4 w-4"
                    />
                    <IconButton
                      variant="nav"
                      icon={arrowRight}
                      onClick={handleNext}
                      disabled={!canNext}
                      aria-label="Next"
                      className={NAV_BUTTON_CLASS}
                      iconClassName="h-4 w-4"
                    />
                  </div>
                )}
              </div>

              <div
                ref={scrollerRef}
                className="hs-hide-scrollbar overflow-x-auto overflow-y-hidden w-full min-w-0 pr-8"
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                onPointerDown={cancelAnimation}
                onWheel={cancelAnimation}
                onTouchStart={cancelAnimation}
              >
                <style>{`
                  .hs-hide-scrollbar::-webkit-scrollbar { display: none; }
                `}</style>

                <div
                  ref={trackRef}
                  className={["w-max", trackClassName].join(" ")}
                >
                  {visibleChildren}
                </div>
              </div>

              {mobileBottomSlot}
            </div>
          </div>
        </div>
      </section>

      {showDivider ? <FullWidthDivider className={dividerClassName} /> : null}
    </>
  );
}
