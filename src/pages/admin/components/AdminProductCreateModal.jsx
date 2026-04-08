import { useState } from "react";
import {
  createEmptyVariant,
  makePreviewList,
} from "@/pages/admin/helpers/productHelpers";
import Loader from "@/components/ui/Loader";

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

      const res = await fetch(getSafeApiUrl("/uploads/product-image"), {
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

  const isPersonalCategory = form.category === "personal";
  const shouldShowNecklaceFields =
    form.category === "necklaces" ||
    (isPersonalCategory && form.personalType === "necklace");
  const shouldShowBraceletFields =
    form.category === "bracelets" ||
    (isPersonalCategory && form.personalType === "bracelet");
  const shouldShowSizes = ["rings", "bracelets", "personal"].includes(
    form.category,
  );

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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-black/70">Product ID</label>
              <input
                type="text"
                value={form.id}
                onChange={(e) => handleChange("id", e.target.value)}
                disabled={!!initialData}
                className="h-12 w-full border border-black px-4 outline-none disabled:bg-black/5"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-black/70">Product Name</label>
              <input
                type="text"
                value={form.name}
                placeholder="Example Ring"
                onChange={(e) => handleChange("name", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
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
                step="0.01"
                value={form.priceValue}
                placeholder="95"
                onChange={(e) => handleChange("priceValue", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-black/70">
                {initialData ? "Stock (edit disabled)" : "Stock quantity"}
              </label>
              <input
                type="number"
                value={form.stockQuantity}
                placeholder="3"
                onChange={(e) => handleChange("stockQuantity", e.target.value)}
                disabled={!!initialData}
                className="h-12 w-full border border-black px-4 outline-none disabled:bg-black/5"
              />
            </div>
            <div>
              <label className="mb-2 block text-black/70">Created Date</label>
              <input
                type="date"
                value={form.createdAt}
                onChange={(e) => handleChange("createdAt", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-black/70">Description</label>
            <textarea
              value={form.description}
              placeholder="Write product description..."
              onChange={(e) => handleChange("description", e.target.value)}
              rows={5}
              className="w-full resize-none border border-black px-4 py-3 outline-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-black/70">Metal</label>
              <input
                type="text"
                value={form.metal}
                placeholder="Silver / Gold / Pearl"
                onChange={(e) => handleChange("metal", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
            {isPersonalCategory && (
              <div>
                <label className="mb-2 block text-black/70">
                  Personal Type
                </label>
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
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-black/70">Weight (g)</label>
              <input
                type="number"
                step="0.1"
                value={form.weight}
                placeholder="4.5"
                onChange={(e) => handleChange("weight", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
            {form.category === "rings" && (
              <div>
                <label className="mb-2 block text-black/70">
                  Band Width (mm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.bandWidth}
                  placeholder="2.5"
                  onChange={(e) => handleChange("bandWidth", e.target.value)}
                  className="h-12 w-full border border-black px-4 outline-none"
                />
              </div>
            )}
          </div>

          {shouldShowNecklaceFields && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-black/70">Length (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.length}
                  placeholder="45"
                  onChange={(e) => handleChange("length", e.target.value)}
                  className="h-12 w-full border border-black px-4 outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-black/70">Chain Type</label>
                <input
                  type="text"
                  value={form.chainType}
                  placeholder="Curb"
                  onChange={(e) => handleChange("chainType", e.target.value)}
                  className="h-12 w-full border border-black px-4 outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-black/70">
                  Adjust From (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.adjustableFrom}
                  placeholder="41"
                  onChange={(e) =>
                    handleChange("adjustableFrom", e.target.value)
                  }
                  className="h-12 w-full border border-black px-4 outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-black/70">
                  Adjust To (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.adjustableTo}
                  placeholder="45"
                  onChange={(e) => handleChange("adjustableTo", e.target.value)}
                  className="h-12 w-full border border-black px-4 outline-none"
                />
              </div>
            </div>
          )}

          {shouldShowBraceletFields && (
            <div>
              <label className="mb-2 block text-black/70">
                Bracelet Length (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.braceletLength}
                placeholder="18.5"
                onChange={(e) => handleChange("braceletLength", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
          )}

          {shouldShowSizes && (
            <div>
              <label className="mb-2 block text-black/70">Sizes</label>
              <input
                type="text"
                value={form.sizes}
                placeholder={
                  form.category === "bracelets" ? "S, M, L" : "16, 17, 18"
                }
                onChange={(e) => handleChange("sizes", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
          )}

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.isBestSeller}
              onChange={(e) => handleChange("isBestSeller", e.target.checked)}
              className="h-4 w-4"
            />
            <span>Best Seller</span>
          </label>

          <div className="mt-4 border-t border-black pt-4">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-black/70">Variants</label>
              <button
                type="button"
                className="border border-black bg-white px-4 py-2 text-sm"
                onClick={handleAddVariant}
                disabled={isSaving}
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
                  className="mb-6 border border-black p-4 space-y-4"
                >
                  <div>
                    <label className="mb-2 block text-black/70">
                      Variant Name
                    </label>
                    <input
                      type="text"
                      value={variant.name}
                      placeholder="pearl / silver"
                      onChange={(e) =>
                        handleVariantChange(idx, "name", e.target.value)
                      }
                      className="h-12 w-full border border-black px-4 outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-black/70">
                      Images (URLs)
                    </label>
                    <textarea
                      value={variant.images}
                      rows={4}
                      placeholder="Image links per line..."
                      onChange={(e) =>
                        handleVariantChange(idx, "images", e.target.value)
                      }
                      className="w-full resize-none border border-black px-4 py-3 outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <label className="cursor-pointer border border-black bg-white px-4 py-3 text-sm">
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
                        className="border border-red-600 bg-white px-4 py-3 text-sm text-red-600"
                      >
                        Remove Variant
                      </button>
                    )}
                  </div>

                  {preview.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                      {preview.map((src, imgIdx) => (
                        <div
                          key={imgIdx}
                          className="relative aspect-square border border-black p-2 bg-white overflow-hidden"
                        >
                          <img
                            src={src}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://placehold.co/400x400?text=No+Image";
                            }}
                          />
                          <button
                            type="button"
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

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="border border-black bg-black px-4 py-3 text-white disabled:opacity-60"
            >
              {isSaving
                ? "Saving..."
                : initialData
                  ? "Update Product"
                  : "Save Product"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-black bg-white px-4 py-3 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
