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
  if (!Array.isArray(variantValue) || variantValue.length === 0) {
    return "";
  }

  const firstItem = variantValue[0];

  if (typeof firstItem === "string") {
    return variantValue.join("\n");
  }

  if (
    firstItem &&
    typeof firstItem === "object" &&
    Array.isArray(firstItem.images)
  ) {
    return firstItem.images.join("\n");
  }

  return "";
}

export function joinUrl(origin, path) {
  const o = String(origin).replace(/\/+$/, "");
  const p = String(path).replace(/^\/+/, "");
  return `${o}/${p}`;
}

export function withBasePath({ apiOrigin, frontendBasePath, path }) {
  const base = String(frontendBasePath || "/")
    .replace(/^\/?/, "/")
    .replace(/\/?$/, "/");

  const clean = String(path || "").replace(/^\/+/, "");

  return joinUrl(
    String(apiOrigin || "").replace(":4000", ":5173"),
    `${base}${clean}`,
  );
}

export function makePreviewList({
  category,
  rawValue,
  apiOrigin,
  frontendBasePath,
}) {
  // Convert value to string to avoid errors if rawValue is an array
  const input = Array.isArray(rawValue)
    ? rawValue.join("\n")
    : String(rawValue || "");

  return input
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      if (/^https?:\/\//i.test(item)) {
        return item;
      }

      return withBasePath({
        apiOrigin,
        frontendBasePath,
        path: `products/${category}/${item}`,
      });
    });
}

export function createEmptyVariant() {
  return {
    name: "",
    images: "",
  };
}
