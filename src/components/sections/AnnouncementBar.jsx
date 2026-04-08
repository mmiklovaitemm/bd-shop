import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import preventDragHandler from "@/utils/preventDrag";
import useLanguage from "@/context/useLanguage";

import warrantyIcon from "@/assets/ui/warranty.svg";
import returnIcon from "@/assets/ui/return-box.svg";
import deliveryIcon from "@/assets/ui/delivery.svg";
import qualityIcon from "@/assets/ui/star.svg";

export default function AnnouncementBar() {
  const { t } = useLanguage();

  const items = useMemo(
    () => [
      { icon: warrantyIcon, text: t.warranty },
      { icon: qualityIcon, text: t.highQuality },
      { icon: deliveryIcon, text: t.fastDelivery },
      { icon: returnIcon, text: t.return90Days },
    ],
    [t],
  );

  const [index, setIndex] = useState(0);

  // Mobile rotation logic
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    if (mq.matches) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3000);

    return () => clearInterval(id);
  }, [items.length]);

  // Duplicating items for seamless infinite loop on desktop
  const marqueeItems = [...items, ...items, ...items, ...items];

  return (
    <div className="bg-black text-white overflow-hidden border-b border-white/10">
      {/* MOBILE & TABLET: Fade rotation */}
      <div className="mx-auto flex h-[40px] items-center justify-center gap-2 px-4 font-ui text-[12px] font-normal lg:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <img
              src={items[index].icon}
              alt=""
              className="h-[14px] w-auto invert opacity-90"
            />
            <span className="tracking-wide uppercase text-[10px]">
              {items[index].text}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* DESKTOP: Infinite Marquee */}
      <div className="hidden h-[40px] items-center lg:flex relative">
        <motion.div
          className="flex whitespace-nowrap gap-24"
          animate={{
            x: [0, -1035],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
          style={{ width: "fit-content" }}
        >
          {marqueeItems.map((it, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-4 opacity-80 hover:opacity-100 transition-opacity cursor-default"
            >
              <img
                src={it.icon}
                alt=""
                className="h-[14px] w-auto invert"
                draggable={false}
                onDragStart={preventDragHandler}
              />
              <span className="font-ui text-[11px] uppercase tracking-[0.15em] whitespace-nowrap">
                {it.text}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Gradient fade on edges for smoother look */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />
      </div>
    </div>
  );
}
