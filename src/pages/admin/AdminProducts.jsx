import { useState, useEffect } from "react";

import AdminProductCreateModal from "@/pages/admin/components/AdminProductCreateModal";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import useAdminProducts from "@/pages/admin/hooks/useAdminProducts";
import AdminProductsTable from "@/pages/admin/components/AdminProductsTable";
import AdminProductDeleteModal from "@/pages/admin/components/AdminProductDeleteModal";
import AdminProductBulkDeleteModal from "@/pages/admin/components/AdminProductBulkDeleteModal";

import { getStockBadge } from "@/pages/admin/helpers/productHelpers";

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminProducts() {
  const { products, loading, error, fetchProducts } = useAdminProducts();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortValue, setSortValue] = useState("newest");

  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 8000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const filteredProducts = [...products]
    .filter((product) => {
      const query = searchValue.trim().toLowerCase();

      const matchesSearch =
        !query ||
        String(product.name || "")
          .toLowerCase()
          .includes(query) ||
        String(product.id || "")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortValue === "price-low") {
        return Number(a.priceValue || 0) - Number(b.priceValue || 0);
      }

      if (sortValue === "price-high") {
        return Number(b.priceValue || 0) - Number(a.priceValue || 0);
      }

      if (sortValue === "oldest") {
        return String(a.createdAt || "").localeCompare(
          String(b.createdAt || ""),
        );
      }

      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });

  const toggleSelectProduct = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const visibleProductIds = filteredProducts.map((product) => product.id);

  const allVisibleSelected =
    visibleProductIds.length > 0 &&
    visibleProductIds.every((id) => selectedProductIds.includes(id));

  const toggleSelectAllProducts = () => {
    if (visibleProductIds.length === 0) return;

    setSelectedProductIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleProductIds.includes(id));
      }

      return [...new Set([...prev, ...visibleProductIds])];
    });
  };

  const handleCreateProduct = async (newProduct) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newProduct),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create product.");
      }

      console.log("CREATED PRODUCT:", data);
      setIsCreateOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Create product error:", err);
      alert(err.message || "Failed to create product.");
    }
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      setIsSaving(true);

      const res = await fetch(
        `${API_ORIGIN}/api/products/${updatedProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updatedProduct),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update product.");
      }

      setErrorMessage("");
      setSuccessMessage(
        `Product updated: ${updatedProduct.name} (${updatedProduct.id})`,
      );

      setEditProduct(null);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Update failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProduct = (product) => {
    setErrorMessage("");
    setSuccessMessage("");
    setEditProduct(product);
  };

  const handleDeleteProduct = (product) => {
    setErrorMessage("");
    setSuccessMessage("");
    setDeleteProduct(product);
  };

  const confirmDeleteProduct = async (product) => {
    try {
      setIsDeleting(true);

      const res = await fetch(`${API_ORIGIN}/api/products/${product.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete product.");
      }

      setErrorMessage("");
      setSuccessMessage(`Product deleted: ${product.name} (${product.id})`);

      setDeleteProduct(null);
      setSelectedProductIds((prev) => prev.filter((id) => id !== product.id));
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Delete failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelectedProducts = async () => {
    if (selectedProductIds.length === 0) return;

    try {
      setIsDeleting(true);

      await Promise.all(
        selectedProductIds.map(async (productId) => {
          const res = await fetch(`${API_ORIGIN}/api/products/${productId}`, {
            method: "DELETE",
            credentials: "include",
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data?.message || `Failed to delete ${productId}`);
          }

          return data;
        }),
      );

      setErrorMessage("");
      setSuccessMessage(
        `${selectedProductIds.length} product(s) deleted successfully.`,
      );

      setSelectedProductIds([]);
      setIsBulkDeleteOpen(false);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Bulk delete failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-4xl leading-none">Admin products</h1>

          <button
            type="button"
            className="border border-black bg-black px-4 py-3 font-ui text-sm text-white"
            onClick={() => {
              setErrorMessage("");
              setSuccessMessage("");
              setIsCreateOpen(true);
            }}
          >
            Add product
          </button>
        </div>

        {selectedProductIds.length > 0 ? (
          <div className="mt-4 flex items-center justify-between gap-3 border border-red-200 bg-red-50 px-4 py-3">
            <p className="font-ui text-sm text-red-700">
              Selected: {selectedProductIds.length} product(s)
            </p>

            <button
              type="button"
              className="border border-red-600 bg-red-600 px-4 py-2 font-ui text-sm text-white disabled:opacity-60"
              onClick={() => setIsBulkDeleteOpen(true)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete selected"}
            </button>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by name or id"
            className="h-12 w-full border border-black px-4 outline-none"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-12 w-full border border-black bg-white px-4 outline-none"
          >
            <option value="all">All categories</option>
            <option value="rings">Rings</option>
            <option value="earrings">Earrings</option>
            <option value="necklaces">Necklaces</option>
            <option value="bracelets">Bracelets</option>
            <option value="personal">Personal</option>
          </select>

          <select
            value={sortValue}
            onChange={(e) => setSortValue(e.target.value)}
            className="h-12 w-full border border-black bg-white px-4 outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-ui text-sm text-black/60">
            Showing {filteredProducts.length} of {products.length} products
          </p>

          <button
            type="button"
            className="border border-black bg-white px-4 py-2 font-ui text-sm"
            onClick={() => {
              setSearchValue("");
              setCategoryFilter("all");
              setSortValue("newest");
              setSelectedProductIds([]);
            }}
          >
            Reset filters
          </button>
        </div>

        {successMessage ? (
          <div className="mt-6 flex items-center justify-between border border-green-700 bg-green-50 px-4 py-3 font-ui text-sm text-green-800">
            <span>{successMessage}</span>

            <button
              type="button"
              className="ml-4 border border-green-700 px-3 py-1 text-xs"
              onClick={() => setSuccessMessage("")}
            >
              Close
            </button>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-6 flex items-center justify-between border border-red-600 bg-red-50 px-4 py-3 font-ui text-sm text-red-700">
            <span>{errorMessage}</span>

            <button
              type="button"
              className="ml-4 border border-red-600 px-3 py-1 text-xs"
              onClick={() => setErrorMessage("")}
            >
              Close
            </button>
          </div>
        ) : null}

        {loading ? (
          <p className="mt-6 font-ui text-sm text-black/60">Loading...</p>
        ) : error ? (
          <div className="mt-6 border border-red-600 bg-red-50 px-4 py-3 font-ui text-sm text-red-700">
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="mt-6 font-ui text-sm text-black/60">
            No products found.
          </p>
        ) : (
          <>
            <div className="mt-6 flex items-center justify-between gap-3 border border-black/20 bg-black/5 p-3 lg:hidden">
              <label className="flex items-center gap-3 font-ui text-sm">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllProducts}
                  className="h-4 w-4"
                />
                <span>Select all visible</span>
              </label>

              <span className="font-ui text-xs text-black/50">
                {selectedProductIds.length} selected
              </span>
            </div>

            <div className="mt-6 grid gap-3 lg:hidden">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`border bg-white p-4 ${
                    selectedProductIds.includes(product.id)
                      ? "border-black"
                      : "border-black/30"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <label className="flex items-center gap-3 font-ui text-sm">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="h-4 w-4"
                      />
                      <span>Select</span>
                    </label>

                    {selectedProductIds.includes(product.id) ? (
                      <span className="border border-black bg-black px-2 py-1 text-[10px] text-white">
                        Selected
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-start gap-4">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="h-16 w-16 shrink-0 border border-black object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center border border-black text-xs text-black/40">
                        No img
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="font-ui text-sm">{product.name}</p>
                      <p className="mt-1 text-xs text-black/50">{product.id}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {product.isBestSeller ? (
                          <span className="border border-black bg-black px-2 py-1 text-[10px] text-white">
                            Best seller
                          </span>
                        ) : null}

                        {(() => {
                          const stock = getStockBadge(product);

                          return (
                            <span
                              className={`border px-2 py-1 text-[10px] ${stock.className}`}
                            >
                              {stock.label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-ui text-sm">€{product.priceValue}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 font-ui text-sm">
                    <div>
                      <p className="text-black/50">Category</p>
                      <p className="mt-1">{product.category || "-"}</p>
                    </div>

                    <div>
                      <p className="text-black/50">Created</p>
                      <p className="mt-1">
                        {product.createdAt
                          ? String(product.createdAt).slice(0, 10)
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-black/50">Stock</p>
                      <p className="mt-1">
                        {Math.max(0, Number(product.stockQuantity) || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="flex-1 border border-black bg-white px-3 py-3 font-ui text-sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="flex-1 border border-red-600 bg-white px-3 py-3 font-ui text-sm text-red-600"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <AdminProductsTable
              products={filteredProducts}
              onDelete={handleDeleteProduct}
              onEdit={handleEditProduct}
              selectedProductIds={selectedProductIds}
              onToggleSelectProduct={toggleSelectProduct}
              onToggleSelectAllProducts={toggleSelectAllProducts}
            />
          </>
        )}

        {isCreateOpen ? (
          <AdminProductCreateModal
            onClose={() => setIsCreateOpen(false)}
            onCreate={handleCreateProduct}
            isSaving={isSaving}
          />
        ) : null}

        {deleteProduct ? (
          <AdminProductDeleteModal
            product={deleteProduct}
            onClose={() => setDeleteProduct(null)}
            onConfirm={confirmDeleteProduct}
            deleting={isDeleting}
          />
        ) : null}

        {isBulkDeleteOpen ? (
          <AdminProductBulkDeleteModal
            count={selectedProductIds.length}
            onClose={() => setIsBulkDeleteOpen(false)}
            onConfirm={handleDeleteSelectedProducts}
            deleting={isDeleting}
          />
        ) : null}

        {editProduct ? (
          <AdminProductCreateModal
            onClose={() => setEditProduct(null)}
            onCreate={handleUpdateProduct}
            initialData={editProduct}
            isSaving={isSaving}
          />
        ) : null}
      </main>

      <FullWidthDivider />
    </>
  );
}
