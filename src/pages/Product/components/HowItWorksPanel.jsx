import { memo } from "react";
import preventDragHandler from "@/utils/preventDrag";
import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";

const HowItWorksPanel = memo(function HowItWorksPanel({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] select-none"
      onDragStart={preventDragHandler}
    >
      <button
        type="button"
        aria-label="Close how it works"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <aside className="absolute right-0 top-0 h-full w-[92%] max-w-[520px] bg-white border-l border-black flex flex-col">
        {/* HEADER */}
        <div className="px-6 pt-7 pb-5 border-b border-black shrink-0">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-display text-[24px] leading-[0.95]">
              Personal jewellery — How it works
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="group inline-flex items-center gap-2 font-ui text-[14px] text-black/80 transition-transform duration-200 ease-out lg:hover:-translate-y-[2px] active:scale-95"
            >
              <span>Close</span>
              <img
                src={arrowUpRightIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
                onDragStart={preventDragHandler}
                className="h-3 w-3 transition-transform duration-200 ease-out lg:group-hover:translate-x-[1px] lg:group-hover:-translate-y-[1px] select-none"
              />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <p className="font-ui text-[14px] leading-relaxed text-black/80">
              Personal jewellery is made to order using your unique imprint. You
              can choose the service option that suits you best.
            </p>

            <div className="space-y-2">
              <p className="font-ui text-[14px] text-black/70">
                Option 1 — Shipping kit
              </p>
              <ol className="list-decimal pl-5 space-y-2 font-ui text-[14px] leading-relaxed text-black/80">
                <li>
                  Choose your size, colour and select{" "}
                  <span className="font-mono">Shipping kit</span>.
                </li>
                <li>
                  After checkout, we send you a kit to capture your imprint at
                  home.
                </li>
                <li>
                  Follow the included instructions to make the imprint (it takes
                  only a few minutes).
                </li>
                <li>
                  Send the imprint back to us using the provided return
                  packaging.
                </li>
                <li>
                  Once received, we create your personalised piece and finish it
                  by hand.
                </li>
              </ol>
            </div>

            <div className="space-y-2">
              <p className="font-ui text-[14px] text-black/70">
                Option 2 — In-store
              </p>
              <ol className="list-decimal pl-5 space-y-2 font-ui text-[14px] leading-relaxed text-black/80">
                <li>
                  Choose your size, colour and select{" "}
                  <span className="font-mono">In-store</span>.
                </li>
                <li>
                  Visit our studio and we will capture your imprint on-site.
                </li>
                <li>
                  We finalise the jewellery piece and prepare it for pickup or
                  delivery.
                </li>
              </ol>
            </div>

            <div className="space-y-2">
              <p className="font-ui text-[14px] text-black/70">
                Production time
              </p>
              <p className="font-ui text-[14px] leading-relaxed text-black/80">
                Personalised pieces are made to order. Typical production time
                is a few business days after we receive your imprint (or after
                your in-store visit).
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-ui text-[14px] text-black/70">
                Important notes
              </p>
              <ul className="list-disc pl-5 space-y-2 font-ui text-[14px] leading-relaxed text-black/80">
                <li>
                  Please make sure your imprint is clear and follow the kit
                  instructions carefully.
                </li>
                <li>
                  If something looks off, contact us before sending it back — we
                  will help.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
});

export default HowItWorksPanel;
