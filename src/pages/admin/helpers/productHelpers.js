export function getStockBadge(product) {
  const qty = Math.max(0, Number(product?.stockQuantity) || 0);

  if (qty === 0) {
    return {
      label: "Out of stock",
      className: "border border-red-600 bg-red-600 text-white",
    };
  }

  if (qty <= 5) {
    return {
      label: `Low stock (${qty})`,
      className: "border border-orange-500 bg-orange-500 text-white",
    };
  }

  return {
    label: `In stock (${qty})`,
    className: "border border-green-700 bg-green-700 text-white",
  };
}

export function getImageTextFromVariant(variantValue) {
  if (!Array.isArray(variantValue) || !variantValue.length) return "";

  const firstItem = variantValue[0];

  // SENAS formatas (string[])
  if (typeof firstItem === "string") {
    return variantValue.join("\n");
  }

  // NAUJAS formatas ({ size, stock, images }[])
  if (
    firstItem &&
    typeof firstItem === "object" &&
    Array.isArray(firstItem.images)
  ) {
    return firstItem.images.join("\n");
  }

  return "";
}
