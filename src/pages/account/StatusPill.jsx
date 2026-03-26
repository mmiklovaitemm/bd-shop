import checkIcon from "@/assets/ui/check-send-message.svg";
import useLanguage from "@/context/useLanguage";

export default function StatusPill({ status }) {
  const { t } = useLanguage();

  const value = String(status || "Pending").trim();

  const isConfirmed = value === "Confirmed";
  const isShipped = value === "Shipped";
  const isCompleted = value === "Completed";
  const isCanceled = value === "Canceled";

  const translatedStatus =
    value === "Pending"
      ? t.pending
      : value === "Confirmed"
        ? t.confirmed
        : value === "Shipped"
          ? t.shipped
          : value === "Completed"
            ? t.completed
            : value === "Canceled"
              ? t.canceled
              : value;

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
      <span>{translatedStatus}</span>

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
