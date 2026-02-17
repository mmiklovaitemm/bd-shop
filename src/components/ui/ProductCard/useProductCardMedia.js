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
    const colors = safeProduct.colors || [];
    const variants = safeProduct.variants || {};
    const found = colors.find((c) => (variants?.[c]?.length ?? 0) > 0);
    return found || "silver";
  }, [safeProduct.colors, safeProduct.variants]);

  const { mainSrc, hoverSrc } = useMemo(() => {
    const variants = safeProduct.variants || {};
    const arr = variants[baseColor] || [];

    const main =
      arr[0] ||
      safeProduct.thumbnail ||
      (typeof safeProduct.image === "string"
        ? safeProduct.image
        : safeProduct.image?.src) ||
      "";

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
