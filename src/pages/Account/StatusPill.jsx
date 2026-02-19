// src/components/account/StatusPill.jsx

import checkIcon from "@/assets/ui/check-send-message.svg";

export default function StatusPill({ status }) {
  const isCompleted = status === "Completed";
  const isCanceled = status === "Canceled";

  return (
    <div
      className={`
        inline-flex items-center gap-2
        border border-black
        px-4 py-2
        text-sm
        font-ui
        ${isCanceled ? "bg-white text-black" : "bg-black text-white"}
      `}
    >
      <span>{status}</span>

      {isCompleted && (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white">
          <img
            src={checkIcon}
            alt=""
            aria-hidden="true"
            className="h-3 w-3 invert"
          />
        </span>
      )}

      {isCanceled && (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-black text-xs">
          ×
        </span>
      )}
    </div>
  );
}
