import { useState } from "react";

import {
  createEmptyVariant,
  makePreviewList,
} from "@/pages/admin/helpers/productHelpers";

export default function AdminProductCreateModal({
  onClose,
  onCreate,
  initialData,
  isSaving = false,
}) {
  const API_ORIGIN =
    import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com";
  const FRONTEND_BASE_PATH = import.meta.env.BASE_URL || "/";

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
    stockQuantity: initialData?.stockQuantity ?? "",
    isBestSeller: initialData?.isBestSeller || false,
    variants: [createEmptyVariant()],

    // common / category-based details
    length: initialData?.details?.totalLengthCm ?? "",
    weight: initialData?.details?.weightG ?? "",
    bandWidth: initialData?.details?.bandWidthMm ?? "",
    chainType: initialData?.details?.chain || "",
    adjustableFrom: initialData?.details?.adjustableFromCm ?? "",
    adjustableTo: initialData?.details?.adjustableToCm ?? "",
    braceletLength:
      initialData?.details?.braceletLengthCm ??
      initialData?.details?.totalBraceletLengthCm ??
      "",
    metal: initialData?.details?.metal || "",
    personalType: initialData?.details?.personalType || "ring",
  });

  const [error, setError] = useState("");
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState(null);

  const handleChange = (key, value) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [key]: value,
      };

      if (key === "category") {
        const shouldKeepSizes =
          value === "rings" || value === "bracelets" || value === "personal";

        if (!shouldKeepSizes) {
          next.sizes = "";
        }

        // reset some fields when switching categories
        if (value !== "necklaces") {
          next.length = "";
          next.chainType = "";
          next.adjustableFrom = "";
          next.adjustableTo = "";
        }

        if (value !== "bracelets") {
          next.braceletLength = "";
        }

        if (value !== "rings") {
          next.bandWidth = "";
        }

        if (value !== "personal") {
          next.personalType = "ring";
        }
      }

      if (key === "personalType") {
        if (value !== "necklace") {
          next.length = "";
          next.chainType = "";
          next.adjustableFrom = "";
          next.adjustableTo = "";
        }

        if (value !== "bracelet") {
          next.braceletLength = "";
        }

        if (value !== "necklace") {
          next.bandWidth = "";
        }
      }

      return next;
    });

    setError("");
  };

  const handleVariantChange = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [key]: value } : variant,
      ),
    }));

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
    setForm((prev) => ({
      ...prev,
      variants:
        prev.variants.length === 1
          ? [createEmptyVariant()]
          : prev.variants.filter((_, i) => i !== index),
    }));

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

      const base = API_ORIGIN.replace(/\/api$/, "");
      const uploadUrl = `${base}/api/uploads/product-image`;

      console.log("Uploading to:", uploadUrl); // Debugging tikslais

      const res = await fetch(uploadUrl, {
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
      console.error("Upload error:", err);
      setError(err.message || "Image upload failed.");
    } finally {
      setUploadingVariantIndex(null);
      event.target.value = "";
    }
  };

  const parsedSizes = form.sizes
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const normalizedSizes = parsedSizes.length ? parsedSizes : ["one size"];
  const stockValue = Math.max(0, Number(form.stockQuantity) || 0);

  const shouldShowSizes =
    form.category === "rings" ||
    form.category === "bracelets" ||
    form.category === "personal";

  const sizesPlaceholder =
    form.category === "bracelets" ? "S/M, M/L" : "15.5, 16, 17.5, 18";

  const isRingCategory = form.category === "rings";
  const isNecklaceCategory = form.category === "necklaces";
  const isBraceletCategory = form.category === "bracelets";
  const isEarringCategory = form.category === "earrings";
  const isPersonalCategory = form.category === "personal";

  const isPersonalNecklace =
    isPersonalCategory && form.personalType === "necklace";
  const isPersonalBracelet =
    isPersonalCategory && form.personalType === "bracelet";

  const shouldShowNecklaceFields = isNecklaceCategory || isPersonalNecklace;

  const shouldShowBraceletFields = isBraceletCategory || isPersonalBracelet;

  const shouldShowRingBandWidth = isRingCategory;

  const shouldShowWeight =
    isRingCategory ||
    isNecklaceCategory ||
    isBraceletCategory ||
    isEarringCategory ||
    isPersonalCategory;

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

    const variantStock = Object.fromEntries(
      normalizedVariants.map((variant) => [
        variant.name,
        Object.fromEntries(normalizedSizes.map((size) => [size, stockValue])),
      ]),
    );

    const details = {
      detailsText: form.description.trim(),
      metal: form.metal.trim() || undefined,
      weightG: shouldShowWeight ? Number(form.weight || 0) : undefined,

      // necklaces
      totalLengthCm: shouldShowNecklaceFields
        ? Number(form.length || 0)
        : undefined,
      adjustableFromCm: shouldShowNecklaceFields
        ? Number(form.adjustableFrom || 0)
        : undefined,
      adjustableToCm: shouldShowNecklaceFields
        ? Number(form.adjustableTo || 0)
        : undefined,
      chain: shouldShowNecklaceFields ? form.chainType.trim() || "" : undefined,

      // rings
      bandWidthMm: shouldShowRingBandWidth
        ? Number(form.bandWidth || 0)
        : undefined,

      // bracelets
      braceletLengthCm: shouldShowBraceletFields
        ? Number(form.braceletLength || 0)
        : undefined,

      // personal
      personalType: isPersonalCategory ? form.personalType : undefined,
    };

    const payload = {
      id: form.id.trim(),
      name: form.name.trim(),
      category: form.category,
      priceValue: Number(form.priceValue || 0),
      createdAt: form.createdAt,
      description: form.description.trim(),
      sizes: normalizedSizes,
      stockQuantity: stockValue,
      variants: normalizedVariants,
      variantStock,
      isBestSeller: form.isBestSeller,
      details,
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
    onCreate?.(payload);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-black bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {isSaving ? (
          <div className="absolute inset-0 z-[20] flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-3 border border-black bg-white px-6 py-5">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              <p className="font-ui text-sm text-black">
                {initialData ? "Updating product..." : "Saving product..."}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-b border-black px-6 py-4">
          <h2 className="font-display text-2xl leading-none">
            {initialData ? "Edit product" : "Add new product"}
          </h2>

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
              onChange={(e) => handleChange("id", e.target.value)}
              disabled={!!initialData}
              className={`h-12 w-full border border-black px-4 outline-none ${
                initialData ? "cursor-not-allowed bg-black/5" : ""
              }`}
            />
          </div>

          <div>
            <label className="mb-2 block text-black/70">Product name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Example Ring"
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
                placeholder="95"
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-black/70">
                {initialData
                  ? "Stock quantity (edit disabled)"
                  : "Stock quantity"}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.stockQuantity}
                onChange={(e) => handleChange("stockQuantity", e.target.value)}
                placeholder="3"
                disabled={!!initialData}
                className={`h-12 w-full border border-black px-4 outline-none ${
                  initialData ? "cursor-not-allowed bg-black/5" : ""
                }`}
              />
            </div>
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
              placeholder="Write product description..."
              rows={5}
              className="w-full resize-none border border-black px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-black/70">Metal</label>
            <input
              type="text"
              value={form.metal}
              onChange={(e) => handleChange("metal", e.target.value)}
              placeholder="Silver / Gold / Pearl"
              className="h-12 w-full border border-black px-4 outline-none"
            />
          </div>

          {isPersonalCategory ? (
            <div>
              <label className="mb-2 block text-black/70">Personal type</label>
              <select
                value={form.personalType}
                onChange={(e) => handleChange("personalType", e.target.value)}
                className="h-12 w-full border border-black bg-white px-4 outline-none"
              >
                <option value="ring">Ring</option>
                <option value="necklace">Necklace</option>
                <option value="bracelet">Bracelet</option>
              </select>
            </div>
          ) : null}

          {shouldShowWeight ? (
            <div>
              <label className="mb-2 block text-black/70">Weight (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.weight || ""}
                onChange={(e) => handleChange("weight", e.target.value)}
                placeholder="4.5"
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
          ) : null}

          {shouldShowRingBandWidth ? (
            <div>
              <label className="mb-2 block text-black/70">
                Band width (mm)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.bandWidth || ""}
                onChange={(e) => handleChange("bandWidth", e.target.value)}
                placeholder="2.5"
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
          ) : null}

          {shouldShowNecklaceFields ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-black/70">
                  Necklace length (cm)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.length || ""}
                  onChange={(e) => handleChange("length", e.target.value)}
                  placeholder="45"
                  className="h-12 w-full border border-black px-4 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-black/70">Chain type</label>
                <input
                  type="text"
                  value={form.chainType || ""}
                  onChange={(e) => handleChange("chainType", e.target.value)}
                  placeholder="Curb"
                  className="h-12 w-full border border-black px-4 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-black/70">
                  Adjustable from (cm)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.adjustableFrom || ""}
                  onChange={(e) =>
                    handleChange("adjustableFrom", e.target.value)
                  }
                  placeholder="41"
                  className="h-12 w-full border border-black px-4 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-black/70">
                  Adjustable to (cm)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.adjustableTo || ""}
                  onChange={(e) => handleChange("adjustableTo", e.target.value)}
                  placeholder="45"
                  className="h-12 w-full border border-black px-4 outline-none"
                />
              </div>
            </div>
          ) : null}

          {shouldShowBraceletFields ? (
            <div>
              <label className="mb-2 block text-black/70">
                Bracelet length (cm)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.braceletLength || ""}
                onChange={(e) => handleChange("braceletLength", e.target.value)}
                placeholder="18.5"
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
          ) : null}

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
                        placeholder={
                          "example:\npearl-necklace-1.webp\npearl-necklace-2.webp"
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

          {shouldShowSizes ? (
            <div>
              <label className="mb-2 block text-black/70">
                Sizes (comma separated)
              </label>
              <input
                type="text"
                value={form.sizes}
                onChange={(e) => handleChange("sizes", e.target.value)}
                placeholder={sizesPlaceholder}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
          ) : null}

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
              {isSaving
                ? initialData
                  ? "Updating..."
                  : "Saving..."
                : initialData
                  ? "Update product"
                  : "Save product"}
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
