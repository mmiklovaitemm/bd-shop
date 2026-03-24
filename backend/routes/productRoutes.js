import express from "express";
import db from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

function safeJsonParse(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return fallback;

  try {
    return JSON.parse(trimmed);
  } catch {
    return fallback;
  }
}

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const FRONTEND_BASE_PATH = process.env.FRONTEND_BASE_PATH || "/";

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
  return joinUrl(FRONTEND_ORIGIN, `${base}${clean}`);
}

function normalizeFrontendAssetUrl(value) {
  if (!value) return "";

  const raw = String(value).trim();
  if (!raw) return "";

  if (raw.includes("/uploads/")) {
    return raw;
  }

  const productsMatch = raw.match(/\/products\/(.+)$/);
  if (productsMatch) {
    return withBase(`products/${productsMatch[1]}`);
  }

  if (raw.startsWith("products/")) {
    return withBase(raw);
  }

  if (raw.startsWith("/products/")) {
    return withBase(raw.replace(/^\/+/, ""));
  }

  return raw;
}

function mapProductRow(row) {
  const colors = safeJsonParse(row.colors, []);
  const variantsRaw = safeJsonParse(row.variants, {});
  const gemstones = safeJsonParse(row.gemstones, []);
  const sizes = safeJsonParse(row.sizes, []);
  const details = safeJsonParse(row.details, {});

  const variants = Object.fromEntries(
    Object.entries(variantsRaw || {}).map(([color, value]) => {
      if (!Array.isArray(value)) {
        return [color, []];
      }

      const isOldFormat = value.length > 0 && typeof value[0] === "string";

      if (isOldFormat) {
        const normalizedImages = value.map((img) =>
          normalizeFrontendAssetUrl(img),
        );

        return [color, normalizedImages];
      }

      const normalizedVariantObjects = value.map((variant) => ({
        size: String(variant?.size || "").trim(),
        stock: Math.max(0, Number(variant?.stock) || 0),
        images: Array.isArray(variant?.images)
          ? variant.images.map((img) => normalizeFrontendAssetUrl(img))
          : [],
      }));

      return [color, normalizedVariantObjects];
    }),
  );

  const hasVariantLevelStock = Object.values(variants).some(
    (value) =>
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === "object" &&
      value[0] !== null &&
      "stock" in value[0],
  );

  const totalStockQuantity = hasVariantLevelStock
    ? Object.values(variants).reduce((total, colorVariants) => {
        if (!Array.isArray(colorVariants)) return total;
        if (!colorVariants.length) return total;
        if (typeof colorVariants[0] === "string") return total;

        return (
          total +
          colorVariants.reduce((sum, variant) => {
            return sum + Math.max(0, Number(variant?.stock) || 0);
          }, 0)
        );
      }, 0)
    : Math.max(0, Number(row.stock_quantity) || 0);

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    priceValue: Number(row.price_value),
    price: `€${Number(row.price_value)}`,
    createdAt: row.created_at,
    stockQuantity: totalStockQuantity,
    isSoldOut: totalStockQuantity <= 0,
    isBestSeller: Boolean(row.is_best_seller),
    hasGem: Boolean(row.has_gem),
    surface: row.surface,
    thumbnail: normalizeFrontendAssetUrl(row.thumbnail),
    colors,
    variants,
    gemstones,
    sizes,
    details,
  };
}

function normalizeImageList(category, list = []) {
  return (list || [])
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item === "object") {
        if (typeof item.url === "string") return item.url.trim();
        if (typeof item.src === "string") return item.src.trim();
        if (typeof item.path === "string") return item.path.trim();
        if (typeof item.value === "string") return item.value.trim();
      }

      return "";
    })
    .filter(Boolean)
    .map((item) => {
      if (/^https?:\/\//i.test(item)) {
        return item;
      }

      if (item.includes("/uploads/")) {
        return item;
      }

      if (item.startsWith("/products/")) {
        return withBase(item.replace(/^\/+/, ""));
      }

      if (item.startsWith("products/")) {
        return withBase(item);
      }

      return withBase(`products/${category}/${item}`);
    });
}

