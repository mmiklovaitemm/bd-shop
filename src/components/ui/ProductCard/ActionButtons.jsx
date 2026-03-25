import { useCallback } from "react";

import useLanguage from "@/context/useLanguage";

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
  const isSoldOut = Boolean(product?.isSoldOut);
  const { t } = useLanguage();

  const handleCartClick = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (isSoldOut) return;

      onAddToCart?.(e);
    },
    [onAddToCart, isSoldOut],
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
      {!isSoldOut && (
        <IconButton
          variant="overlay"
          icon={bagIcon}
          onClick={handleCartClick}
          aria-label={`${t.add} ${product.name} ${t.toCart}`}
          className="left-3"
        />
      )}

      <IconButton
        variant="overlay"
        icon={isWishlisted ? heartWhiteFillIcon : heartIcon}
        onClick={handleFavoriteClick}
        aria-label={
          isWishlisted
            ? `${t.remove} ${product.name} ${t.fromFavorites}`
            : `${t.add} ${product.name} ${t.toFavorites}`
        }
        className={cn("right-3", isWishlisted && "[&>img]:filter-none")}
      />
    </>
  );
}
