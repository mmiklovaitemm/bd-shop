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
      const safeQuantity = Math.max(1, Number(quantity) || 1);

      const safeColor = color || "silver";
      const safeSize = size == null ? "nosize" : String(size);
      const safeServiceOption = serviceOption || "no-service";
      const safeImage = image || product.thumbnail || "";

      const key = `${product.id}|${safeColor}|${safeSize}|${safeServiceOption}`;

      addItem({
        key,
        productId: product.id,
        name: product.name,
        price: priceNumber,
        image: safeImage,
        color: safeColor,
        size: size == null ? null : String(size),
        quantity: safeQuantity,
        category: product.category,
        serviceOption: serviceOption || null,
      });

      openBag();
    },
    [addItem, openBag],
  );

  return { addToCart };
}
