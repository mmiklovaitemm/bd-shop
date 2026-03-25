// src/components/account/OrderCard.jsx
import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import StatusPill from "./StatusPill";
import arrowRightIcon from "@/assets/ui/arrow-right.svg";

export default function OrderCard({ order, onOpen }) {
  const { t } = useLanguage();

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
              aria-label={t.openOrder}
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
                  <span className="align-middle font-ui text-sm">
                    x{item.quantity}
                  </span>
                </p>
              ))}

              {order.productLines?.length > 2 && (
                <p className="font-ui text-xs text-neutral-500">
                  +{order.productLines.length - 2} {t.more}
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

          <div className="mt-4 max-w-[250px] bg-neutral-100 px-4 py-3 font-ui text-xs">
            <span className="text-neutral-500">{t.orderNo}:</span>{" "}
            <span className="text-black">{order.orderNo}</span>
          </div>
        </div>

        {/* TABLET */}
        <div className="hidden md:flex md:items-stretch md:gap-0 lg:hidden">
          <div className="flex w-[150px] flex-col justify-center pr-6">
            <p className="font-display text-base">{order.date}</p>
            <div className="mt-3">
              <StatusPill status={order.status} />
            </div>
          </div>

          <div className="flex w-[180px] flex-col justify-center border-l border-black px-6">
            <div className="space-y-1">
              {(order.productLines || []).slice(0, 2).map((item, index) => (
                <p key={index} className="font-display text-sm leading-none">
                  {item.name}{" "}
                  <span className="align-middle font-ui text-xs">
                    x{item.quantity}
                  </span>
                </p>
              ))}

              {order.productLines?.length > 2 && (
                <p className="mt-1 font-ui text-xs text-neutral-500">
                  +{order.productLines.length - 2} {t.more}
                </p>
              )}
            </div>
            <p className="mt-2 font-ui text-sm">{order.price}</p>
          </div>

          <div className="flex w-[240px] items-center border-l border-black px-6">
            <div className="w-full bg-neutral-100 px-4 py-3 font-ui">
              <div className="text-[11px] leading-tight text-neutral-500">
                {t.orderNo}:
              </div>
              <div className="mt-1 break-all text-[12px] leading-tight text-black">
                {order.orderNo}
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3 px-6">
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

          <div className="flex w-[52px] items-center justify-end">
            <button
              type="button"
              onClick={onOpen}
              className="flex h-12 w-12 items-center justify-center bg-black active:opacity-80"
              aria-label={t.openOrder}
            >
              <img src={arrowRightIcon} alt="" className="h-6 w-6 invert" />
            </button>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:flex lg:items-stretch lg:gap-0">
          <div className="flex w-[190px] flex-col justify-center pr-8">
            <p className="font-display text-base">{order.date}</p>
            <div className="mt-3">
              <StatusPill status={order.status} />
            </div>
          </div>

          <div className="flex w-[360px] items-center justify-between gap-6 border-l border-black px-8">
            <div className="space-y-1">
              {(order.productLines || []).slice(0, 2).map((item, index) => (
                <p key={index} className="font-display text-base leading-none">
                  {item.name}{" "}
                  <span className="align-middle font-ui text-xs">
                    x{item.quantity}
                  </span>
                </p>
              ))}

              {order.productLines?.length > 2 && (
                <p className="mt-1 font-ui text-xs text-neutral-500">
                  +{order.productLines.length - 2} {t.more}
                </p>
              )}
            </div>
            <p className="font-ui text-sm">{order.price}</p>
          </div>

          <div className="flex w-[320px] items-center border-l border-black px-8">
            <div className="w-full bg-neutral-100 px-5 py-3 font-ui text-sm">
              <span className="text-neutral-500">{t.orderNo}:</span>{" "}
              <span className="text-black">{order.orderNo}</span>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3 px-8">
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

          <div className="flex w-[56px] items-center justify-end">
            <button
              type="button"
              onClick={onOpen}
              className="flex h-12 w-12 items-center justify-center bg-black active:opacity-80"
              aria-label={t.openOrder}
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
