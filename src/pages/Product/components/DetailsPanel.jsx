import { memo, useMemo } from "react";
import preventDragHandler from "@/utils/preventDrag";

import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";

const DetailsContent = memo(function DetailsContent({ product }) {
  const details = useMemo(() => {
    if (!product) return [];

    const items = [];

    if (product.colors?.length) {
      items.push({
        label: "Material options",
        value: product.colors.join(", "),
      });
    }

    if (product.surface) {
      items.push({ label: "Surface", value: product.surface });
    }

    items.push({
      label: "Gemstones",
      value: product.gemstones?.length ? product.gemstones.join(", ") : "none",
    });

    if (typeof product.hasGem === "boolean") {
      items.push({ label: "Has gem", value: product.hasGem ? "yes" : "no" });
    }

    if (product.sizes?.length) {
      items.push({ label: "Available sizes", value: product.sizes.join(", ") });
    }

    if (product.isBestSeller) {
      items.push({ label: "Tag", value: "Best seller" });
    }

    if (product.createdAt) {
      items.push({ label: "Created", value: product.createdAt });
    }

    return items;
  }, [product]);

  if (!details.length) {
    return (
      <p className="font-ui text-[14px] text-black/80">No details available.</p>
    );
  }

  return (
    <div className="font-ui text-[14px] text-black/80 space-y-4 leading-relaxed select-none">
      {details.map((item, index) => (
        <div key={index} className="space-y-2">
          <p className="text-black/70 text-[12px]">{item.label}</p>
          <p>{item.value}</p>
        </div>
      ))}
    </div>
  );
});

const DetailsPanel = memo(function DetailsPanel({ isOpen, onClose, product }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] select-none"
      onDragStart={preventDragHandler}
    >
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <aside className="absolute right-0 top-0 h-full w-[92%] max-w-[520px] bg-white border-l border-black flex flex-col">
        <div className="h-14 px-4 flex items-center justify-between border-b border-black shrink-0">
          <h2 className="font-display text-[20px]">Dimensions & details</h2>
          <button
            type="button"
            onClick={onClose}
            className="group inline-flex items-center gap-2 font-ui text-[14px] transition-all duration-200 ease-out lg:hover:-translate-y-[2px] active:scale-95"
          >
            <span>Close</span>
            <img
              src={arrowUpRightIcon}
              alt=""
              aria-hidden="true"
              draggable={false}
              onDragStart={preventDragHandler}
              className="h-4 w-4 transition-transform duration-200 ease-out lg:group-hover:translate-x-[1px] lg:group-hover:-translate-y-[1px] select-none"
            />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <DetailsContent product={product} />
        </div>
      </aside>
    </div>
  );
});

export default DetailsPanel;
