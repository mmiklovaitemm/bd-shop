export default function AdminProductBulkDeleteModal({
  count,
  onClose,
  onConfirm,
  deleting = false,
}) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4"
      onClick={deleting ? undefined : onClose}
    >
      <div
        className="w-full max-w-md border border-black bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-black px-6 py-4">
          <h2 className="font-display text-2xl leading-none">
            Delete selected products
          </h2>
        </div>

        <div className="p-6">
          <p className="font-ui text-sm leading-6 text-black/80">
            Are you sure you want to delete
            <span className="font-medium text-black">{count}</span> selected
            product{count === 1 ? "" : "s"}?
          </p>

          <p className="mt-3 font-ui text-sm text-red-600">
            This action cannot be undone.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="border border-red-600 bg-red-600 px-4 py-3 font-ui text-sm text-white disabled:opacity-60"
              onClick={onConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete selected"}
            </button>

            <button
              type="button"
              className="border border-black bg-white px-4 py-3 font-ui text-sm disabled:opacity-60"
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
