import { useMemo } from "react";

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

    const found = colorsFromProduct.find(
      (c) => (variants?.[c]?.length ?? 0) > 0,
    );
    if (found) return found;

    const variantKeys = Object.keys(variants);
    const firstKeyWithImages = variantKeys.find(
      (k) => (variants?.[k]?.length ?? 0) > 0,
    );
    if (firstKeyWithImages) return firstKeyWithImages;

    return "silver";
  }, [safeProduct.colors, safeProduct.variants]);

  const { mainSrc, hoverSrc } = useMemo(() => {
    const variants = safeProduct.variants || {};
    const arr = variants?.[baseColor] || [];

    const imageValue = safeProduct.image;

    const imageSrc =
      typeof imageValue === "string"
        ? imageValue
        : imageValue && typeof imageValue === "object"
          ? imageValue.src || imageValue.url || ""
          : "";

    const main = arr[0] || safeProduct.thumbnail || imageSrc || "";

    const hover = arr[1] || null;

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
