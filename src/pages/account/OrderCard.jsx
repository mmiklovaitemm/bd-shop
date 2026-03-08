// src/components/account/OrderCard.jsx
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import StatusPill from "./StatusPill";
import arrowRightIcon from "@/assets/ui/arrow-right.svg";

export default function OrderCard({ order, onOpen }) {
  return (
    <>
      <article className="py-6">
        {/* MOBILE */}
        <div className="md:hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="mt-[-15px]">
              <p className="font-display text-lg">{order.date}</p>
              <div className="mt-3">
                <StatusPill status={order.status} />
              </div>
            </div>

            <button
              type="button"
              onClick={onOpen}
              className="flex h-12 w-12 items-center justify-center bg-black active:opacity-80"
              aria-label="Open order"
            >
              <img src={arrowRightIcon} alt="" className="h-6 w-6 invert" />
            </button>
          </div>

          <div className="mt-5 h-px w-full bg-black" />

          <div className="mt-5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              {(order.productLines || []).slice(0, 2).map((item, index) => (
                <p
                  key={index}
                  className={`font-display leading-none ${
                    order.productLines.length === 1 ? "text-2xl" : "text-lg"
                  }`}
                >
                  {item.name}{" "}
                  <span className="font-ui text-sm align-middle">
                    x{item.quantity}
                  </span>
                </p>
              ))}

              {order.productLines?.length > 2 && (
                <p className="font-ui text-xs text-neutral-500">
                  +{order.productLines.length - 2} more
                </p>
              )}
            </div>
            <p className="font-ui text-base">{order.price}</p>
          </div>

          <div className="mt-4 flex gap-3">
            {order.images.slice(0, 2).map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className="h-20 w-24 object-cover"
                loading="lazy"
              />
            ))}
          </div>

          <div className="mt-4 bg-neutral-100 px-4 py-3 font-ui text-xs max-w-[250px]">
            <span className="text-neutral-500">Order no.:</span>{" "}
            <span className="text-black">{order.orderNo}</span>
          </div>
        </div>

        {/* TABLET */}
        <div className="hidden md:flex lg:hidden md:items-stretch md:gap-0">
          {/* 1) date + status */}
          <div className="w-[150px] pr-6 flex flex-col justify-center">
            <p className="font-display text-base">{order.date}</p>
            <div className="mt-3">
              <StatusPill status={order.status} />
            </div>
          </div>

          {/* 2) name + price */}
          <div className="w-[180px] px-6 flex flex-col justify-center border-l border-black">
            <div className="space-y-1">
              {(order.productLines || []).slice(0, 2).map((item, index) => (
                <p key={index} className="font-display text-sm leading-none">
                  {item.name}{" "}
                  <span className="font-ui text-xs align-middle">
                    x{item.quantity}
                  </span>
                </p>
              ))}

              {order.productLines?.length > 2 && (
                <p className="mt-1 font-ui text-xs text-neutral-500">
                  +{order.productLines.length - 2} more
                </p>
              )}
            </div>
            <p className="mt-2 font-ui text-sm">{order.price}</p>
          </div>

          {/* 3) order no */}
          <div className="w-[240px] px-6 flex items-center border-l border-black">
            <div className="w-full bg-neutral-100 px-4 py-3 font-ui">
              <div className="text-[11px] text-neutral-500 leading-tight">
                Order no.:
              </div>
              <div className="mt-1 text-[12px] leading-tight text-black break-all">
                {order.orderNo}
              </div>
            </div>
          </div>

          {/* 4) images */}
          <div className="flex-1 px-6 flex items-center justify-end gap-3">
            {order.images.slice(0, 2).map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className="h-16 w-16 object-cover"
                loading="lazy"
              />
            ))}
          </div>

          {/* 5) arrow */}
          <div className="w-[52px] flex items-center justify-end">
            <button
              type="button"
              onClick={onOpen}
              className="flex h-12 w-12 items-center justify-center bg-black active:opacity-80"
              aria-label="Open order"
            >
              <img src={arrowRightIcon} alt="" className="h-6 w-6 invert" />
            </button>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:flex lg:items-stretch lg:gap-0">
          {/* 1) date + status */}
          <div className="w-[190px] pr-8 flex flex-col justify-center">
            <p className="font-display text-base">{order.date}</p>
            <div className="mt-3">
              <StatusPill status={order.status} />
            </div>
          </div>

          {/* 2) name + price */}
          <div className="w-[360px] px-8 flex items-center justify-between gap-6 border-l border-black">
            <div className="space-y-1">
              {(order.productLines || []).slice(0, 2).map((item, index) => (
                <p key={index} className="font-display text-base leading-none">
                  {item.name}{" "}
                  <span className="font-ui text-xs align-middle">
                    x{item.quantity}
                  </span>
                </p>
              ))}

              {order.productLines?.length > 2 && (
                <p className="mt-1 font-ui text-xs text-neutral-500">
                  +{order.productLines.length - 2} more
                </p>
              )}
            </div>
            <p className="font-ui text-sm">{order.price}</p>
          </div>

          {/* 3) order no */}
          <div className="w-[320px] px-8 flex items-center border-l border-black">
            <div className="w-full bg-neutral-100 px-5 py-3 font-ui text-sm">
              <span className="text-neutral-500">Order no.:</span>{" "}
              <span className="text-black">{order.orderNo}</span>
            </div>
          </div>

          {/* 4) images */}
          <div className="flex-1 px-8 flex items-center justify-end gap-3">
            {order.images.slice(0, 2).map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className="h-16 w-16 object-cover"
                loading="lazy"
              />
            ))}
          </div>

          {/* 5) arrow */}
          <div className="w-[56px] flex items-center justify-end">
            <button
              type="button"
              onClick={onOpen}
              className="flex h-12 w-12 items-center justify-center bg-black active:opacity-80"
              aria-label="Open order"
            >
              <img src={arrowRightIcon} alt="" className="h-6 w-6 invert" />
            </button>
          </div>
        </div>
      </article>

      <FullWidthDivider />
    </>
  );
}
