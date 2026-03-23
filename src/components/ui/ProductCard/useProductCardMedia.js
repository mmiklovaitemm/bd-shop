import { useMemo } from "react";

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

  const { mainSrc, hoverSrc } = useMemo(() => {
    const variants = safeProduct.variants || {};
    const images = getImagesFromVariantArray(variants?.[baseColor]);

    const imageValue = safeProduct.image;

    const imageSrc =
      typeof imageValue === "string"
        ? imageValue
        : imageValue && typeof imageValue === "object"
          ? imageValue.src || imageValue.url || ""
          : "";

    const main = images[0] || safeProduct.thumbnail || imageSrc || "";
    const hover = images[1] || null;

    return { mainSrc: main, hoverSrc: hover };
  }, [
    safeProduct.variants,
    safeProduct.thumbnail,
    safeProduct.image,
    baseColor,
  ]);

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
