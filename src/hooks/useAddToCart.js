import { useCallback } from "react";
import useCart from "@/store/useCart";
import useBagDrawer from "@/store/useBagDrawer";
import parsePriceToNumber from "@/utils/parsePriceToNumber";

export default function useAddToCart() {
  const addItem = useCart((s) => s.addItem);
  const openBag = useBagDrawer((s) => s.open);

  const addToCart = useCallback(
    ({ product, color, size, quantity = 1, image }) => {
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
        color: safeColor,
        size: size ?? null,
        quantity,
        image: image || product.thumbnail || "",
      });

      openBag();
    },
    [addItem, openBag],
  );

  return { addToCart };
}
