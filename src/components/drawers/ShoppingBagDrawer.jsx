import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiGet } from "@/lib/api";

import useBagDrawer from "@/store/useBagDrawer";
import useCart from "@/store/useCart";
import useLanguage from "@/context/useLanguage";
import preventDragHandler from "@/utils/preventDrag";

import ProductImage from "@/components/ui/ProductCard/ProductImage";

import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";
import trashIcon from "@/assets/ui/trash.svg";

const fmtPrice = (n) =>
  new Intl.NumberFormat("lt-LT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(n || 0));

// --- Logic Helpers ---
function getAvailableColors(product, item) {
  if (product?.colors?.length > 0) return product.colors;
  if (product?.variants) {
    const variantColors = Object.keys(product.variants);
    if (variantColors.length > 0) return variantColors;
  }
  return item?.color ? [item.color] : ["silver"];
}

function getAvailableSizes(product, color, item) {
  if (product?.variants?.[color]) {
    const sizes = product.variants[color]
      .map((v) => (v.size ? String(v.size) : null))
      .filter(Boolean);
    if (sizes.length > 0) return sizes;
  }
  if (product?.sizes?.length > 0) return product.sizes.map(String);
  return item?.size ? [String(item.size)] : [];
}

function getVariantStock(product, color, size) {
  if (!product?.variants || !product.variants[color]) return 0;
  const variant = product.variants[color].find(
    (v) => String(v.size) === String(size),
  );
  return variant ? Number(variant.stock) : 0;
}

const drawerVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", damping: 27, stiffness: 200 },
  },
  exit: { x: "100%", transition: { ease: "easeInOut", duration: 0.3 } },
};

