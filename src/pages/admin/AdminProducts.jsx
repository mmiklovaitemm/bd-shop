import { useState, useEffect, useMemo } from "react";
import AdminProductCreateModal from "@/pages/admin/components/AdminProductCreateModal";
import FullWidthDivider from "@/components/ui/FullWidthDivider";
import Pagination from "@/components/ui/Pagination";
import useAdminProducts from "@/pages/admin/hooks/useAdminProducts";
import AdminProductsTable from "@/pages/admin/components/AdminProductsTable";
import AdminProductDeleteModal from "@/pages/admin/components/AdminProductDeleteModal";
import AdminProductBulkDeleteModal from "@/pages/admin/components/AdminProductBulkDeleteModal";
import AdminProductEditModal from "@/pages/admin/components/AdminProductEditModal";
import Loader from "@/components/ui/Loader";
import ProductImage from "@/components/ui/ProductCard/ProductImage";
import { getStockBadge } from "@/pages/admin/helpers/productHelpers";

const API_ORIGIN =
  import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com";

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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window === "undefined") return 10;
    return window.matchMedia("(max-width: 1023px)").matches ? 6 : 10;
  });

  // PAGELBĖJIMO FUNKCIJA API ADRESUI
  const getAdminApiUrl = (path) => {
    const base = API_ORIGIN.replace(/\/api$/, "").replace(/\/$/, "");
    const cleanPath = path.startsWith("/api")
      ? path
      : `/api${path.startsWith("/") ? path : `/${path}`}`;
    return `${base}${cleanPath}`;
  };

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 8000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const handleChange = (event) => setPageSize(event.matches ? 6 : 10);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const filteredProducts = useMemo(() => {
    return [...products]
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
        if (sortValue === "price-low")
          return Number(a.priceValue || 0) - Number(b.priceValue || 0);
        if (sortValue === "price-high")
          return Number(b.priceValue || 0) - Number(a.priceValue || 0);
        if (sortValue === "oldest")
          return String(a.createdAt || "").localeCompare(
            String(b.createdAt || ""),
          );
        return String(b.createdAt || "").localeCompare(
          String(a.createdAt || ""),
        );
      });
  }, [products, searchValue, categoryFilter, sortValue]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const showingCount = Math.min(safePage * pageSize, totalItems);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, safePage, pageSize]);

  useEffect(() => setPage(1), [searchValue, categoryFilter, sortValue]);

  const toggleSelectProduct = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const visibleProductIds = paginatedProducts.map((product) => product.id);
  const allVisibleSelected =
    visibleProductIds.length > 0 &&
    visibleProductIds.every((id) => selectedProductIds.includes(id));

  const toggleSelectAllProducts = () => {
    if (visibleProductIds.length === 0) return;
    setSelectedProductIds((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleProductIds.includes(id))
        : [...new Set([...prev, ...visibleProductIds])],
    );
  };

  // --- PRODUKTO KŪRIMAS ---
  const handleCreateProduct = async (newProduct) => {
    try {
      setIsSaving(true);
      setErrorMessage("");
      const url = getAdminApiUrl("/admin/products");

      console.log("--- DEBUG: CREATE PRODUCT ---");
      console.log("URL:", url);
      console.log("Payload:", newProduct);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newProduct),
      });

      console.log("Status:", res.status);
      const data = await res.json();
      console.log("Response Data:", data);

      if (!res.ok)
        throw new Error(
          data?.message || `Error ${res.status}: Route not found on server.`,
        );

      setSuccessMessage(`Product created: ${newProduct.name}`);
      setIsCreateOpen(false);
      await fetchProducts();
    } catch (err) {
      console.error("Create error:", err);
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- PRODUKTO ATNAUJINIMAS ---
  const handleUpdateProduct = async (updatedProduct) => {
    try {
      setIsSaving(true);
      setErrorMessage("");
      const url = getAdminApiUrl(`/products/${updatedProduct.id}`);

      console.log("--- DEBUG: UPDATE PRODUCT ---");
      console.log("URL:", url);

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedProduct),
      });

      const data = await res.json();
      console.log("Status:", res.status);

      if (!res.ok)
        throw new Error(data?.message || "Failed to update product.");

      setSuccessMessage(`Product updated: ${updatedProduct.name}`);
      setEditProduct(null);
      await fetchProducts();
    } catch (err) {
      console.error("Update error:", err);
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSelectedProducts = async () => {
    if (selectedProductIds.length === 0) return;
    try {
      setIsDeleting(true);
      await Promise.all(
        selectedProductIds.map(async (productId) => {
          const url = getAdminApiUrl(`/products/${productId}`);
          const res = await fetch(url, {
            method: "DELETE",
            credentials: "include",
          });
          if (!res.ok) throw new Error(`Failed to delete ${productId}`);
        }),
      );
      setSuccessMessage(`${selectedProductIds.length} product(s) deleted.`);
      setSelectedProductIds([]);
      setIsBulkDeleteOpen(false);
      await fetchProducts();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsDeleting(false);
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
      const url = getAdminApiUrl(`/products/${product.id}`);
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete product.");
      setSuccessMessage(`Product deleted: ${product.name}`);
      setDeleteProduct(null);
      setSelectedProductIds((prev) => prev.filter((id) => id !== product.id));
      await fetchProducts();
    } catch (err) {
      setErrorMessage(err.message);
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

        {selectedProductIds.length > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3 border border-red-200 bg-red-50 px-4 py-3">
            <p className="font-ui text-sm text-red-700">
              Selected: {selectedProductIds.length} product(s)
            </p>
            <button
              type="button"
              className="border border-red-600 bg-red-600 px-4 py-2 font-ui text-sm text-white"
              onClick={() => setIsBulkDeleteOpen(true)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete selected"}
            </button>
          </div>
        )}

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
            Showing {showingCount} of {totalItems} filtered products
          </p>
          <button
            type="button"
            className="border border-black bg-white px-4 py-2 font-ui text-sm"
            onClick={() => {
              setSearchValue("");
              setCategoryFilter("all");
              setSortValue("newest");
              setSelectedProductIds([]);
              setPage(1);
            }}
          >
            Reset filters
          </button>
        </div>

        {successMessage && (
          <div className="mt-6 border border-green-700 bg-green-50 px-4 py-3 font-ui text-sm text-green-800">
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 border border-red-600 bg-red-50 px-4 py-3 font-ui text-sm text-red-700">
            <span>{errorMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[400px] w-full items-center justify-center">
            <Loader className="h-12 w-12" />
          </div>
        ) : (
          <>
            {/* MOBILE VIEW */}
            <div className="mt-6 grid gap-3 lg:hidden">
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className={`border bg-white p-4 ${
                    selectedProductIds.includes(product.id)
                      ? "border-black"
                      : "border-black/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative h-20 w-20 shrink-0 border border-black/10 overflow-hidden bg-gray-50">
                      <ProductImage
                        src={product.thumbnail}
                        alt={product.name}
                        loaded={true}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-ui text-sm font-medium leading-tight">
                            {product.name}
                          </p>
                          <p className="mt-1 text-[11px] text-black/40">
                            {product.id}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(product.id)}
                          onChange={() => toggleSelectProduct(product.id)}
                          className="h-5 w-5 shrink-0"
                        />
                      </div>
                      <p className="mt-2 font-ui text-sm font-semibold text-black">
                        €{product.priceValue}
                      </p>
                      <div className="mt-2">
                        {(() => {
                          const stock = getStockBadge(product);
                          return (
                            <span
                              className={`border px-2 py-1 text-[10px] uppercase tracking-wider ${stock.className}`}
                            >
                              {stock.label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="flex-1 border border-black bg-white py-3 font-ui text-xs uppercase tracking-widest hover:bg-black hover:text-white"
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="flex-1 border border-red-600 text-red-600 py-3 font-ui text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW */}
            <AdminProductsTable
              products={paginatedProducts}
              onDelete={handleDeleteProduct}
              onEdit={handleEditProduct}
              selectedProductIds={selectedProductIds}
              onToggleSelectProduct={toggleSelectProduct}
              onToggleSelectAllProducts={toggleSelectAllProducts}
            />

            <div className="mt-8 flex flex-col items-center gap-3">
              <Pagination
                totalItems={totalItems}
                page={safePage}
                pageSize={pageSize}
                onPageChange={setPage}
                siblingCount={1}
              />
            </div>
          </>
        )}

        {isCreateOpen && (
          <AdminProductCreateModal
            onClose={() => setIsCreateOpen(false)}
            onCreate={handleCreateProduct}
            isSaving={isSaving}
          />
        )}
        {deleteProduct && (
          <AdminProductDeleteModal
            product={deleteProduct}
            onClose={() => setDeleteProduct(null)}
            onConfirm={() => confirmDeleteProduct(deleteProduct)}
            deleting={isDeleting}
          />
        )}
        {isBulkDeleteOpen && (
          <AdminProductBulkDeleteModal
            count={selectedProductIds.length}
            onClose={() => setIsBulkDeleteOpen(false)}
            onConfirm={handleDeleteSelectedProducts}
            deleting={isDeleting}
          />
        )}
        {editProduct && (
          <AdminProductEditModal
            onClose={() => setEditProduct(null)}
            onUpdate={handleUpdateProduct}
            initialData={editProduct}
            isSaving={isSaving}
          />
        )}
      </main>
      <FullWidthDivider />
    </>
  );
}
