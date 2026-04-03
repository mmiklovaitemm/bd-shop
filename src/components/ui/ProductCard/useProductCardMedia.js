// src/components/ui/ProductCard/useProductCardMedia.js
import { useMemo } from "react";

/**
 * Checks if the value is a variant object containing an images array
 */
function isVariantObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray(value.images)
  );
}

/**
 * Extracts images from a variant array
 */
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
  // 1. Create a safe product object with default values
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

  // 2. Determine the initial/base color
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

  // 3. Determine Main and Hover images
  const { mainSrc, hoverSrc } = useMemo(() => {
    const variants = safeProduct.variants || {};
    const variantImages = getImagesFromVariantArray(variants?.[baseColor]);

    // COLLECT ALL UNIQUE IMAGES FROM ALL VARIANTS AS FALLBACK
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

    // Priority: Current variant image > thumbnail > main image src
    const main = variantImages[0] || safeProduct.thumbnail || imageSrc || "";

    // HOVER LOGIC:
    // 1. Try second image of current variant
    // 2. Try second image of general images array
    // 3. Try ANY other image from any other variant (that isn't the main one)
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

    return { mainSrc: main, hoverSrc: hover };
  }, [
    safeProduct.variants,
    safeProduct.thumbnail,
    safeProduct.image,
    safeProduct.images,
    baseColor,
  ]);

  // 4. Prepare metadata (srcSet, sizes) for responsive images
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
