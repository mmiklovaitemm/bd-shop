import { useCallback } from "react";
import useCart from "@/store/useCart";
import useBagDrawer from "@/store/useBagDrawer";
import parsePriceToNumber from "@/utils/parsePriceToNumber";

export default function useAddToCart() {
  const addItem = useCart((s) => s.addItem);
  const openBag = useBagDrawer((s) => s.open);

  const addToCart = useCallback(
    ({
      product,
      productId,
      name,
      price,
      color,
      size,
      quantity = 1,
      image,
      serviceOption = null,
    }) => {
      const id = product?.id || productId;
      if (!id) return;

      const finalName = product?.name || name || "";
      const finalPrice =
        product?.price != null
          ? parsePriceToNumber(product.price)
          : parsePriceToNumber(price);
      const finalCategory = product?.category || "";

      const safeQuantity = Math.max(1, Number(quantity) || 1);
      const safeColor = color || product?.colors?.[0] || "silver";

      let safeSize = size;
      if (safeSize == null && product?.sizes?.length > 0) {
        safeSize = String(product.sizes[0]);
      } else if (safeSize != null) {
        safeSize = String(safeSize);
      }

      const safeImage = image || product?.thumbnail || "";

      let finalServiceOption = serviceOption;
      if (!finalServiceOption && finalCategory === "personal") {
        finalServiceOption = "shipping";
      }

      addItem({
        productId: String(id),
        name: finalName,
        price: finalPrice,
        image: safeImage,
        color: safeColor,
        size: safeSize,
        quantity: safeQuantity,
        category: finalCategory,
        serviceOption: finalServiceOption,
      });

      openBag();
    },
    [addItem, openBag],
  );

  return { addToCart };
}
