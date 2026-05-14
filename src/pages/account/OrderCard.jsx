import useLanguage from "@/context/useLanguage";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import StatusPill from "./StatusPill";
import arrowRightIcon from "@/assets/ui/arrow-right.svg";
import cn from "@/utils/cn";

export default function OrderCard({ order, onOpen, isOpen }) {
  const { t } = useLanguage();

  const renderArrowButton = () => (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-12 w-12 items-center justify-center bg-black transition-colors duration-200 active:bg-neutral-800"
      aria-label={isOpen ? t.closeOrder : t.openOrder}
    >
      <img
        src={arrowRightIcon}
        alt=""
        className={cn(
          "h-6 w-6 invert transition-transform duration-300 ease-in-out",
          isOpen ? "rotate-90" : "rotate-0",
        )}
      />
    </button>
  );

  return (
    <>
      <article
        className={cn(
          "transition-colors duration-300 ease-in-out py-6",
          isOpen ? "bg-neutral-50" : "bg-transparent",
        )}
      >
        {/* MOBILE LAYOUT */}
        <div className="md:hidden px-4">
          <div className="flex items-start justify-between gap-4">
            <div className="mt-[-5px]">
              <p className="font-display text-lg">{order.date}</p>
              <div className="mt-3">
                <StatusPill status={order.status} />
              </div>
            </div>

            {renderArrowButton()}
          </div>

          <div className="mt-5 h-px w-full bg-black/10" />

          <div className="mt-5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              {(order.productLines || []).slice(0, 2).map((item, index) => (
                <p key={index} className="font-display text-lg leading-none">
                  {item.name}{" "}
                  <span className="align-middle font-ui text-sm opacity-60">
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
            <p className="font-ui text-base font-semibold">{order.price}</p>
          </div>

          <div className="mt-4 flex gap-3">
            {order.images?.slice(0, 2).map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className="h-20 w-24 object-cover"
                loading="lazy"
              />
            ))}
          </div>

          <div className="mt-4 max-w-[250px] bg-neutral-200/50 px-4 py-3 font-ui text-xs">
            <span className="text-neutral-500">{t.orderNo}:</span>{" "}
            <span className="text-black font-medium">{order.orderNo}</span>
          </div>
        </div>

        {/* TABLET LAYOUT */}
        <div className="hidden md:flex md:items-stretch lg:hidden px-6">
          <div className="flex w-[150px] flex-col justify-center pr-6">
            <p className="font-display text-base">{order.date}</p>
            <div className="mt-3">
              <StatusPill status={order.status} />
            </div>
          </div>

          <div className="flex w-[180px] flex-col justify-center border-l border-black/10 px-6">
            <div className="space-y-1">
              {(order.productLines || []).slice(0, 2).map((item, index) => (
                <p key={index} className="font-display text-sm leading-none">
                  {item.name}{" "}
                  <span className="font-ui text-xs opacity-60">
                    x{item.quantity}
                  </span>
                </p>
              ))}
            </div>
            <p className="mt-2 font-ui text-sm font-semibold">{order.price}</p>
          </div>

          <div className="flex w-[240px] items-center border-l border-black/10 px-6">
            <div className="w-full bg-neutral-100 px-4 py-3 text-[12px]">
              <span className="text-neutral-500">{t.orderNo}:</span>
              <br />
              {order.orderNo}
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3 px-6">
            {order.images?.slice(0, 2).map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className="h-16 w-16 object-cover"
              />
            ))}
          </div>

          <div className="flex w-[52px] items-center justify-end">
            {renderArrowButton()}
          </div>
        </div>

        {/* DESKTOP LAYOUT */}
        <div className="hidden lg:flex lg:items-stretch px-8">
          <div className="flex w-[190px] flex-col justify-center pr-8">
            <p className="font-display text-base">{order.date}</p>
            <div className="mt-3">
              <StatusPill status={order.status} />
            </div>
          </div>

          <div className="flex w-[360px] items-center justify-between border-l border-black/10 px-8">
            <div className="space-y-1">
              {(order.productLines || []).slice(0, 2).map((item, index) => (
                <p key={index} className="font-display text-base leading-none">
                  {item.name}{" "}
                  <span className="font-ui text-xs opacity-60">
                    x{item.quantity}
                  </span>
                </p>
              ))}
            </div>
            <p className="font-ui text-sm font-semibold">{order.price}</p>
          </div>

          <div className="flex w-[320px] items-center border-l border-black/10 px-8">
            <div className="w-full bg-neutral-100 px-5 py-3 text-sm">
              <span className="text-neutral-500">{t.orderNo}:</span>{" "}
              {order.orderNo}
            </div>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3 px-8">
            {order.images?.slice(0, 2).map((img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className="h-16 w-16 object-cover"
              />
            ))}
          </div>

          <div className="flex w-[56px] items-center justify-end">
            {renderArrowButton()}
          </div>
        </div>
      </article>

      <FullWidthDivider />
    </>
  );
}