function buildVariantsWithStock({
  normalizedSilverImages = [],
  normalizedGoldImages = [],
  sizes = [],
  variantStock = {},
}) {
  const cleanSizes = Array.isArray(sizes)
    ? sizes.map((size) => String(size).trim()).filter(Boolean)
    : [];

  const effectiveSizes = cleanSizes.length ? cleanSizes : ["one size"];

  const grouped = {};

  const getStock = (color, size) => {
    const rawValue = variantStock?.[color]?.[size];
    return Math.max(0, Number(rawValue) || 0);
  };

  if (normalizedSilverImages.length) {
    grouped.silver = effectiveSizes.map((size) => ({
      size,
      stock: getStock("silver", size),
      images: normalizedSilverImages,
    }));
  }

  if (normalizedGoldImages.length) {
    grouped.gold = effectiveSizes.map((size) => ({
      size,
      stock: getStock("gold", size),
      images: normalizedGoldImages,
    }));
  }

  return grouped;
}

function getTotalStockFromVariants(variants = {}) {
  return Object.values(variants).reduce((total, colorVariants) => {
    if (!Array.isArray(colorVariants)) return total;

    return (
      total +
      colorVariants.reduce((sum, variant) => {
        return sum + Math.max(0, Number(variant?.stock) || 0);
      }, 0)
    );
  }, 0);
}

