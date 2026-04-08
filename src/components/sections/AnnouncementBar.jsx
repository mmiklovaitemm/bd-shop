import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Pridėta AnimatePresence ir motion

import preventDragHandler from "@/utils/preventDrag";
import useLanguage from "@/context/useLanguage";

import warrantyIcon from "@/assets/ui/warranty.svg";
import returnIcon from "@/assets/ui/return-box.svg";
import deliveryIcon from "@/assets/ui/delivery.svg";
import qualityIcon from "@/assets/ui/star.svg";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

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

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (mq.matches) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3000); // Padidinau iki 3s geresniam skaitomumui

    return () => clearInterval(id);
  }, [items.length]);

  return (
    <div className="bg-black text-white overflow-hidden">
      {/* Mobile: rotating with Fade effect */}
      <div className="mx-auto flex h-[40px] max-w-6xl items-center justify-center gap-2 px-4 font-ui text-[12px] font-normal md:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2"
          >
            <img
              src={items[index].icon}
              alt=""
              className="h-[15px] w-auto invert select-none"
              draggable={false}
              onDragStart={preventDragHandler}
            />
            <span>{items[index].text}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tablet/Desktop: Staggered Fade-in */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto hidden h-[40px] max-w-6xl items-center justify-center gap-12 px-4 font-ui text-[12px] font-normal leading-none md:flex"
      >
        {items.map((it) => (
          <motion.div
            key={it.text}
            variants={itemVariants}
            whileHover={{ y: -1, opacity: 0.8 }} // Subtilus hover
            className="flex items-center gap-2 cursor-default"
          >
            <img
              src={it.icon}
              alt=""
              className="h-[15px] w-auto invert select-none"
              draggable={false}
              onDragStart={preventDragHandler}
            />
            <span className="whitespace-nowrap">{it.text}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
