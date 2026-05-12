import cn from "@/utils/cn";
import AddToBagButton from "@/components/ui/AddToBagButton";
import useLanguage from "@/context/useLanguage";

import bagIcon from "@/assets/ui/shopping-bag.svg";

export default function BottomBar({ product, onAddToCart, isDesktop }) {
  const { t } = useLanguage();
  const isSoldOut = Boolean(product?.isSoldOut);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <div
        className={cn(
          "flex h-16 items-center bg-black/50 px-6 text-white backdrop-blur-md",
          isDesktop
            ? "transition-opacity duration-200 ease-out lg:group-hover:opacity-0"
            : "transition-none",
        )}
      >
        <div className="flex w-full items-center justify-center gap-4">
          <p className="min-w-0 font-display text-[14px] font-normal leading-tight">
            {product.name}
          </p>
          <div className="h-px w-[25%] flex-none bg-white/90" />
          <p className="flex-none whitespace-nowrap font-ui text-[14px] font-normal leading-none">
            {product.price}
          </p>
        </div>
      </div>

      {isDesktop ? (
        <div className="pointer-events-none absolute inset-0 hidden h-16 items-center bg-black px-6 opacity-0 transition-opacity duration-200 ease-out lg:flex lg:group-hover:opacity-100">
          <div className="flex w-full items-center justify-between gap-6">
            <p className="whitespace-nowrap font-ui text-[14px] font-normal leading-none text-white">
              {product.price}
            </p>

            <div className="pointer-events-auto">
              {isSoldOut ? (
                <span className="inline-flex items-center border border-white/40 px-4 py-2 font-ui text-xs uppercase tracking-[0.08em] text-white/70">
                  {t.soldOut}
                </span>
              ) : (
                <AddToBagButton
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    e?.preventDefault?.();
                    onAddToCart?.(e);
                  }}
                  icon={bagIcon}
                  ariaLabel={`${t.add} ${product.name} ${t.toBag}`}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
