import { useEffect, useMemo } from "react";
import useBagDrawer from "@/store/useBagDrawer";
import preventDragHandler from "@/utils/preventDrag";

import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";
import trashIcon from "@/assets/ui/trash.svg";

const FAKE_ITEMS = [
  {
    id: 1,
    name: "“Earth” ring",
    price: 34.9,
    color: "Silver (367)",
    size: "15.5",
    quantity: 1,
    image: "https://picsum.photos/seed/earthring1/300/360",
    note: null,
  },
  {
    id: 2,
    name: "“Earth” ring",
    price: 34.9,
    color: "Silver (367)",
    size: "15.5",
    quantity: 1,
    image: "https://picsum.photos/seed/earthring2/300/360",
    note: "We will send you blaa bla bla",
  },
  {
    id: 3,
    name: "“Earth” ring",
    price: 34.9,
    color: "Silver (367)",
    size: "15.5",
    quantity: 1,
    image: "https://picsum.photos/seed/earthring3/300/360",
    note: null,
  },
];

const fmtPrice = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);

export default function ShoppingBagDrawer() {
  const isOpen = useBagDrawer((s) => s.isOpen);
  const close = useBagDrawer((s) => s.close);

  useEffect(() => {
    if (!isOpen) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const allowInsideDrawer = (e) => {
      if (e.target.closest("[data-bag-panel]")) return;
      e.preventDefault();
    };

    document.addEventListener("touchmove", allowInsideDrawer, {
      passive: false,
    });

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.removeEventListener("touchmove", allowInsideDrawer);
    };
  }, [isOpen]);

  const subtotal = useMemo(
    () =>
      FAKE_ITEMS.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0,
      ),
    [],
  );

  return (
    <div
      className={[
        "fixed inset-0 z-[90] transition-opacity duration-300 ease-out select-none",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
      ].join(" ")}
      onDragStart={preventDragHandler}
    >
      {/* overlay */}
      <button
        type="button"
        aria-label="Close bag"
        onClick={close}
        className={[
          "absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      {/* panel */}
      <aside
        data-bag-panel
        className={[
          "absolute top-0 right-0 h-full w-[min(92vw,420px)] bg-white border-l border-black",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* HEADER */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-black">
          <p className="font-display text-[20px] leading-none">Bag</p>

          <button
            type="button"
            onClick={close}
            className="ui-close inline-flex items-center gap-2 font-ui text-[14px] select-none"
          >
            <span className="ui-close__inner">
              <span className="inline-block">Close</span>
              <img
                src={arrowUpRightIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
                onDragStart={preventDragHandler}
                className="h-4 w-4 transition-transform duration-300 ease-out select-none"
              />
            </span>
          </button>
        </div>

        {/* BODY */}
        <div className="flex flex-col h-[calc(100vh-64px)]">
          {/* ITEMS */}
          <div className="flex-1 overflow-y-auto">
            {FAKE_ITEMS.map((item, idx) => {
              const isLast = idx === FAKE_ITEMS.length - 1;

              return (
                <div
                  key={item.id}
                  className={[
                    "px-6 py-6",
                    idx !== 0 ? "border-t border-black/80" : "",
                    isLast ? "border-b border-black/80" : "",
                  ].join(" ")}
                >
                  <div className="grid grid-cols-[90px_1fr] gap-5">
                    {/* image */}
                    <div className="w-[90px] h-[110px] bg-black/5 overflow-hidden">
                      <img
                        src={item.image}
                        alt=""
                        draggable={false}
                        onDragStart={preventDragHandler}
                        className="w-full h-full object-cover select-none"
                        loading="lazy"
                      />
                    </div>

                    {/* content */}
                    <div className="min-w-0">
                      {/* top row */}
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-display text-[18px] leading-tight">
                          {item.name}
                        </p>
                        <p className="font-ui text-[14px] whitespace-nowrap">
                          {fmtPrice(item.price)}
                        </p>
                      </div>

                      {/* meta pills */}
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="bg-black/5 px-3 py-1 font-ui text-[13px] text-black/70">
                          <span className="text-black/45 mr-2">Color:</span>
                          <span className="text-black/80">{item.color}</span>
                        </div>

                        <div className="bg-black/5 px-3 py-1 font-ui text-[13px] text-black/70">
                          <span className="text-black/45 mr-2">Size:</span>
                          <span className="text-black/80">{item.size}</span>
                        </div>
                      </div>

                      {/* qty + trash */}
                      <div className="mt-4 flex items-center justify-between gap-4">
                        {/* qty control */}
                        <div className="inline-flex items-stretch border border-black h-10 bg-white">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            className="w-9 grid place-items-center font-ui text-[18px] select-none bg-black/5 lg:hover:bg-black/10"
                            onClick={(e) => e.preventDefault()}
                          >
                            –
                          </button>

                          <div className="w-9 grid place-items-center font-ui text-[13px] border-x border-black bg-white">
                            {item.quantity}
                          </div>

                          <button
                            type="button"
                            aria-label="Increase quantity"
                            className="w-9 grid place-items-center font-ui text-[18px] select-none bg-black/5 lg:hover:bg-black/10"
                            onClick={(e) => e.preventDefault()}
                          >
                            +
                          </button>
                        </div>

                        {/* trash */}
                        <button
                          type="button"
                          aria-label="Remove item"
                          className="p-2 select-none lg:hover:opacity-70"
                          onClick={(e) => e.preventDefault()}
                        >
                          <img
                            src={trashIcon}
                            alt=""
                            aria-hidden="true"
                            draggable={false}
                            onDragStart={preventDragHandler}
                            className="h-5 w-5 opacity-60 select-none"
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* optional note bar */}
                  {item.note ? (
                    <div className="mt-5 bg-black/55 text-white font-ui text-[13px] px-4 py-3">
                      {item.note}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* FOOTER */}
          <div className="border-t border-black p-6">
            <button
              type="button"
              className="ui-interact w-full h-12 bg-black text-white font-ui text-[14px] flex items-center justify-center gap-4 select-none"
              onClick={(e) => e.preventDefault()}
            >
              <span>Check out</span>
              <span className="inline-block h-px w-10 bg-white/90" />
              <span className="font-ui">{fmtPrice(subtotal)}</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
