// src/ui/SubscribeBanner.jsx
import { useCallback, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

import bannerImg from "@/assets/images/banner/banner-img.webp";
import logo from "@/assets/ui/logo.svg";

export default function SubscribeBanner({ delayMs = 3000 }) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4"
      onMouseDown={close}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="
          relative w-full border border-black/20 bg-white shadow-md
          max-w-[360px]
          sm:max-w-[520px]
          lg:max-w-[980px]
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* X close btn */}
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 text-black/60 hover:text-black transition"
          aria-label="Close"
        >
          <FiX
            size={25}
            className="lg:transition-transform lg:duration-300 lg:ease-out lg:hover:rotate-90 lg:hover:scale-110"
          />
        </button>

        {/* MOBILE + TABLET */}
        <div className="block lg:hidden">
          <div className="px-6 pt-6 pb-4 text-center sm:px-10 sm:pt-10 sm:pb-6">
            <div className="mb-3 flex justify-center">
              <img
                src={logo}
                alt="UM Studio"
                className="h-4 w-auto select-none sm:h-5"
                draggable="false"
              />
            </div>

            <h2 className="mb-2 font-display text-4xl leading-tight sm:text-5xl">
              Subscribe &amp; save
            </h2>

            <p className="mx-auto mb-5 font-ui max-w-[28ch] text-sm text-black/70 sm:text-base">
              Subscribe to our email newsletter and receive the best offers and
              discounts
            </p>

            <form
              className="mx-auto flex w-full max-w-[320px] sm:max-w-[420px]"
              onSubmit={(e) => {
                e.preventDefault();
                close();
              }}
            >
              <input
                type="email"
                required
                placeholder="Email"
                className="h-10 w-full border border-black/30 px-3 text-sm outline-none placeholder:text-black/30 sm:h-11 sm:text-base"
              />
              <button
                type="submit"
                className="
                  h-10 shrink-0 border border-black bg-black px-5 text-sm text-white font-ui
                  sm:h-11 sm:px-7 sm:text-base
                "
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="h-[220px] w-full overflow-hidden sm:h-[300px]">
            <img
              src={bannerImg}
              alt="Subscribe banner"
              className="h-full w-full select-none object-cover"
              draggable="false"
            />
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:grid lg:grid-cols-2">
          <div className="h-[420px] w-full overflow-hidden">
            <img
              src={bannerImg}
              alt="Subscribe banner"
              className="h-full w-full select-none object-cover"
              draggable="false"
            />
          </div>

          <div className="flex flex-col justify-center px-12 py-12 text-center">
            <div className="mb-4 flex justify-center">
              <img
                src={logo}
                alt="UM Studio"
                className="h-5 w-auto select-none"
                draggable="false"
              />
            </div>

            <h2 className="mb-3 font-display text-5xl leading-tight">
              Subscribe &amp; save
            </h2>

            <p className="mx-auto mb-7 font-ui max-w-[34ch] text-base text-black/70">
              Subscribe to our email newsletter and receive the best offers and
              discounts
            </p>

            <form
              className="mx-auto flex w-full max-w-[520px]"
              onSubmit={(e) => {
                e.preventDefault();
                close();
              }}
            >
              <input
                type="email"
                required
                placeholder="Email"
                className="h-11 w-full border border-black/30 px-3 text-base outline-none placeholder:text-black/30"
              />
              <button
                type="submit"
                className="
                  h-11 shrink-0 border border-black bg-black px-7 text-base text-white font-ui
                  transition
                  lg:duration-200 lg:ease-out
                  lg:hover:-translate-y-[1px] lg:hover:shadow-md
                  lg:active:translate-y-0
                "
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
