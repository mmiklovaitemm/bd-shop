import { useState } from "react";

export default function AdminProductCreateModal({
  onClose,
  onCreate,
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

  const [form, setForm] = useState({
    id: initialData?.id || "",
    name: initialData?.name || "",
    category: initialData?.category || "rings",
    priceValue: initialData?.priceValue || "",
    createdAt: initialData?.createdAt
      ? String(initialData.createdAt).slice(0, 10)
      : "",
    description: initialData?.details?.detailsText || "",
    silverImages: initialData?.variants?.silver?.join("\n") || "",
    goldImages: initialData?.variants?.gold?.join("\n") || "",
    sizes: initialData?.sizes?.join(", ") || "",
    isBestSeller: initialData?.isBestSeller || false,
    isSoldOut: initialData?.isSoldOut || false,
  });

  const [error, setError] = useState("");
  const silverPreview = makePreviewList(form.category, form.silverImages);
  const goldPreview = makePreviewList(form.category, form.goldImages);
  const [uploadingSilver, setUploadingSilver] = useState(false);
  const [uploadingGold, setUploadingGold] = useState(false);

  const handleRemoveImage = (colorType, imageToRemove) => {
    setForm((prev) => {
      const key = colorType === "silver" ? "silverImages" : "goldImages";

      const nextValue = String(prev[key] || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => item !== imageToRemove)
        .join("\n");

      return {
        ...prev,
        [key]: nextValue,
      };
    });
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setError("");
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

        return {
          ...prev,
          [key]: current ? `${current}\n${imageUrl}` : imageUrl,
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

  const handleSubmit = () => {
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
      sizes: form.sizes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      isBestSeller: form.isBestSeller,
      isSoldOut: form.isSoldOut,
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
    onCreate?.(payload);
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
                initialData ? "bg-black/5 cursor-not-allowed" : ""
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
            <label className="mb-2 block text-black/70">
              Silver images filenames
            </label>
            <textarea
              value={form.silverImages}
              onChange={(e) => handleChange("silverImages", e.target.value)}
              placeholder={"example:\nring-silver-1.webp\nring-silver-2.webp"}
              rows={4}
              className="w-full resize-none border border-black px-4 py-3 outline-none"
            />

            <div className="flex items-center gap-3 my-2">
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
              placeholder={"example:\nring-gold-1.webp\nring-gold-2.webp"}
              rows={4}
              className="w-full resize-none border border-black px-4 py-3 outline-none"
            />

            <div className="flex items-center gap-3 my-2">
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
              onChange={(e) => handleChange("sizes", e.target.value)}
              placeholder="15.5, 16, 17.5, 18"
              className="h-12 w-full border border-black px-4 outline-none"
            />
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

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.isSoldOut}
              onChange={(e) => handleChange("isSoldOut", e.target.checked)}
              className="h-4 w-4"
            />
            <span>Sold out</span>
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
