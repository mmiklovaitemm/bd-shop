import { useState } from "react";
import {
  createEmptyVariant,
  makePreviewList,
} from "@/pages/admin/helpers/productHelpers";
import Loader from "@/components/ui/Loader";
import ProductImage from "@/components/ui/ProductCard/ProductImage";

/**
 * Modal component for creating or editing a product.
 * Handles category-specific fields, variant management, and secure image uploads.
 */
export default function AdminProductCreateModal({
  onClose,
  onCreate,
  initialData,
  isSaving = false,
}) {
  const API_ORIGIN =
    import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com";
  const FRONTEND_BASE_PATH = import.meta.env.BASE_URL || "/";

  // Initialize form state with existing data (if editing) or defaults
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
    variants: initialData?.variants || [createEmptyVariant()],

    // Metadata / details fields
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

  /**
   * Helper to ensure API URLs are correctly formatted without double slashes or prefixes
   */
  const getSafeApiUrl = (path) => {
    const base = API_ORIGIN.replace(/\/api$/, "").replace(/\/$/, "");
    const cleanPath = path.startsWith("/api")
      ? path
      : `/api${path.startsWith("/") ? path : `/${path}`}`;
    return `${base}${cleanPath}`;
  };

  const handleChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      // Reset specific fields when switching categories to maintain data integrity
      if (key === "category") {
        if (!["rings", "bracelets", "personal"].includes(value))
          next.sizes = "";
        if (value !== "necklaces") {
          next.length =
            next.chainType =
            next.adjustableFrom =
            next.adjustableTo =
              "";
        }
        if (value !== "bracelets") next.braceletLength = "";
        if (value !== "rings") next.bandWidth = "";
        if (value !== "personal") next.personalType = "ring";
      }
      return next;
    });
    setError("");
  };

  const handleVariantChange = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [key]: value } : v,
      ),
    }));
    setError("");
  };

  const handleAddVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, createEmptyVariant()],
    }));
  };

  const handleRemoveVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      variants:
        prev.variants.length === 1
          ? [createEmptyVariant()]
          : prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveVariantImage = (variantIndex, imageToRemove) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => {
        if (i !== variantIndex) return v;
        const nextImages = String(v.images || "")
          .split("\n")
          .map((img) => img.trim())
          .filter((img) => img && img !== imageToRemove)
          .join("\n");
        return { ...v, images: nextImages };
      }),
    }));
  };

  /**
   * Uploads image to server and appends the returned URL to the variants image list
   */
  const handleUploadImage = async (event, variantIndex) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError("");
      setUploadingVariantIndex(variantIndex);

      const formData = new FormData();
      formData.append("image", file);
      formData.append("category", form.category);

      const uploadUrl = getSafeApiUrl("/uploads/product-image");

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload failed");

      const imageUrl = data?.file?.url || "";
      if (!imageUrl) throw new Error("Image URL missing from server response");

      setForm((prev) => ({
        ...prev,
        variants: prev.variants.map((v, i) => {
          if (i !== variantIndex) return v;
          const current = String(v.images || "").trim();
          return {
            ...v,
            images: current ? `${current}\n${imageUrl}` : imageUrl,
          };
        }),
      }));
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploadingVariantIndex(null);
      event.target.value = "";
    }
  };

  const handleSubmit = () => {
    // Construct cleaned variants for payload
    const normalizedVariants = form.variants
      .map((v) => ({
        name: String(v.name || "")
          .trim()
          .toLowerCase(),
        images: String(v.images || "")
          .split("\n")
          .map((img) => img.trim())
          .filter(Boolean),
      }))
      .filter((v) => v.name && v.images.length > 0);

    // Prepare metadata details object
    const details = {
      detailsText: form.description.trim(),
      metal: form.metal.trim() || undefined,
      weightG: Number(form.weight) || undefined,
      totalLengthCm: Number(form.length) || undefined,
      adjustableFromCm: Number(form.adjustableFrom) || undefined,
      adjustableToCm: Number(form.adjustableTo) || undefined,
      chain: form.chainType.trim() || undefined,
      bandWidthMm: Number(form.bandWidth) || undefined,
      braceletLengthCm: Number(form.braceletLength) || undefined,
      personalType:
        form.category === "personal" ? form.personalType : undefined,
    };

    const payload = {
      id: form.id.trim(),
      name: form.name.trim(),
      category: form.category,
      priceValue: Number(form.priceValue),
      createdAt: form.createdAt,
      description: form.description.trim(),
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      stockQuantity: Math.max(0, Number(form.stockQuantity)),
      variants: normalizedVariants,
      isBestSeller: form.isBestSeller,
      details,
    };

    // Final validation
    if (!payload.id || !payload.name || payload.variants.length === 0) {
      setError(
        "Please ensure ID, Name, and at least one variant with images are provided.",
      );
      return;
    }

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
        {isSaving && (
          <div className="absolute inset-0 z-[20] flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-3 border border-black bg-white px-6 py-5">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              <p className="font-ui text-sm text-black">
                Processing product...
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-black px-6 py-4">
          <h2 className="font-display text-2xl leading-none">
            {initialData ? "Edit product" : "Add new product"}
          </h2>
          <button
            type="button"
            className="border border-black px-3 py-2 text-sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 p-6 font-ui text-sm">
          {/* Main Attributes */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-black/50">
                Product ID (Unique Slug)
              </label>
              <input
                type="text"
                value={form.id}
                onChange={(e) => handleChange("id", e.target.value)}
                disabled={!!initialData}
                className="h-12 w-full border border-black px-4 outline-none disabled:bg-black/5"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-black/50">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-black/50">Category</label>
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
              <label className="mb-1 block text-black/50">Price (€)</label>
              <input
                type="number"
                step="0.01"
                value={form.priceValue}
                onChange={(e) => handleChange("priceValue", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
          </div>

          {/* Variants and Dynamic Previews */}
          <div className="mt-4 border-t border-black pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg">Product Variants</h3>
              <button
                type="button"
                onClick={handleAddVariant}
                className="border border-black px-3 py-1 text-xs"
              >
                Add Variant
              </button>
            </div>

            {form.variants.map((variant, idx) => {
              const preview = makePreviewList({
                category: form.category,
                rawValue: variant.images,
                apiOrigin: API_ORIGIN,
                frontendBasePath: FRONTEND_BASE_PATH,
              });

              return (
                <div
                  key={idx}
                  className="mb-6 border border-black/10 p-4 bg-gray-50/50"
                >
                  <input
                    type="text"
                    value={variant.name}
                    placeholder="Variant name (e.g., Pearl)"
                    onChange={(e) =>
                      handleVariantChange(idx, "name", e.target.value)
                    }
                    className="mb-2 h-10 w-full border border-black px-3 outline-none"
                  />
                  <textarea
                    value={variant.images}
                    rows={3}
                    placeholder="Image filenames or URLs..."
                    onChange={(e) =>
                      handleVariantChange(idx, "images", e.target.value)
                    }
                    className="w-full border border-black p-3 outline-none resize-none"
                  />

                  <div className="mt-2 flex gap-3">
                    <label className="cursor-pointer border border-black bg-black text-white px-4 py-2 text-xs">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleUploadImage(e, idx)}
                      />
                      {uploadingVariantIndex === idx
                        ? "Uploading..."
                        : "Upload Image"}
                    </label>
                    {form.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="text-red-600 text-xs"
                      >
                        Remove Variant
                      </button>
                    )}
                  </div>

                  {preview.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {preview.map((src, imgIdx) => (
                        <div
                          key={imgIdx}
                          className="relative aspect-square border border-black/10 bg-white"
                        >
                          <ProductImage
                            src={src}
                            loaded={true}
                            className="object-cover"
                          />
                          <button
                            onClick={() => handleRemoveVariantImage(idx, src)}
                            className="absolute -top-1 -right-1 bg-red-600 text-white w-4 h-4 text-[10px] flex items-center justify-center rounded-full"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="border border-red-600 bg-red-50 p-3 text-red-700 text-xs">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-1 bg-black text-white py-4 font-display text-lg uppercase tracking-widest disabled:opacity-50"
            >
              {initialData ? "Update Product" : "Save Product"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-black px-8 py-4 uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
