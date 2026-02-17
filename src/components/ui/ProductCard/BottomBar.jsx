import cn from "@/utils/cn";
import AddToBagButton from "@/components/ui/AddToBagButton";
import bagIcon from "@/assets/ui/shopping-bag.svg";

export default function BottomBar({ product, onAddToCart, isDesktop }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      <div
        className={cn(
          "bg-black/50 backdrop-blur-md px-6 h-16 text-white flex items-center",
          isDesktop
            ? "transition-opacity duration-200 ease-out lg:group-hover:opacity-0"
            : "transition-none",
        )}
      >
        <div className="flex w-full items-center gap-4 justify-center">
          <p className="min-w-0 font-display font-normal text-[14px] leading-none truncate">
            {product.name}
          </p>
          <div className="h-px w-[25%] bg-white/90 flex-none" />
          <p className="flex-none whitespace-nowrap font-ui font-normal text-[14px] leading-none">
            {product.price}
          </p>
        </div>
      </div>

      {isDesktop ? (
        <div className="pointer-events-none absolute inset-0 hidden lg:flex items-center bg-black px-6 h-16 opacity-0 transition-opacity duration-200 ease-out lg:group-hover:opacity-100">
          <div className="flex w-full items-center justify-between gap-6">
            <p className="font-ui font-normal text-[14px] leading-none whitespace-nowrap text-white">
              {product.price}
            </p>
            <div className="pointer-events-auto">
              <AddToBagButton
                onClick={(e) => {
                  e?.stopPropagation?.();
                  e?.preventDefault?.();
                  onAddToCart?.(e);
                }}
                icon={bagIcon}
                ariaLabel={`Add ${product.name} to bag`}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
