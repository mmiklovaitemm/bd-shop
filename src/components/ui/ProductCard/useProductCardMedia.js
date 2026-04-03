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

  // If the array contains simple strings (URLs)
  if (typeof firstItem === "string") {
    return variantArray.filter(Boolean);
  }

  // If the array contains objects with structure like { stock, images: [] }
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
      images: [], // General product images array
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

    // Look for a color that has images assigned in the variants object
    const found = colorsFromProduct.find((color) => {
      const images = getImagesFromVariantArray(variants?.[color]);
      return images.length > 0;
    });

    if (found) return found;

    // If no match found in colors list, take the first key from variants object
    const variantKeys = Object.keys(variants);
    const firstKeyWithImages = variantKeys.find((key) => {
      const images = getImagesFromVariantArray(variants?.[key]);
      return images.length > 0;
    });

    if (firstKeyWithImages) return firstKeyWithImages;

    return "silver"; // Default fallback
  }, [safeProduct.colors, safeProduct.variants]);

  // 3. Determine Main and Hover images
  const { mainSrc, hoverSrc } = useMemo(() => {
    const variants = safeProduct.variants || {};
    const variantImages = getImagesFromVariantArray(variants?.[baseColor]);

    const imageValue = safeProduct.image;
    const imageSrc =
      typeof imageValue === "string"
        ? imageValue
        : imageValue && typeof imageValue === "object"
          ? imageValue.src || imageValue.url || ""
          : "";

    // MAIN IMAGE:
    // Priority: Variant's first image > product thumbnail > main image object source
    const main = variantImages[0] || safeProduct.thumbnail || imageSrc || "";

    // HOVER IMAGE (The secondary view):
    // Priority:
    // 1. The second image from the specific variant
    // 2. The second image from the general product "images" array
    // 3. Otherwise null
    let hover = variantImages[1] || null;

    if (
      !hover &&
      Array.isArray(safeProduct.images) &&
      safeProduct.images.length > 1
    ) {
      // If the main image is the same as the first in the array, use the second one
      // Otherwise, we can use the first one from the array as hover
      hover =
        main === safeProduct.images[0]
          ? safeProduct.images[1]
          : safeProduct.images[0];
    }

    return { mainSrc: main, hoverSrc: hover };
  }, [
    safeProduct.variants,
    safeProduct.thumbnail,
    safeProduct.image,
    safeProduct.images, // Track general images array for hover fallback
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
