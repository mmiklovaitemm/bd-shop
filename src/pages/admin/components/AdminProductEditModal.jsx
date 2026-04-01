import { useMemo, useState } from "react";

import {
  createEmptyVariant,
  getImageTextFromVariant,
  makePreviewList,
} from "@/pages/admin/helpers/productHelpers";

export default function AdminProductEditModal({
  onClose,
  onUpdate,
  initialData,
  isSaving = false,
}) {
  const API_ORIGIN =
    import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com";
  const FRONTEND_BASE_PATH = import.meta.env.BASE_URL || "/";

  function buildVariantStockState(variants = {}) {
    const result = {};

    for (const [color, colorVariants] of Object.entries(variants || {})) {
      if (!Array.isArray(colorVariants)) continue;

      result[color] = {};

      for (const variant of colorVariants) {
        const rawSize = String(variant?.size || "").trim();
        const sizeKey = rawSize || "default";

        result[color][sizeKey] = Math.max(0, Number(variant?.stock) || 0);
      }
    }

    return result;
  }

  function buildVariantsStateFromInitialData(product) {
    const colors = Array.isArray(product?.colors) ? product.colors : [];

    if (!colors.length) {
      return [createEmptyVariant()];
    }

    const result = colors.map((color) => ({
      name: color,
      images: getImageTextFromVariant(product?.variants?.[color]),
    }));

    return result.length ? result : [createEmptyVariant()];
  }

  const [form, setForm] = useState({
    id: initialData?.id || "",
    name: initialData?.name || "",
    category: initialData?.category || "rings",
    priceValue: initialData?.priceValue || "",
    createdAt: initialData?.createdAt
      ? String(initialData.createdAt).slice(0, 10)
      : "",
    description: initialData?.details?.detailsText || "",
    sizes: initialData?.sizes?.join(", ") || "",
    isBestSeller: initialData?.isBestSeller || false,
    variants: buildVariantsStateFromInitialData(initialData),
    variantStock: buildVariantStockState(initialData?.variants),
  });

  const [error, setError] = useState("");
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState(null);

  const parsedSizes = useMemo(() => {
    return form.sizes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [form.sizes]);

  const normalizedSizes = parsedSizes.length ? parsedSizes : ["one size"];

  const totalStock = useMemo(() => {
    return Object.values(form.variantStock || {}).reduce((total, colorMap) => {
      return (
        total +
        Object.values(colorMap || {}).reduce((sum, value) => {
          return sum + Math.max(0, Number(value) || 0);
        }, 0)
      );
    }, 0);
  }, [form.variantStock]);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
    setError("");
  };

  const handleVariantChange = (index, key, value) => {
    setForm((prev) => {
      const nextVariants = prev.variants.map((variant, i) =>
        i === index ? { ...variant, [key]: value } : variant,
      );

      let nextVariantStock = prev.variantStock;

      if (key === "name") {
        const oldName = String(prev.variants[index]?.name || "")
          .trim()
          .toLowerCase();
        const newName = String(value || "")
          .trim()
          .toLowerCase();

        if (oldName !== newName) {
          nextVariantStock = { ...prev.variantStock };

          const oldStock = nextVariantStock[oldName];
          delete nextVariantStock[oldName];

          if (newName) {
            nextVariantStock[newName] =
              oldStock ||
              Object.fromEntries(normalizedSizes.map((size) => [size, 0]));
          }
        }
      }

      return {
        ...prev,
        variants: nextVariants,
        variantStock: nextVariantStock,
      };
    });

    setError("");
  };

  const handleAddVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, createEmptyVariant()],
    }));
    setError("");
  };

  const handleRemoveVariant = (index) => {
    setForm((prev) => {
      const removedName = String(prev.variants[index]?.name || "")
        .trim()
        .toLowerCase();

      const nextVariants =
        prev.variants.length === 1
          ? [createEmptyVariant()]
          : prev.variants.filter((_, i) => i !== index);

      const nextVariantStock = { ...prev.variantStock };
      if (removedName) delete nextVariantStock[removedName];

      return {
        ...prev,
        variants: nextVariants,
        variantStock: nextVariantStock,
      };
    });

    setError("");
  };

  const handleRemoveVariantImage = (variantIndex, imageToRemove) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) => {
        if (i !== variantIndex) return variant;

        const nextImages = String(variant.images || "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
          .filter((item) => item !== imageToRemove)
          .join("\n");

        return {
          ...variant,
          images: nextImages,
        };
      }),
    }));

    setError("");
  };

  const handleUploadImage = async (event, variantIndex) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError("");
      setUploadingVariantIndex(variantIndex);

      const formData = new FormData();
      formData.append("image", file);
      formData.append("category", form.category);

      const res = await fetch(`${API_ORIGIN}/api/uploads/product-image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to upload image.");
      }

      const imageUrl = data?.file?.url || "";

      if (!imageUrl) {
        throw new Error("Uploaded image URL was not returned.");
      }

      setForm((prev) => ({
        ...prev,
        variants: prev.variants.map((variant, i) => {
          if (i !== variantIndex) return variant;

          const current = String(variant.images || "").trim();

          return {
            ...variant,
            images: current ? `${current}\n${imageUrl}` : imageUrl,
          };
        }),
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Image upload failed.");
    } finally {
      setUploadingVariantIndex(null);
      event.target.value = "";
    }
  };

  const handleSizesChange = (value) => {
    const nextSizes = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const effectiveSizes = nextSizes.length ? nextSizes : ["one size"];

    setForm((prev) => {
      const nextVariantStock = {};

      for (const variant of prev.variants) {
        const color = String(variant.name || "")
          .trim()
          .toLowerCase();

        if (!color) continue;

        nextVariantStock[color] = Object.fromEntries(
          effectiveSizes.map((size) => [
            size,
            Math.max(0, Number(prev.variantStock?.[color]?.[size]) || 0),
          ]),
        );
      }

      return {
        ...prev,
        sizes: value,
        variantStock: nextVariantStock,
      };
    });

    setError("");
  };

  const handleVariantStockChange = (color, size, value) => {
    const safeValue = Math.max(0, Number(value) || 0);

    setForm((prev) => ({
      ...prev,
      variantStock: {
        ...prev.variantStock,
        [color]: {
          ...(prev.variantStock?.[color] || {}),
          [size]: safeValue,
        },
      },
    }));

    setError("");
  };

  const renderVariantStockSection = (variantName) => {
    const color = String(variantName || "")
      .trim()
      .toLowerCase();

    if (!color) return null;

    return (
      <div className="border border-black p-4">
        <h3 className="mb-4 font-ui text-sm font-medium capitalize">
          {variantName} stock
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          {normalizedSizes.map((size) => (
            <div key={`${color}-${size}`}>
              <label className="mb-2 block text-black/70">
                {size === "one size" ? "Stock quantity" : `Size ${size}`}
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={form.variantStock?.[color]?.[size] ?? 0}
                onChange={(e) =>
                  handleVariantStockChange(color, size, e.target.value)
                }
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = () => {
    const normalizedVariants = form.variants
      .map((variant) => ({
        name: String(variant.name || "")
          .trim()
          .toLowerCase(),
        images: String(variant.images || "")
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      }))
      .filter((variant) => variant.name && variant.images.length > 0);

    const normalizedVariantStock = Object.fromEntries(
      normalizedVariants.map((variant) => {
        const color = variant.name;

        const nextSizeMap = Object.fromEntries(
          normalizedSizes.map((size) => [
            size,
            Math.max(
              0,
              Number(
                form.variantStock?.[color]?.[size] ??
                  form.variantStock?.[color]?.default ??
                  form.variantStock?.[color]?.["one size"] ??
                  0,
              ) || 0,
            ),
          ]),
        );

        return [color, nextSizeMap];
      }),
    );

    const payload = {
      id: form.id.trim(),
      name: form.name.trim(),
      category: form.category,
      priceValue: Number(form.priceValue || 0),
      createdAt: form.createdAt,
      description: form.description.trim(),
      variants: normalizedVariants,
      sizes: normalizedSizes,
      variantStock: normalizedVariantStock,
      isBestSeller: form.isBestSeller,
    };

    if (!payload.id) {
      setError("Product id is required.");
      return;
    }

    if (!payload.name) {
      setError("Product name is required.");
      return;
    }

    if (!payload.priceValue || payload.priceValue <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    if (!payload.createdAt) {
      setError("Created date is required.");
      return;
    }

    if (!payload.description) {
      setError("Description is required.");
      return;
    }

    if (payload.variants.length === 0) {
      setError("Add at least one variant with images.");
      return;
    }

    setError("");
    onUpdate?.(payload);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-black bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black px-6 py-4">
          <h2 className="font-display text-2xl leading-none">Edit product</h2>

          <button
            type="button"
            className="border border-black bg-white px-3 py-2"
            onClick={onClose}
            disabled={isSaving}
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 p-6 font-ui text-sm">
          <div>
            <label className="mb-2 block text-black/70">Product id</label>
            <input
              type="text"
              value={form.id}
              disabled
              className="h-12 w-full cursor-not-allowed border border-black bg-black/5 px-4 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-black/70">Product name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-12 w-full border border-black px-4 outline-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-black/70">Category</label>
              <select
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="h-12 w-full border border-black bg-white px-4 outline-none"
              >
                <option value="rings">Rings</option>
                <option value="earrings">Earrings</option>
                <option value="necklaces">Necklaces</option>
                <option value="bracelets">Bracelets</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-black/70">Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.priceValue}
                onChange={(e) => handleChange("priceValue", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-black/70">Total stock</label>
            <input
              type="text"
              value={totalStock}
              disabled
              className="h-12 w-full cursor-not-allowed border border-black bg-black/5 px-4 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-black/70">Created date</label>
            <input
              type="date"
              value={form.createdAt}
              onChange={(e) => handleChange("createdAt", e.target.value)}
              className="h-12 w-full border border-black px-4 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-black/70">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={5}
              className="w-full resize-none border border-black px-4 py-3 outline-none"
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-black/70">Variants</label>

              <button
                type="button"
                className="border border-black bg-white px-4 py-2 text-sm"
                onClick={handleAddVariant}
                disabled={isSaving}
              >
                Add variant
              </button>
            </div>

            <div className="space-y-6">
              {form.variants.map((variant, index) => {
                const preview = makePreviewList({
                  category: form.category,
                  rawValue: variant.images,
                  apiOrigin: API_ORIGIN,
                  frontendBasePath: FRONTEND_BASE_PATH,
                });

                return (
                  <div
                    key={index}
                    className="space-y-4 border border-black p-4"
                  >
                    <div>
                      <label className="mb-2 block text-black/70">
                        Variant name
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) =>
                          handleVariantChange(index, "name", e.target.value)
                        }
                        placeholder="pearl / silver / soft blue"
                        className="h-12 w-full border border-black px-4 outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-black/70">
                        Images filenames / URLs
                      </label>
                      <textarea
                        value={variant.images}
                        onChange={(e) =>
                          handleVariantChange(index, "images", e.target.value)
                        }
                        rows={4}
                        className="w-full resize-none border border-black px-4 py-3 outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center border border-black bg-white px-4 py-3 text-sm">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleUploadImage(e, index)}
                          disabled={uploadingVariantIndex !== null || isSaving}
                        />
                        {uploadingVariantIndex === index
                          ? "Uploading..."
                          : "Upload image"}
                      </label>

                      {form.variants.length > 1 ? (
                        <button
                          type="button"
                          className="border border-red-600 bg-white px-4 py-3 text-sm text-red-600"
                          onClick={() => handleRemoveVariant(index)}
                          disabled={isSaving || uploadingVariantIndex !== null}
                        >
                          Remove variant
                        </button>
                      ) : null}
                    </div>

                    {preview.length ? (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {preview.map((src, imgIndex) => (
                          <div
                            key={src + imgIndex}
                            className="border border-black p-2"
                          >
                            <img
                              src={src}
                              alt={`Variant preview ${imgIndex + 1}`}
                              className="h-28 w-full object-cover"
                            />

                            <button
                              type="button"
                              className="mt-2 w-full border border-red-600 bg-white px-3 py-2 text-xs text-red-600"
                              onClick={() =>
                                handleRemoveVariantImage(index, src)
                              }
                              disabled={
                                isSaving || uploadingVariantIndex !== null
                              }
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-black/70">
              Sizes (comma separated)
            </label>
            <input
              type="text"
              value={form.sizes}
              onChange={(e) => handleSizesChange(e.target.value)}
              placeholder="15.5, 16, 17.5, 18"
              className="h-12 w-full border border-black px-4 outline-none"
            />
          </div>

          <div className="space-y-4">
            {form.variants
              .map((variant) => String(variant.name || "").trim())
              .filter(Boolean)
              .map((variantName) => (
                <div key={variantName}>
                  {renderVariantStockSection(variantName)}
                </div>
              ))}
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.isBestSeller}
              onChange={(e) => handleChange("isBestSeller", e.target.checked)}
              className="h-4 w-4"
            />
            <span>Best seller</span>
          </label>

          {error ? (
            <div className="border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="border border-black bg-black px-4 py-3 text-white disabled:opacity-60"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? "Updating..." : "Update product"}
            </button>

            <button
              type="button"
              className="border border-black bg-white px-4 py-3 disabled:opacity-60"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
