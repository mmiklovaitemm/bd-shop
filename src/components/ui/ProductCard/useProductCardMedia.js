import { useMemo } from "react";

// PAGALBINĖ FUNKCIJA NUORODŲ VALYMUI
const cleanUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  if (url.includes("cloudinary.com")) return url;
  // Jei nuoroda turi localhost, nukerpame viską iki /products/ dalies
  if (url.includes("localhost:")) {
    const parts = url.split("/products/");
    if (parts.length > 1) return "products/" + parts[1];
  }
  // Pašalina bet kokią http://localhost:xxxx/ dalį
  return url.replace(/^https?:\/\/localhost:\d+\//, "");
};

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
    return variantArray.filter(Boolean).map(cleanUrl); // VALOME NUORODAS
  }

  if (isVariantObject(firstItem)) {
    const firstAvailableVariant =
      variantArray.find((item) => Number(item?.stock || 0) > 0) ||
      variantArray[0];

    return Array.isArray(firstAvailableVariant?.images)
      ? firstAvailableVariant.images.filter(Boolean).map(cleanUrl) // VALOME NUORODAS
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

  const { mainSrc, hoverSrc } = useMemo(() => {
    const variants = safeProduct.variants || {};
    const variantImages = getImagesFromVariantArray(variants?.[baseColor]);

    const allImagesFromVariants = Object.values(variants)
      .flatMap((v) => getImagesFromVariantArray(v))
      .filter(Boolean);

    const imageValue = safeProduct.image;
    const imageSrc =
      typeof imageValue === "string"
        ? cleanUrl(imageValue)
        : imageValue && typeof imageValue === "object"
          ? cleanUrl(imageValue.src || imageValue.url || "") // VALOME
          : "";

    const main =
      variantImages[0] || cleanUrl(safeProduct.thumbnail) || imageSrc || "";

    let hover = variantImages[1] || null;

    if (
      !hover &&
      Array.isArray(safeProduct.images) &&
      safeProduct.images.length > 1
    ) {
      hover = cleanUrl(
        main === cleanUrl(safeProduct.images[0])
          ? safeProduct.images[1]
          : safeProduct.images[0],
      );
    }

    if (!hover) {
      hover =
        allImagesFromVariants.find((img) => cleanUrl(img) !== main) || null;
    }

    return { mainSrc: main, hoverSrc: hover ? cleanUrl(hover) : null };
  }, [
    safeProduct.variants,
    safeProduct.thumbnail,
    safeProduct.image,
    safeProduct.images,
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
