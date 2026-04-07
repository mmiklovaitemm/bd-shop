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

const cleanImageUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (url.includes("cloudinary.com")) return url;

  if (url.includes("localhost:")) {
    const parts = url.split("/products/");
    if (parts.length > 1) return "products/" + parts[1];

    return url.replace(/^https?:\/\/localhost:\d+\//, "");
  }
  return url;
};

// --- LOGIC HELPERS ---

function getAvailableColors(product, item) {
  if (!product) return [item?.color || "silver"];
  let colors = [];
  if (Array.isArray(product.variants)) {
    colors = product.variants.map((v) => v.name);
  } else if (product.variants && typeof product.variants === "object") {
    colors = Object.keys(product.variants);
  }
  return colors.length > 0 ? colors : [item?.color || "silver"];
}

function getAvailableSizes(product, colorName, item) {
  if (!product) return [String(item?.size || "")].filter(Boolean);
  let sizes = [];
  if (Array.isArray(product.variants)) {
    const variant = product.variants.find((v) => v.name === colorName);
    if (variant && Array.isArray(variant.sizes)) {
      sizes = variant.sizes.map(String);
    }
  }
  if (sizes.length === 0 && Array.isArray(product.sizes)) {
    sizes = product.sizes.map(String);
  }
  return sizes.filter(Boolean);
}

function getVariantStock(product, colorName, size) {
  if (!product) return 0;
  if (product.variantStock?.[colorName]?.[size] !== undefined) {
    return Number(product.variantStock[colorName][size]);
  }
  return Number(product.stockQuantity || 0);
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

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const fetchLatestStock = async () => {
      try {
        setIsValidating(true);
        const data = await apiGet("/products");
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
  }, [isOpen]);

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

  const handleVariantUpdate = (item, product, newColor, newSize) => {
    console.log("--- ATNAUJINIMO ANALIZĖ ---");

    const color = newColor || item.color;
    let size = newSize || item.size;
    let image = item.image;

    if (product) {
      const variantList = Array.isArray(product.variants)
        ? product.variants
        : product.variants
          ? Object.entries(product.variants).map(([name, data]) => ({
              name,
              ...data,
            }))
          : [];

      const variant = variantList.find(
        (v) => String(v.name).toLowerCase() === String(color).toLowerCase(),
      );

      if (variant) {
        const variantImages = variant.images || variant.image;
        if (variantImages) {
          const imgUrl = Array.isArray(variantImages)
            ? variantImages[0]
            : variantImages;
          if (imgUrl) {
            image = cleanImageUrl(imgUrl); // Išvalome localhost nuorodą čia
            console.log("Parinkta nauja išvalyta nuotrauka:", image);
          }
        }
      }

      const availableSizes = getAvailableSizes(product, color, item);
      if (newColor && !availableSizes.includes(String(size))) {
        size = availableSizes[0] || item.size;
      }
    }

    console.log("Siunčiama į krepšelį (updateVariant):", {
      color,
      size,
      image,
    });
    updateVariant(item.key, { color, size, image });
  };

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
              <p className="font-display text-[20px] uppercase">{t.bag}</p>
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
                    const stockLimit = product
                      ? getVariantStock(product, item.color, item.size)
                      : 99;

                    return (
                      <motion.div key={item.key} layout className="px-6 py-6">
                        <div className="grid grid-cols-[90px_1fr] gap-5">
                          <div className="h-[110px] w-[90px] relative overflow-hidden bg-black/5 border border-black/5">
                            {/* VALOMEitem.image PRIES PADUODANT I KOMPONENTA */}
                            <ProductImage
                              src={cleanImageUrl(item.image)}
                              alt={item.name}
                              loaded={true}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-display text-[17px] leading-tight pr-2">
                                {item.name}
                              </p>
                              <p className="font-ui text-[14px]">
                                {fmtPrice(item.price)}
                              </p>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <div className="bg-black/5 px-2 py-1.5 rounded-sm relative">
                                <p className="text-[9px] uppercase text-black/40 font-ui mb-0.5">
                                  Color
                                </p>
                                <select
                                  value={item.color}
                                  className="w-full bg-transparent font-ui text-[12px] outline-none capitalize cursor-pointer"
                                  onChange={(e) =>
                                    handleVariantUpdate(
                                      item,
                                      product,
                                      e.target.value,
                                      null,
                                    )
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
                                  <p className="text-[9px] uppercase text-black/40 font-ui mb-0.5">
                                    Size
                                  </p>
                                  <select
                                    value={item.size}
                                    className="w-full bg-transparent font-ui text-[12px] outline-none cursor-pointer"
                                    onChange={(e) =>
                                      handleVariantUpdate(
                                        item,
                                        product,
                                        null,
                                        e.target.value,
                                      )
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

                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex border border-black h-8 items-stretch">
                                <button
                                  onClick={() => dec(item.key)}
                                  className="w-8 bg-black/5"
                                  disabled={item.quantity <= 1}
                                >
                                  –
                                </button>
                                <div className="px-3 flex items-center font-ui text-[12px] border-x border-black bg-white">
                                  {item.quantity}
                                </div>
                                <button
                                  onClick={() => inc(item.key)}
                                  className="w-8 bg-black/5"
                                  disabled={stockLimit <= item.quantity}
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.key)}
                                className="p-1.5 opacity-40 hover:opacity-100 transition-all"
                              >
                                <img
                                  src={trashIcon}
                                  alt="Remove"
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
              <button
                onClick={() => {
                  close();
                  navigate("/checkout");
                }}
                className="flex h-12 w-full items-center justify-center bg-black font-ui text-[14px] text-white uppercase tracking-widest disabled:bg-black/20"
                disabled={items.length === 0 || isValidating}
              >
                {isValidating
                  ? "Validating..."
                  : `${t.checkout} — ${fmtPrice(subtotal)}`}
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
