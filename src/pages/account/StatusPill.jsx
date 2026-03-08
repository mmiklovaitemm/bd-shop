import checkIcon from "@/assets/ui/check-send-message.svg";

export default function StatusPill({ status }) {
  const value = String(status || "Pending").trim();

  const isPending = value === "Pending";
  const isConfirmed = value === "Confirmed";
  const isShipped = value === "Shipped";
  const isCompleted = value === "Completed";
  const isCanceled = value === "Canceled";

  const pillClass = isCanceled
    ? "bg-white text-black border-black"
    : isCompleted
      ? "bg-black text-white border-black"
      : isShipped
        ? "bg-black text-white border-black"
        : isConfirmed
          ? "bg-black text-white border-black"
          : "bg-black text-white border-black";

  return (
    <div
      className={`
        inline-flex items-center gap-2
        border
        px-4 py-2
        text-sm
        font-ui
        ${pillClass}
      `}
    >
      <span>{value}</span>

      {(isCompleted || isShipped) && (
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