function buildVariantsPreservingStock({
  existingVariantsRaw = {},
  normalizedSilverImages = [],
  normalizedGoldImages = [],
  sizes = [],
  variantStock = {},
}) {
  const existingVariants = safeJsonParse(existingVariantsRaw, {}) || {};

  const cleanSizes = Array.isArray(sizes)
    ? sizes.map((size) => String(size).trim()).filter(Boolean)
    : [];

  const effectiveSizes = cleanSizes.length ? cleanSizes : ["one size"];

  const nextVariants = {};

  const getIncomingStock = (color, size) => {
    const rawValue = variantStock?.[color]?.[size];
    return Math.max(0, Number(rawValue) || 0);
  };

  const colorConfigs = [
    { color: "silver", images: normalizedSilverImages },
    { color: "gold", images: normalizedGoldImages },
  ];

  for (const { color, images } of colorConfigs) {
    if (!images.length) continue;

    const existingColorVariants = Array.isArray(existingVariants[color])
      ? existingVariants[color]
      : [];

    nextVariants[color] = effectiveSizes.map((size) => {
      const existingVariant = existingColorVariants.find((variant) => {
        if (!variant || typeof variant !== "object" || Array.isArray(variant)) {
          return false;
        }

        return String(variant?.size || "").trim() === size;
      });

      const hasIncomingStock =
        variantStock?.[color] &&
        Object.prototype.hasOwnProperty.call(variantStock[color], size);

      return {
        size,
        stock: hasIncomingStock
          ? getIncomingStock(color, size)
          : Math.max(0, Number(existingVariant?.stock) || 0),
        images,
      };
    });
  }

  return nextVariants;
}

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows.map(mapProductRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(mapProductRow(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      id,
      name,
      category,
      priceValue,
      createdAt,
      description,
      silverImages = [],
      goldImages = [],
      sizes = [],
      variantStock = {},
      isBestSeller = false,
    } = req.body || {};

    if (
      !id ||
      !name ||
      !category ||
      !priceValue ||
      !createdAt ||
      !description
    ) {
      return res.status(400).json({
        message:
          "id, name, category, priceValue, createdAt and description are required.",
      });
    }

    const [existing] = await db.query(
      "SELECT id FROM products WHERE id = ? LIMIT 1",
      [id],
    );

    if (existing.length) {
      return res.status(409).json({ message: "Product id already exists." });
    }

    const normalizedSilverImages = normalizeImageList(category, silverImages);
    const normalizedGoldImages = normalizeImageList(category, goldImages);

    const variants = buildVariantsWithStock({
      normalizedSilverImages,
      normalizedGoldImages,
      sizes,
      variantStock,
    });

    const colors = Object.keys(variants);
    const totalStockQuantity = getTotalStockFromVariants(variants);

    const thumbnail =
      normalizedSilverImages[0] || normalizedGoldImages[0] || "";

    const details = {
      detailsText: description,
    };

    await db.query(
      `INSERT INTO products (
        id,
        name,
        category,
        price_value,
        created_at,
        is_best_seller,
        has_gem,
        surface,
        thumbnail,
        colors,
        variants,
        gemstones,
        sizes,
        details,
        stock_quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        category,
        Number(priceValue),
        createdAt,
        isBestSeller ? 1 : 0,
        0,
        "smooth",
        thumbnail,
        JSON.stringify(colors),
        JSON.stringify(variants),
        JSON.stringify([]),
        JSON.stringify(sizes),
        JSON.stringify(details),
        totalStockQuantity,
      ],
    );

    const [rows] = await db.query(
      "SELECT * FROM products WHERE id = ? LIMIT 1",
      [id],
    );

    return res.status(201).json({
      product: mapProductRow(rows[0]),
    });
  } catch (err) {
    console.error("Create product error:", err);
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      "SELECT id, name FROM products WHERE id = ? LIMIT 1",
      [id],
    );

    if (!existing.length) {
      return res.status(404).json({ message: "Product not found." });
    }

    await db.query("DELETE FROM products WHERE id = ?", [id]);

    return res.json({
      ok: true,
      deletedProduct: existing[0],
    });
  } catch (err) {
    console.error("Delete product error:", err);
    return res.status(500).json({ message: err.message });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { id: routeId } = req.params;

    const {
      id,
      name,
      category,
      priceValue,
      createdAt,
      description,
      silverImages = [],
      goldImages = [],
      sizes = [],
      variantStock = {},
      isBestSeller = false,
    } = req.body || {};

    if (
      !id ||
      !name ||
      !category ||
      !priceValue ||
      !createdAt ||
      !description
    ) {
      return res.status(400).json({
        message:
          "id, name, category, priceValue, createdAt and description are required.",
      });
    }

    if (routeId !== id) {
      return res.status(400).json({
        message: "Product id in URL and body must match.",
      });
    }

    const [existingRows] = await db.query(
      "SELECT id, variants, details FROM products WHERE id = ? LIMIT 1",
      [id],
    );

    if (!existingRows.length) {
      return res.status(404).json({ message: "Product not found." });
    }

    const existingProduct = existingRows[0];

    const normalizedSilverImages = normalizeImageList(category, silverImages);
    const normalizedGoldImages = normalizeImageList(category, goldImages);

    const variants = buildVariantsPreservingStock({
      existingVariantsRaw: existingProduct.variants,
      normalizedSilverImages,
      normalizedGoldImages,
      sizes,
      variantStock,
    });

    const colors = Object.keys(variants);
    const totalStockQuantity = getTotalStockFromVariants(variants);

    const thumbnail =
      normalizedSilverImages[0] || normalizedGoldImages[0] || "";

    let existingDetails = {};

    try {
      existingDetails = existingProduct?.details
        ? JSON.parse(existingProduct.details)
        : {};
    } catch {
      existingDetails = {};
    }

    const details = {
      ...existingDetails,
      detailsText: description,
    };

    await db.query(
      `UPDATE products
       SET name = ?,
           category = ?,
           price_value = ?,
           created_at = ?,
           is_best_seller = ?,
           has_gem = ?,
           surface = ?,
           thumbnail = ?,
           colors = ?,
           variants = ?,
           gemstones = ?,
           sizes = ?,
           details = ?,
           stock_quantity = ?
       WHERE id = ?`,
      [
        name,
        category,
        Number(priceValue),
        createdAt,
        isBestSeller ? 1 : 0,
        0,
        "smooth",
        thumbnail,
        JSON.stringify(colors),
        JSON.stringify(variants),
        JSON.stringify([]),
        JSON.stringify(sizes),
        JSON.stringify(details),
        totalStockQuantity,
        id,
      ],
    );

    const [rows] = await db.query(
      "SELECT * FROM products WHERE id = ? LIMIT 1",
      [id],
    );

    return res.json({
      product: mapProductRow(rows[0]),
    });
  } catch (err) {
    console.error("Update product error:", err);
    return res.status(500).json({ message: err.message });
  }
});

export default router;
