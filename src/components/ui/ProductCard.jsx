import IconButton from "@/components/ui/IconButton";
import AddToBagButton from "@/components/ui/AddToBagButton";

import heartIcon from "@/assets/ui/heart.svg";
import bagIcon from "@/assets/ui/shopping-bag.svg";

export default function ProductCard({
  product,
  onAddToCart,
  onAddToFavorites,
  onImageError,
  onMediaReady,
}) {
  return (
    <article
      data-card
      className="
        group bg-white
        w-full h-full
        transition-transform duration-200 ease-out
        will-change-transform
        hover:scale-[1.02]
      "
    >
      <div className="relative w-full h-[340px] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={onImageError}
          onLoad={onMediaReady}
          loading="lazy"
        />

        {/* Hover dark overlay */}
        <div className="pointer-events-none absolute inset-0 bg-black/55 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />

        <IconButton
          variant="overlay"
          icon={bagIcon}
          onClick={onAddToCart}
          aria-label={`Add ${product.name} to cart`}
          className="left-3"
        />

        <IconButton
          variant="overlay"
          icon={heartIcon}
          onClick={onAddToFavorites}
          aria-label={`Add ${product.name} to favorites`}
          className="right-3"
        />

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          {/* DEFAULT */}
          <div className="bg-black/50 backdrop-blur-md px-6 h-16 text-white transition-opacity duration-200 ease-out group-hover:opacity-0 flex items-center">
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

          {/* HOVER */}
          <div className="pointer-events-none absolute inset-0 flex items-center bg-black px-6 h-16 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
            <div className="flex w-full items-center justify-between gap-6">
              <p className="font-ui font-normal text-[14px] leading-none whitespace-nowrap text-white">
                {product.price}
              </p>
              <div className="pointer-events-auto">
                <AddToBagButton
                  onClick={onAddToCart}
                  icon={bagIcon}
                  ariaLabel={`Add ${product.name} to bag`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