export default function ShoppingBagDrawer() {
  const navigate = useNavigate();
  const isOpen = useBagDrawer((s) => s.isOpen);
  const close = useBagDrawer((s) => s.close);

  const items = useCart((s) => s.items);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const removeItem = useCart((s) => s.removeItem);
  const updateVariant = useCart((s) => s.updateVariant);

  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  const getCleanApiUrl = () => {
    let url =
      import.meta.env.VITE_API_URL || "https://bd-shop-gfva.onrender.com";
    return url.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  };

  const API_URL = getCleanApiUrl();

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const fetchLatestStock = async () => {
      try {
        setIsValidating(true);
        const data = await apiGet(`${API_URL}/api/products`);
        if (isMounted) {
          const list = Array.isArray(data) ? data : data?.products || [];
          setProducts(list);
        }
      } catch (err) {
        console.error("Drawer API Error:", err);
      } finally {
        if (isMounted) setIsValidating(false);
      }
    };

    fetchLatestStock();
    return () => {
      isMounted = false;
    };
  }, [isOpen, API_URL]);

  const findProduct = useCallback(
    (item) => {
      const itemId = String(item.productId || item.id || "");
      return products.find((p) => String(p.id) === itemId) || null;
    },
    [products],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.price) * (item.quantity || 1),
        0,
      ),
    [items],
  );

  const hasInStockErrors = useMemo(() => {
    if (products.length === 0) return false;
    return items.some((item) => {
      const product = findProduct(item);
      if (!product) return false;
      const stock = getVariantStock(product, item.color, item.size);
      return stock < item.quantity;
    });
  }, [items, products, findProduct]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[150] select-none overflow-hidden"
          onDragStart={preventDragHandler}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          <motion.aside
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-0 h-full w-[min(92vw,420px)] border-l border-black bg-white shadow-2xl flex flex-col"
          >
            <div className="flex h-16 items-center justify-between border-b border-black px-6 shrink-0">
              <p className="font-display text-[20px] uppercase tracking-tight">
                {t.bag}
              </p>
              <button
                onClick={close}
                className="flex items-center gap-2 font-ui text-[14px] group"
              >
                {t.close}{" "}
                <img
                  src={arrowUpRightIcon}
                  alt=""
                  className="h-3 w-3 group-hover:rotate-45 transition-transform"
                />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-6 py-10 text-center font-ui text-[14px] text-black/60 italic">
                  {t.bagEmpty}
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {items.map((item) => {
                    const product = findProduct(item);
                    const colors = getAvailableColors(product, item);
                    const sizes = getAvailableSizes(product, item.color, item);
                    const stock = product
                      ? getVariantStock(product, item.color, item.size)
                      : 99;
                    const isOutOfStock = stock <= 0;
                    const hasLowStock = stock > 0 && stock < item.quantity;

                    return (
                      <motion.div
                        key={item.key}
                        layout
                        className={`px-6 py-6 transition-colors ${isOutOfStock || hasLowStock ? "bg-red-50/50" : ""}`}
                      >
                        <div className="grid grid-cols-[90px_1fr] gap-5">
                          {/* PAKEISTA: Naudojame ProductImage vietoj paprasto img krovimui iš Render */}
                          <div className="h-[110px] w-[90px] relative overflow-hidden bg-black/5">
                            <ProductImage
                              src={item.image}
                              alt={item.name}
                              loaded={true}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-display text-[18px] leading-tight">
                                {item.name}
                              </p>
                              <p className="font-ui text-[14px]">
                                {fmtPrice(item.price)}
                              </p>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <div className="bg-black/5 px-2 py-1.5 rounded-sm relative">
                                <p className="text-[10px] uppercase text-black/40 font-ui mb-1">
                                  Color
                                </p>
                                <select
                                  value={item.color}
                                  className="w-full bg-transparent font-ui text-[12px] outline-none capitalize cursor-pointer pr-4"
                                  onChange={(e) =>
                                    updateVariant(item.key, {
                                      color: e.target.value,
                                    })
                                  }
                                >
                                  {colors.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {sizes.length > 0 && (
                                <div className="bg-black/5 px-2 py-1.5 rounded-sm relative">
                                  <p className="text-[10px] uppercase text-black/40 font-ui mb-1">
                                    Size
                                  </p>
                                  <select
                                    value={item.size}
                                    className="w-full bg-transparent font-ui text-[12px] outline-none cursor-pointer pr-4"
                                    onChange={(e) =>
                                      updateVariant(item.key, {
                                        size: e.target.value,
                                      })
                                    }
                                  >
                                    {sizes.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>

                            {(isOutOfStock || hasLowStock) && (
                              <p className="mt-2 text-[11px] font-ui text-red-600 uppercase tracking-wider">
                                {isOutOfStock
                                  ? "Out of stock"
                                  : `Only ${stock} left in stock`}
                              </p>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex border border-black h-8 items-stretch">
                                <button
                                  onClick={() => dec(item.key)}
                                  className="w-8 bg-black/5 disabled:opacity-30"
                                  disabled={item.quantity <= 1}
                                >
                                  –
                                </button>
                                <div className="px-3 flex items-center font-ui text-[12px] border-x border-black">
                                  {item.quantity}
                                </div>
                                <button
                                  onClick={() => inc(item.key)}
                                  className="w-8 bg-black/5 disabled:opacity-30"
                                  disabled={stock <= item.quantity}
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.key)}
                                className="p-1 opacity-40 hover:opacity-100 transition-opacity"
                              >
                                <img
                                  src={trashIcon}
                                  alt=""
                                  className="h-4 w-4"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-black p-6 bg-white shrink-0">
              {hasInStockErrors && (
                <p className="mb-4 text-center text-[12px] font-ui text-red-600 italic">
                  Please update quantities or remove out-of-stock items.
                </p>
              )}
              <button
                onClick={() => {
                  close();
                  navigate("/checkout");
                }}
                disabled={
                  items.length === 0 || hasInStockErrors || isValidating
                }
                className="flex h-12 w-full items-center justify-center gap-4 bg-black font-ui text-[14px] text-white active:scale-[0.98] transition-all disabled:bg-black/20 disabled:cursor-not-allowed"
              >
                {isValidating
                  ? "Validating..."
                  : `Check out — ${fmtPrice(subtotal)}`}
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
