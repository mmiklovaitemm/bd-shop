import { useState } from "react";
import {
  createEmptyVariant,
  makePreviewList,
} from "@/pages/admin/helpers/productHelpers";
import Loader from "@/components/ui/Loader";
import ProductImage from "@/components/ui/ProductCard/ProductImage";

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
    variants: initialData?.variants?.map((v) => ({
      ...v,
      images: Array.isArray(v.images) ? v.images.join("\n") : v.images || "",
    })) || [createEmptyVariant()],

    // Metadata fields
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

  // FIXED: Sanitized URL generator for API requests
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
      if (key === "category") {
        const shouldKeepSizes = ["rings", "bracelets", "personal"].includes(
          value,
        );
        if (!shouldKeepSizes) next.sizes = "";
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
      variants: prev.variants.map((v, i) => {
        if (i !== variantIndex) return v;
        const currentImages = String(v.images || "")
          .split("\n")
          .map((img) => img.trim())
          .filter(Boolean);
        const nextImages = currentImages
          .filter((img) => img !== imageToRemove)
          .join("\n");
        return { ...v, images: nextImages };
      }),
    }));
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

      const uploadUrl = getSafeApiUrl("/uploads/product-image");

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload failed");
      const imageUrl = data?.file?.url || "";

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
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploadingVariantIndex(null);
      event.target.value = "";
    }
  };

  const handleSubmit = () => {
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

    if (!form.id || !form.name || normalizedVariants.length === 0) {
      setError(
        "Please ensure ID, Name, and at least one variant with images are provided.",
      );
      return;
    }

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
      details: {
        detailsText: form.description.trim(),
        metal: form.metal,
        weightG: Number(form.weight) || undefined,
        totalLengthCm: Number(form.length) || undefined,
        adjustableFromCm: Number(form.adjustableFrom) || undefined,
        adjustableToCm: Number(form.adjustableTo) || undefined,
        chain: form.chainType,
        bandWidthMm: Number(form.bandWidth) || undefined,
        braceletLengthCm: Number(form.braceletLength) || undefined,
        personalType:
          form.category === "personal" ? form.personalType : undefined,
      },
    };

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
              <Loader className="h-7 w-7" />
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
            className="border border-black bg-white px-3 py-2 text-sm"
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
              <label className="mb-1 block text-black/50">Product ID</label>
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
            <div>
              <label className="mb-1 block text-black/50">Stock Quantity</label>
              <input
                type="number"
                value={form.stockQuantity}
                onChange={(e) => handleChange("stockQuantity", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-black/50">Created Date</label>
              <input
                type="date"
                value={form.createdAt}
                onChange={(e) => handleChange("createdAt", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-black/50">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className="w-full border border-black p-4 outline-none resize-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-black/50">Metal</label>
              <input
                type="text"
                value={form.metal}
                onChange={(e) => handleChange("metal", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-black/50">Weight (g)</label>
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
          </div>

          {/* Variants section */}
          <div className="mt-4 border-t border-black pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg">Product Variants</h3>
              <button
                type="button"
                onClick={handleAddVariant}
                className="border border-black px-3 py-1 text-xs hover:bg-black hover:text-white transition-colors"
              >
                Add Variant
              </button>
            </div>

            {form.variants.map((variant, idx) => {
              // Convert text to array for the preview helper correctly
              const imageArray = String(variant.images || "")
                .split("\n")
                .map((img) => img.trim())
                .filter(Boolean);
              const preview = makePreviewList({
                category: form.category,
                rawValue: imageArray, // We pass the array, not the string
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
                    className="w-full border border-black p-3 outline-none resize-none bg-white"
                  />

                  <div className="mt-2 flex gap-3">
                    <label className="cursor-pointer border border-black bg-black text-white px-4 py-2 text-xs">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleUploadImage(e, idx)}
                        disabled={uploadingVariantIndex !== null}
                      />
                      {uploadingVariantIndex === idx
                        ? "Uploading..."
                        : "Upload Image"}
                    </label>
                    {form.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="text-red-600 text-xs border border-red-600 px-3 py-2"
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
                          className="relative aspect-square border border-black/10 bg-white overflow-hidden"
                        >
                          <ProductImage
                            src={src}
                            loaded={true}
                            className="object-cover"
                          />
                          <button
                            onClick={() => handleRemoveVariantImage(idx, src)}
                            className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full z-10"
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

          <div className="flex gap-3 mt-4">
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
