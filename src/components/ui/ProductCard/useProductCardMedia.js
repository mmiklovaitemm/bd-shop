// src/components/ui/ProductCard/useProductCardMedia.js
import { useMemo } from "react";

/**
 * Išvalo localhost ir sutvarko Mixed Content problemas.
 */
function sanitizeImageUrl(path) {
  if (!path || typeof path !== "string") return "";

  if (path.startsWith("http")) {
    if (path.includes("localhost")) {
      const parts = path.split("/uploads/");
      path = parts.length > 1 ? `uploads/${parts[1]}` : path;
    } else {
      return path.replace("http://", "https://");
    }
  }

  const BASE =
    import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com";
  const cleanBase = BASE.replace(/\/+$/, "").replace("http://", "https://");
  const cleanPath = path.replace(/^\/+/, "");

  return `${cleanBase}/${cleanPath}`;
}

function isVariantObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray(value.images)
  );
}

function getImagesFromVariantArray(variantArray) {
  if (!Array.isArray(variantArray) || !variantArray.length) return [];

  const firstItem = variantArray[0];

  if (typeof firstItem === "string") {
    return variantArray.filter(Boolean);
  }

  if (isVariantObject(firstItem)) {
    const firstAvailableVariant =
      variantArray.find((item) => Number(item?.stock || 0) > 0) ||
      variantArray[0];

    return Array.isArray(firstAvailableVariant?.images)
      ? firstAvailableVariant.images.filter(Boolean)
      : [];
  }

  return [];
}

export default function useProductCardMedia(product) {
  const safeProduct = useMemo(
    () => ({
      variants: {},
      colors: [],
      images: [],
      thumbnail: "",
      image: null,
      name: "",
      price: "",
      id: null,
      ...product,
    }),
    [product],
  );

  const baseColor = useMemo(() => {
    const variants = safeProduct.variants || {};
    const colorsFromProduct = safeProduct.colors || [];

    const found = colorsFromProduct.find((color) => {
      const images = getImagesFromVariantArray(variants?.[color]);
      return images.length > 0;
    });

    if (found) return found;

    const variantKeys = Object.keys(variants);
    const firstKeyWithImages = variantKeys.find((key) => {
      const images = getImagesFromVariantArray(variants?.[key]);
      return images.length > 0;
    });

    if (firstKeyWithImages) return firstKeyWithImages;

    return "silver";
  }, [safeProduct.colors, safeProduct.variants]);

  const { rawMain, rawHover } = useMemo(() => {
    const variants = safeProduct.variants || {};
    const variantImages = getImagesFromVariantArray(variants?.[baseColor]);

    const allImagesFromVariants = Object.values(variants)
      .flatMap((v) => getImagesFromVariantArray(v))
      .filter(Boolean);

    const imageValue = safeProduct.image;
    const imageSrc =
      typeof imageValue === "string"
        ? imageValue
        : imageValue && typeof imageValue === "object"
          ? imageValue.src || imageValue.url || ""
          : "";

    const main = variantImages[0] || safeProduct.thumbnail || imageSrc || "";

    let hover = variantImages[1] || null;

    if (
      !hover &&
      Array.isArray(safeProduct.images) &&
      safeProduct.images.length > 1
    ) {
      hover =
        main === safeProduct.images[0]
          ? safeProduct.images[1]
          : safeProduct.images[0];
    }

    if (!hover) {
      hover = allImagesFromVariants.find((img) => img !== main) || null;
    }

    return { rawMain: main, rawHover: hover };
  }, [
    safeProduct.variants,
    safeProduct.thumbnail,
    safeProduct.image,
    safeProduct.images,
    baseColor,
  ]);

  const mainSrc = useMemo(() => sanitizeImageUrl(rawMain), [rawMain]);
  const hoverSrc = useMemo(() => sanitizeImageUrl(rawHover), [rawHover]);

  const imageMeta = useMemo(() => {
    if (typeof safeProduct.image === "string") {
      return { srcSet: undefined, sizes: undefined };
    }

    return {
      srcSet: safeProduct.image?.srcSet,
      sizes: safeProduct.image?.sizes,
    };
  }, [safeProduct.image]);

  return { safeProduct, baseColor, mainSrc, hoverSrc, imageMeta };
}
