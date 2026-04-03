import { useMemo, useState, useEffect } from "react";

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
    if (!colors.length) return [createEmptyVariant()];

    return colors.map((color) => ({
      name: color,
      images: getImageTextFromVariant(product?.variants?.[color]),
    }));
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

  // APSKAIČIUOJAMAS BENDRAS LIKUTIS IŠ VISŲ DYDŽIŲ
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
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleVariantChange = (index, key, value) => {
    setForm((prev) => {
      const nextVariants = prev.variants.map((variant, i) =>
        i === index ? { ...variant, [key]: value } : variant,
      );

      let nextVariantStock = { ...prev.variantStock };

      if (key === "name") {
        const oldName = String(prev.variants[index]?.name || "")
          .trim()
          .toLowerCase();
        const newName = String(value || "")
          .trim()
          .toLowerCase();

        if (oldName !== newName) {
          const oldStockData = nextVariantStock[oldName];
          delete nextVariantStock[oldName];
          if (newName) {
            nextVariantStock[newName] =
              oldStockData ||
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
  };

  const handleRemoveVariant = (index) => {
    setForm((prev) => {
      const removedName = String(prev.variants[index]?.name || "")
        .trim()
        .toLowerCase();
      const nextVariants = prev.variants.filter((_, i) => i !== index);
      const nextVariantStock = { ...prev.variantStock };
      if (removedName) delete nextVariantStock[removedName];
      return {
        ...prev,
        variants: nextVariants,
        variantStock: nextVariantStock,
      };
    });
  };

  const handleUploadImage = async (event, variantIndex) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
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
      if (!res.ok) throw new Error(data?.message || "Upload failed");

      setForm((prev) => ({
        ...prev,
        variants: prev.variants.map((v, i) => {
          if (i !== variantIndex) return v;
          const current = String(v.images || "").trim();
          return {
            ...v,
            images: current ? `${current}\n${data.file.url}` : data.file.url,
          };
        }),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingVariantIndex(null);
      event.target.value = "";
    }
  };

  const handleSizesChange = (value) => {
    const nextSizes = value
      .split(",")
      .map((s) => s.trim())
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
      return { ...prev, sizes: value, variantStock: nextVariantStock };
    });
  };

  const handleVariantStockChange = (color, size, value) => {
    const safeValue = Math.max(0, Number(value) || 0);
    setForm((prev) => ({
      ...prev,
      variantStock: {
        ...prev.variantStock,
        [color]: { ...(prev.variantStock?.[color] || {}), [size]: safeValue },
      },
    }));
  };

  const handleSubmit = () => {
    // FIX: Leidžiame išsaugoti, jei bent koks nors variantas turi pavadinimą
    const normalizedVariants = form.variants
      .map((v) => ({
        name: String(v.name || "")
          .trim()
          .toLowerCase(),
        images: String(v.images || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      }))
      .filter((v) => v.name); // Svarbu: reikalaujame tik vardo, images gali būti paimti iš tėvinio jei reikia

    if (normalizedVariants.length === 0) {
      setError("At least one variant with a name is required.");
      return;
    }

    const normalizedVariantStock = {};
    normalizedVariants.forEach((v) => {
      const color = v.name;
      normalizedVariantStock[color] = Object.fromEntries(
        normalizedSizes.map((size) => [
          size,
          Number(form.variantStock?.[color]?.[size] || 0),
        ]),
      );
    });

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
      stock_quantity: totalStock, // SIUNČIAME AKTUALŲ TOTAL STOCK
      isBestSeller: form.isBestSeller,
    };

    if (!payload.name) return setError("Name is required");
    if (payload.priceValue <= 0) return setError("Price must be > 0");

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
            className="border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 p-6 font-ui text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-black/70 italic">
                Product ID (ReadOnly)
              </label>
              <input
                type="text"
                value={form.id}
                disabled
                className="h-12 w-full border border-black bg-black/5 px-4 outline-none opacity-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-2 block text-black/70 font-bold">
                Total Stock (Auto-calculated)
              </label>
              <div className="flex h-12 w-full items-center border border-black bg-green-50 px-4 font-bold text-green-700">
                {totalStock}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-black/70">Product name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-12 w-full border border-black px-4 outline-none focus:bg-yellow-50"
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
              <label className="mb-2 block text-black/70">Price (€)</label>
              <input
                type="number"
                value={form.priceValue}
                onChange={(e) => handleChange("priceValue", e.target.value)}
                className="h-12 w-full border border-black px-4 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-black/70 italic">
              Sizes (Comma separated, e.g.: 16, 17, 18)
            </label>
            <input
              type="text"
              value={form.sizes}
              onChange={(e) => handleSizesChange(e.target.value)}
              className="h-12 w-full border border-black px-4 outline-none"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-t border-black pt-4">
              <label className="font-bold uppercase tracking-widest text-[11px]">
                Variant Inventory
              </label>
              <button
                type="button"
                onClick={handleAddVariant}
                className="border border-black px-3 py-1 text-xs hover:bg-black hover:text-white transition-all"
              >
                + Add Variant Color
              </button>
            </div>

            {form.variants.map((variant, vIdx) => (
              <div key={vIdx} className="bg-black/5 p-4 border border-black">
                <div className="mb-4 flex items-end gap-4">
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] uppercase font-bold text-black/50">
                      Color Name
                    </label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) =>
                        handleVariantChange(vIdx, "name", e.target.value)
                      }
                      placeholder="e.g. Silver"
                      className="h-10 w-full border border-black px-3 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(vIdx)}
                    className="h-10 border border-red-600 px-3 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                  >
                    Remove
                  </button>
                </div>

                <div className="mb-4">
                  <label className="mb-1 block text-[10px] uppercase font-bold text-black/50">
                    Image URLs (one per line)
                  </label>
                  <textarea
                    value={variant.images}
                    onChange={(e) =>
                      handleVariantChange(vIdx, "images", e.target.value)
                    }
                    rows={2}
                    className="w-full border border-black px-3 py-2 outline-none text-xs"
                  />
                  <input
                    type="file"
                    onChange={(e) => handleUploadImage(e, vIdx)}
                    className="mt-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {normalizedSizes.map((size) => (
                    <div key={size}>
                      <label className="block text-[10px] text-black/60 truncate">
                        Size {size}
                      </label>
                      <input
                        type="number"
                        value={
                          form.variantStock[variant.name.toLowerCase()]?.[
                            size
                          ] ?? 0
                        }
                        onChange={(e) =>
                          handleVariantStockChange(
                            variant.name.toLowerCase(),
                            size,
                            e.target.value,
                          )
                        }
                        className="h-8 w-full border border-black/30 px-2 outline-none focus:border-black"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-black pt-4">
            <label className="mb-2 block text-black/70">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="w-full border border-black px-4 py-3 outline-none"
            />
          </div>

          <label className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              checked={form.isBestSeller}
              onChange={(e) => handleChange("isBestSeller", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="font-bold">Highlight as Best Seller</span>
          </label>

          {error && (
            <div className="border border-red-600 bg-red-50 p-3 text-red-700 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-black">
            <button
              type="button"
              className="flex-1 bg-black py-4 text-white font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? "Saving changes..." : "Update Product"}
            </button>
            <button
              type="button"
              className="px-8 border border-black hover:bg-black hover:text-white transition-all font-bold uppercase tracking-widest"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
