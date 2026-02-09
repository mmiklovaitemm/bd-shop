import { useState } from "react";
import { HiChevronDown } from "react-icons/hi";

export default function FilterAccordion({
  title,
  children,
  defaultOpen = true,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      {/* HEADER */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-4 font-ui text-[14px]"
      >
        <span>{title}</span>

        <HiChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* CONTENT */}
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
