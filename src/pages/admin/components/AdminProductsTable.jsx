import { getStockBadge } from "@/pages/admin/helpers/orderHelpers";

function formatAdminDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 10);
}

export default function AdminProductsTable({
  products,
  onDelete,
  onEdit,
  selectedProductIds,
  onToggleSelectProduct,
  onToggleSelectAllProducts,
}) {
  return (
    <div className="mt-6 hidden overflow-x-auto border border-black lg:block">
      <table className="w-full border-collapse font-ui text-sm">
        <thead>
          <tr className="border-b border-black bg-black/5 text-left">
            <th className="px-4 py-3">
              <input
                type="checkbox"
                checked={
                  products.length > 0 &&
                  products.every((product) =>
                    selectedProductIds.includes(product.id),
                  )
                }
                onChange={onToggleSelectAllProducts}
                className="h-4 w-4"
              />
            </th>
            <th className="px-4 py-3">Image</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Best seller</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Edit</th>
            <th className="px-4 py-3">Delete</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-black/20">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedProductIds.includes(product.id)}
                  onChange={() => onToggleSelectProduct(product.id)}
                  className="h-4 w-4"
                />
              </td>

              <td className="px-4 py-3">
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="h-14 w-14 border border-black object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center border border-black text-xs text-black/40">
                    No img
                  </div>
                )}
              </td>

              <td className="px-4 py-3">
                <span>{product.name}</span>
              </td>

              <td className="px-4 py-3">{product.category || "-"}</td>
              <td className="px-4 py-3">€{product.priceValue}</td>
              <td className="px-4 py-3">
                {(() => {
                  const stock = getStockBadge(product);

                  return (
                    <span
                      className={`inline-block px-2 py-1 text-xs ${stock.className}`}
                    >
                      {stock.label}
                    </span>
                  );
                })()}
              </td>
              <td className="px-4 py-3">
                {product.isBestSeller ? (
                  <span className="inline-block border border-black bg-black px-2 py-1 text-xs text-white">
                    Yes
                  </span>
                ) : (
                  <span className="text-black/50">No</span>
                )}
              </td>
              <td className="px-4 py-3">
                {formatAdminDate(product.createdAt)}
              </td>
              <td className="px-4 py-3">
                <button
                  className="border border-black bg-white px-3 py-2"
                  onClick={() => onEdit(product)}
                >
                  Edit
                </button>
              </td>
              <td className="px-4 py-3">
                <button
                  className="border border-red-600 bg-white px-3 py-2 text-red-600"
                  onClick={() => onDelete(product)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
