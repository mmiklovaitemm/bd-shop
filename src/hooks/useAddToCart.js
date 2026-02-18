import { useCallback } from "react";
import useCart from "@/store/useCart";
import useBagDrawer from "@/store/useBagDrawer";
import parsePriceToNumber from "@/utils/parsePriceToNumber";

export default function useAddToCart() {
  const addItem = useCart((s) => s.addItem);
  const openBag = useBagDrawer((s) => s.open);

  const addToCart = useCallback(
    ({ product, color, size, quantity = 1, image, serviceOption = null }) => {
      if (!product?.id) return;

      const priceNumber = parsePriceToNumber(product.price);

      const safeColor = color || "silver";
      const safeSize = size || "nosize";
      const key = `${product.id}|${safeColor}|${safeSize}`;

      addItem({
        key,
        productId: product.id,
        name: product.name,
        price: priceNumber,
        image,
        color: safeColor,
        size: size || null,
        quantity,
        category: product.category,
        serviceOption,
      });

      openBag();
    },
    [addItem, openBag],
  );

  return { addToCart };
}
