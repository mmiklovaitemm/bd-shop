export default function AdminProductDeleteModal({
  product,
  onClose,
  onConfirm,
  deleting = false,
}) {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl border border-black bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black px-6 py-4">
          <h2 className="font-display text-2xl leading-none">
            Confirm product deletion
          </h2>

          <button
            type="button"
            className="border border-black bg-white px-3 py-2"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="p-6 font-ui text-sm">
          <p className="text-black/70">
            You are about to permanently delete this product.
          </p>

          <div className="mt-5 border border-red-600 bg-red-50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-black/50">Product name</p>
                <p className="mt-1 text-black">{product.name}</p>
              </div>

              <div>
                <p className="text-black/50">Product id</p>
                <p className="mt-1 text-black">{product.id}</p>
              </div>

              <div>
                <p className="text-black/50">Category</p>
                <p className="mt-1 text-black">{product.category || "-"}</p>
              </div>

              <div>
                <p className="text-black/50">Price</p>
                <p className="mt-1 text-black">€{product.priceValue}</p>
              </div>

              <div>
                <p className="text-black/50">Created date</p>
                <p className="mt-1 text-black">{product.createdAt || "-"}</p>
              </div>

              <div>
                <p className="text-black/50">Best seller</p>
                <p className="mt-1 text-black">
                  {product.isBestSeller ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-red-700">
            This action cannot be undone.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="border border-red-600 bg-red-600 px-4 py-3 text-white disabled:opacity-60"
              onClick={() => onConfirm(product)}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete product"}
            </button>

            <button
              type="button"
              className="border border-black bg-white px-4 py-3"
              onClick={onClose}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
