import { useCallback } from "react";

import IconButton from "@/components/ui/IconButton";
import cn from "@/utils/cn";

import heartIcon from "@/assets/ui/heart.svg";
import heartWhiteFillIcon from "@/assets/ui/heart-white-fill.svg";
import bagIcon from "@/assets/ui/shopping-bag.svg";

export default function ActionButtons({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) {
  const handleCartClick = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      onAddToCart?.(e);
    },
    [onAddToCart],
  );

  const handleFavoriteClick = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      onToggleWishlist?.(e);
    },
    [onToggleWishlist],
  );

  return (
    <>
      <IconButton
        variant="overlay"
        icon={bagIcon}
        onClick={handleCartClick}
        aria-label={`Add ${product.name} to cart`}
        className="left-3"
      />

      <IconButton
        variant="overlay"
        icon={isWishlisted ? heartWhiteFillIcon : heartIcon}
        onClick={handleFavoriteClick}
        aria-label={
          isWishlisted
            ? `Remove ${product.name} from favorites`
            : `Add ${product.name} to favorites`
        }
        className={cn("right-3", isWishlisted && "[&>img]:filter-none")}
      />
    </>
  );
}
