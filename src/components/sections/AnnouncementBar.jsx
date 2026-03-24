import { useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (mq.matches) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 2500);

    return () => clearInterval(id);
  }, [items.length]);

  return (
    <div className="bg-black text-white">
      {/* Mobile: rotating */}
      <div className="mx-auto flex h-[40px] max-w-6xl items-center justify-center gap-2 px-4 font-ui text-[12px] font-normal leading-none md:hidden">
        <img
          src={items[index].icon}
          alt=""
          className="h-[15px] w-auto invert select-none"
          draggable={false}
          onDragStart={preventDragHandler}
        />
        <span>{items[index].text}</span>
      </div>

      {/* Tablet/Desktop: all items */}
      <div className="mx-auto hidden h-[40px] max-w-6xl items-center justify-center gap-12 px-4 font-ui text-[12px] font-normal leading-none md:flex">
        {items.map((it) => (
          <div key={it.text} className="flex items-center gap-2">
            <img
              src={it.icon}
              alt=""
              className="h-[15px] w-auto invert select-none"
              draggable={false}
              onDragStart={preventDragHandler}
            />
            <span>{it.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
