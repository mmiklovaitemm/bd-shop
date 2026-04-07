import { getStockBadge } from "@/pages/admin/helpers/productHelpers";
import ProductImage from "@/components/ui/ProductCard/ProductImage";

function formatAdminDate(value) {
  if (!value) return "-";
  return String(value).slice(0, 10);
}

export default function AdminProductsTable({
  products = [],
  onDelete,
  onEdit,
  selectedProductIds = [],
  onToggleSelectProduct,
  onToggleSelectAllProducts,
}) {
  const allVisibleSelected =
    products.length > 0 &&
    products.every((product) => selectedProductIds.includes(product.id));

  return (
    <div className="mt-6 hidden overflow-x-auto border border-black lg:block">
      <table className="w-full border-collapse font-ui text-sm">
        <thead>
          <tr className="border-b border-black bg-black/5 text-left">
            <th className="w-12 px-4 py-3">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={onToggleSelectAllProducts}
                className="h-4 w-4"
                aria-label="Select all visible products"
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
          {products.map((product) => {
            const stock = getStockBadge(product);
            const isSelected = selectedProductIds.includes(product.id);

            return (
              <tr
                key={product.id}
                className={`border-b border-black/20 transition-colors ${
                  isSelected
                    ? "bg-black/[0.03]"
                    : "bg-white hover:bg-black/[0.02]"
                }`}
              >
                <td className="px-4 py-3 align-middle">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelectProduct(product.id)}
                    className="h-4 w-4"
                    aria-label={`Select ${product.name}`}
                  />
                </td>

                <td className="px-4 py-3 align-middle">
                  {/* PAKEISTA: Naudojame ProductImage vietoj img */}
                  <div className="relative h-14 w-14 border border-black overflow-hidden">
                    <ProductImage
                      src={product.thumbnail}
                      alt={product.name}
                      loaded={true} // Admin panelėje rodome iškart be blur efekto
                      className="h-full w-full object-cover"
                    />
                  </div>
                </td>

                <td className="px-4 py-3 align-middle">
                  <div className="min-w-[180px]">
                    <p className="text-black">{product.name || "-"}</p>
                    <p className="mt-1 text-xs text-black/45">{product.id}</p>
                  </div>
                </td>

                <td className="px-4 py-3 align-middle">
                  {product.category || "-"}
                </td>

                <td className="px-4 py-3 align-middle">
                  €{product.priceValue}
                </td>

                <td className="px-4 py-3 align-middle">
                  <span
                    className={`inline-block px-2 py-1 text-xs ${stock.className}`}
                  >
                    {stock.label}
                  </span>
                </td>

                <td className="px-4 py-3 align-middle">
                  {product.isBestSeller ? (
                    <span className="inline-block border border-black bg-black px-2 py-1 text-xs text-white">
                      Yes
                    </span>
                  ) : (
                    <span className="text-black/50">No</span>
                  )}
                </td>

                <td className="px-4 py-3 align-middle">
                  {formatAdminDate(product.createdAt)}
                </td>

                <td className="px-4 py-3 align-middle">
                  <button
                    type="button"
                    className="border border-black bg-white px-3 py-2 transition-colors hover:bg-black hover:text-white"
                    onClick={() => onEdit(product)}
                  >
                    Edit
                  </button>
                </td>

                <td className="px-4 py-3 align-middle">
                  <button
                    type="button"
                    className="border border-red-600 bg-white px-3 py-2 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                    onClick={() => onDelete(product)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
