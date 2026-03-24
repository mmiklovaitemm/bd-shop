import { useMemo, useState } from "react";

import { getImageTextFromVariant } from "@/pages/admin/helpers/productHelpers";

export default function AdminProductEditModal({
  onClose,
  onUpdate,
  initialData,
  isSaving = false,
}) {
  const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const FRONTEND_BASE_PATH = import.meta.env.BASE_URL || "/";

  function joinUrl(origin, path) {
    const o = String(origin).replace(/\/+$/, "");
    const p = String(path).replace(/^\/+/, "");
    return `${o}/${p}`;
  }

  function withBase(path) {
    const base = String(FRONTEND_BASE_PATH)
      .replace(/^\/?/, "/")
      .replace(/\/?$/, "/");

    const clean = String(path).replace(/^\/+/, "");
    return joinUrl(API_ORIGIN.replace(":4000", ":5173"), `${base}${clean}`);
  }

  function makePreviewList(category, rawValue) {
    return String(rawValue || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        if (/^https?:\/\//i.test(item)) return item;
        return withBase(`products/${category}/${item}`);
      });
  }

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

  const [form, setForm] = useState({
    id: initialData?.id || "",
    name: initialData?.name || "",
    category: initialData?.category || "rings",
    priceValue: initialData?.priceValue || "",
    createdAt: initialData?.createdAt
      ? String(initialData.createdAt).slice(0, 10)
      : "",
    description: initialData?.details?.detailsText || "",
    silverImages: getImageTextFromVariant(initialData?.variants?.silver),
    goldImages: getImageTextFromVariant(initialData?.variants?.gold),
    sizes: initialData?.sizes?.join(", ") || "",
    isBestSeller: initialData?.isBestSeller || false,
    variantStock: buildVariantStockState(initialData?.variants),
  });

  const [error, setError] = useState("");
  const [uploadingSilver, setUploadingSilver] = useState(false);
  const [uploadingGold, setUploadingGold] = useState(false);

  const parsedSizes = useMemo(() => {
    return form.sizes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [form.sizes]);

  const hasSilverImages =
    form.silverImages
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean).length > 0;

  const hasGoldImages =
    form.goldImages
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean).length > 0;

  const silverPreview = makePreviewList(form.category, form.silverImages);
  const goldPreview = makePreviewList(form.category, form.goldImages);

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

  const syncVariantStockWithSizesAndColors = (
    nextSizes,
    nextHasSilver,
    nextHasGold,
  ) => {
    setForm((prev) => {
      const nextVariantStock = {};

      if (nextHasSilver) {
        nextVariantStock.silver = Object.fromEntries(
          nextSizes.map((size) => [
            size,
            Math.max(0, Number(prev.variantStock?.silver?.[size]) || 0),
          ]),
        );
      }

      if (nextHasGold) {
        nextVariantStock.gold = Object.fromEntries(
          nextSizes.map((size) => [
            size,
            Math.max(0, Number(prev.variantStock?.gold?.[size]) || 0),
          ]),
        );
      }

      return {
        ...prev,
        variantStock: nextVariantStock,
      };
    });
  };

  const handleSizesChange = (value) => {
    const nextSizes = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    handleChange("sizes", value);
    syncVariantStockWithSizesAndColors(
      nextSizes,
      hasSilverImages,
      hasGoldImages,
    );
  };

  const handleRemoveImage = (colorType, imageToRemove) => {
    setForm((prev) => {
      const key = colorType === "silver" ? "silverImages" : "goldImages";

      const nextValue = String(prev[key] || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => item !== imageToRemove)
        .join("\n");

      const nextHasSilver =
        colorType === "silver"
          ? nextValue
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean).length > 0
          : prev.silverImages
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean).length > 0;

      const nextHasGold =
        colorType === "gold"
          ? nextValue
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean).length > 0
          : prev.goldImages
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean).length > 0;

      const nextVariantStock = {};

      if (nextHasSilver) {
        nextVariantStock.silver = Object.fromEntries(
          parsedSizes.map((size) => [
            size,
            Math.max(0, Number(prev.variantStock?.silver?.[size]) || 0),
          ]),
        );
      }

      if (nextHasGold) {
        nextVariantStock.gold = Object.fromEntries(
          parsedSizes.map((size) => [
            size,
            Math.max(0, Number(prev.variantStock?.gold?.[size]) || 0),
          ]),
        );
      }

      return {
        ...prev,
        [key]: nextValue,
        variantStock: nextVariantStock,
      };
    });
  };

  const handleUploadImage = async (event, colorType) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError("");

      if (colorType === "silver") {
        setUploadingSilver(true);
      } else {
        setUploadingGold(true);
      }

      const formData = new FormData();
      formData.append("image", file);

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

      setForm((prev) => {
        const key = colorType === "silver" ? "silverImages" : "goldImages";
        const current = String(prev[key] || "").trim();

        const nextSilverImages =
          colorType === "silver"
            ? current
              ? `${current}\n${imageUrl}`
              : imageUrl
            : prev.silverImages;

        const nextGoldImages =
          colorType === "gold"
            ? current
              ? `${current}\n${imageUrl}`
              : imageUrl
            : prev.goldImages;

        const nextHasSilver =
          nextSilverImages
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean).length > 0;

        const nextHasGold =
          nextGoldImages
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean).length > 0;

        const nextVariantStock = {};

        if (nextHasSilver) {
          nextVariantStock.silver = Object.fromEntries(
            parsedSizes.map((size) => [
              size,
              Math.max(0, Number(prev.variantStock?.silver?.[size]) || 0),
            ]),
          );
        }

        if (nextHasGold) {
          nextVariantStock.gold = Object.fromEntries(
            parsedSizes.map((size) => [
              size,
              Math.max(0, Number(prev.variantStock?.gold?.[size]) || 0),
            ]),
          );
        }

        return {
          ...prev,
          [key]: current ? `${current}\n${imageUrl}` : imageUrl,
          variantStock: nextVariantStock,
        };
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Image upload failed.");
    } finally {
      if (colorType === "silver") {
        setUploadingSilver(false);
      } else {
        setUploadingGold(false);
      }

      event.target.value = "";
    }
  };

  const renderVariantStockSection = (color) => {
    if (!form.variantStock?.[color]) return null;

    const colorSizes = parsedSizes.length ? parsedSizes : ["default"];

    return (
      <div className="border border-black p-4">
        <h3 className="mb-4 font-ui text-sm font-medium capitalize">
          {color} stock
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          {colorSizes.map((size) => (
            <div key={`${color}-${size}`}>
              <label className="mb-2 block text-black/70">
                {size === "default" ? "Stock quantity" : `Size ${size}`}
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
    const normalizedSizes = parsedSizes.length ? parsedSizes : ["one size"];

    const normalizedVariantStock = Object.fromEntries(
      Object.entries(form.variantStock || {}).map(([color, sizeMap]) => {
        const nextSizeMap = Object.fromEntries(
          normalizedSizes.map((size) => [
            size,
            Math.max(
              0,
              Number(
                sizeMap?.[size] ??
                  sizeMap?.default ??
                  sizeMap?.["one size"] ??
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
      silverImages: form.silverImages
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      goldImages: form.goldImages
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
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

    if (payload.silverImages.length === 0 && payload.goldImages.length === 0) {
      setError("Add at least one image.");
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
            <label className="mb-2 block text-black/70">
              Silver images filenames
            </label>
            <textarea
              value={form.silverImages}
              onChange={(e) => handleChange("silverImages", e.target.value)}
              rows={4}
              className="w-full resize-none border border-black px-4 py-3 outline-none"
            />

            <div className="my-2 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center border border-black bg-white px-4 py-3 text-sm">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadImage(e, "silver")}
                  disabled={uploadingSilver || uploadingGold || isSaving}
                />
                {uploadingSilver ? "Uploading..." : "Upload silver image"}
              </label>
            </div>

            {silverPreview.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {silverPreview.map((src, index) => (
                  <div key={src + index} className="border border-black p-2">
                    <img
                      src={src}
                      alt={`Silver preview ${index + 1}`}
                      className="h-28 w-full object-cover"
                    />

                    <button
                      type="button"
                      className="mt-2 w-full border border-red-600 bg-white px-3 py-2 text-xs text-red-600"
                      onClick={() => handleRemoveImage("silver", src)}
                      disabled={isSaving || uploadingSilver || uploadingGold}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-black/70">
              Gold images filenames
            </label>
            <textarea
              value={form.goldImages}
              onChange={(e) => handleChange("goldImages", e.target.value)}
              rows={4}
              className="w-full resize-none border border-black px-4 py-3 outline-none"
            />

            <div className="my-2 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center border border-black bg-white px-4 py-3 text-sm">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadImage(e, "gold")}
                  disabled={uploadingSilver || uploadingGold || isSaving}
                />
                {uploadingGold ? "Uploading..." : "Upload gold image"}
              </label>
            </div>

            {goldPreview.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {goldPreview.map((src, index) => (
                  <div key={src + index} className="border border-black p-2">
                    <img
                      src={src}
                      alt={`Gold preview ${index + 1}`}
                      className="h-28 w-full object-cover"
                    />

                    <button
                      type="button"
                      className="mt-2 w-full border border-red-600 bg-white px-3 py-2 text-xs text-red-600"
                      onClick={() => handleRemoveImage("gold", src)}
                      disabled={isSaving || uploadingSilver || uploadingGold}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
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

          {renderVariantStockSection("silver")}
          {renderVariantStockSection("gold")}

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
