import { useMemo } from "react";
import { motion } from "framer-motion";

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

  // Duplicating items multiple times to ensure the marquee never gaps on ultra-wide screens
  const marqueeItems = [...items, ...items, ...items, ...items];

  return (
    <div className="bg-black text-white overflow-hidden border-b border-white/5 h-[40px] flex items-center relative">
      {/* INFINITE MARQUEE CONTAINER */}
      <motion.div
        className="flex whitespace-nowrap gap-12 md:gap-24" // Narrower gaps on mobile, wider on desktop
        animate={{
          x: [0, -1000], // Smooth horizontal translation
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30, // Adjust speed: lower = faster, higher = slower
            ease: "linear",
          },
        }}
        style={{ width: "fit-content" }}
      >
        {marqueeItems.map((it, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 px-2 opacity-90 hover:opacity-100 transition-opacity cursor-default"
          >
            <img
              src={it.icon}
              alt=""
              className="h-[13px] md:h-[14px] w-auto invert"
              draggable={false}
              onDragStart={preventDragHandler}
            />
            <span className="font-ui text-[10px] md:text-[11px] uppercase tracking-[0.15em] whitespace-nowrap">
              {it.text}
            </span>
          </div>
        ))}
      </motion.div>

      {/* VIGNETTE GRADIENTS  */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent z-10" />
    </div>
  );
}
