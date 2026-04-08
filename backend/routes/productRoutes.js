import express from "express";
import db from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// --- HELPER FUNCTIONS ---

/**
 * Safely parses JSON strings with a fallback value.
 */
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

const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN ||
  process.env.API_ORIGIN ||
  "https://bd-shop-gfva.onrender.com";

/**
 * Normalizes asset URLs. If it's a Cloudinary/external link, leaves it as is.
 * If it's a local upload, prepends the backend origin.
 */
function normalizeFrontendAssetUrl(value) {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  if (raw.startsWith("/uploads/") || raw.startsWith("uploads/")) {
    const cleanPath = raw.startsWith("/") ? raw : `/${raw}`;
    return `${BACKEND_ORIGIN}${cleanPath}`;
  }

  return raw;
}

/**
 * Builds the structured variants object for the database.
 */
function buildVariants({ variants = [], sizes = [], variantStock = {} }) {
  const cleanSizes = sizes.length ? sizes : ["one size"];
  const result = {};

  for (const variant of variants) {
    const color = variant.name.toLowerCase();

    // Ensure images are handled as an array and URLs are normalized
    const rawImages = Array.isArray(variant.images)
      ? variant.images
      : String(variant.images || "")
          .split("\n")
          .filter(Boolean);

    const normalizedImages = rawImages.map(normalizeFrontendAssetUrl);

    result[color] = cleanSizes.map((size) => {
      let stock = 0;
      if (variantStock[color] && variantStock[color][size] !== undefined) {
        stock = Number(variantStock[color][size]);
      } else if (
        variantStock[color] &&
        variantStock[color]["default"] !== undefined
      ) {
        stock = Number(variantStock[color]["default"]);
      } else {
        // Default stock for new products/variants
        stock = 0;
      }

      return {
        size: String(size),
        stock: Math.max(0, isNaN(stock) ? 0 : stock),
        images: normalizedImages,
      };
    });
  }
  return result;
}

/**
 * Calculates total stock quantity by summing up all variant stock levels.
 */
function getTotalStockFromVariants(variants = {}) {
  return Object.values(variants).reduce((total, colorVariants) => {
    if (!Array.isArray(colorVariants)) return total;
    return (
      total + colorVariants.reduce((sum, v) => sum + (Number(v?.stock) || 0), 0)
    );
  }, 0);
}

/**
 * Maps a raw database row to a clean product object for the frontend.
 */
function mapProductRow(row) {
  if (!row) return null;
  const colors = safeJsonParse(row.colors, []);
  const variants = safeJsonParse(row.variants, {});
  const sizes = safeJsonParse(row.sizes, []);
  const details = safeJsonParse(row.details, {});
  const images = safeJsonParse(row.images, []);

  const stockValueFromDb =
    row.stock_quantity !== null ? Number(row.stock_quantity) : NaN;
  const totalStockQuantity = !isNaN(stockValueFromDb)
    ? stockValueFromDb
    : getTotalStockFromVariants(variants);

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
    thumbnail: normalizeFrontendAssetUrl(row.thumbnail),
    images: images.map(normalizeFrontendAssetUrl),
    colors,
    variants,
    sizes,
    details,
  };
}

// --- ROUTES ---

/** * GET /api/products
 * Fetch all products, sorted by newest first.
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM products ORDER BY created_at DESC",
    );
    res.json(rows.map(mapProductRow));
  } catch {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

/** * GET /api/products/:id
 * Fetch a single product by its ID.
 */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (!rows.length)
      return res.status(404).json({ message: "Product not found" });
    res.json(mapProductRow(rows[0]));
  } catch {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

/** * POST /api/products
 * Create a new product. Restricted to Admin.
 */
router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      id,
      name,
      category,
      priceValue,
      createdAt,
      variants,
      sizes,
      isBestSeller,
      stockQuantity,
      details,
    } = req.body;

    const builtVariants = buildVariants({ variants, sizes });

    const allImages = [];
    Object.values(builtVariants).forEach((colorArray) => {
      colorArray.forEach((variant) => {
        if (variant.images && Array.isArray(variant.images)) {
          variant.images.forEach((img) => {
            if (img && !allImages.includes(img)) allImages.push(img);
          });
        }
      });
    });

    const thumbnail = allImages.length > 0 ? allImages[0] : "";

    await db.query(
      `INSERT INTO products (
        id, name, category, price_value, created_at, 
        is_best_seller, thumbnail, images, colors, 
        variants, sizes, stock_quantity, details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        category,
        Number(priceValue),
        createdAt || new Date().toISOString().slice(0, 10),
        isBestSeller ? 1 : 0,
        thumbnail,
        JSON.stringify(allImages),
        JSON.stringify(Object.keys(builtVariants)),
        JSON.stringify(builtVariants),
        JSON.stringify(sizes),
        Number(stockQuantity) || 0,
        JSON.stringify(details || {}),
      ],
    );

    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
    res.status(201).json(mapProductRow(rows[0]));
  } catch (err) {
    console.error("Create product error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "Product with this ID already exists" });
    }
    res.status(500).json({ message: err.message });
  }
});

/** * PUT /api/products/:id
 * Update an existing product. Restricted to Admin.
 */
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const {
      name,
      category,
      priceValue,
      createdAt,
      variants,
      sizes,
      variantStock,
      isBestSeller,
      details,
    } = req.body;
    const id = req.params.id;

    const builtVariants = buildVariants({ variants, sizes, variantStock });
    const colors = Object.keys(builtVariants);
    const totalStock = getTotalStockFromVariants(builtVariants);
    const allImages = Object.values(builtVariants).flatMap(
      (v) => v[0]?.images || [],
    );
    const thumbnail = allImages[0] || "";

    await db.query(
      `UPDATE products SET 
        name = ?, category = ?, price_value = ?, created_at = ?, 
        is_best_seller = ?, thumbnail = ?, images = ?, colors = ?, 
        variants = ?, sizes = ?, stock_quantity = ?, details = ?
      WHERE id = ?`,
      [
        name,
        category,
        Number(priceValue),
        createdAt,
        isBestSeller ? 1 : 0,
        thumbnail,
        JSON.stringify(allImages),
        JSON.stringify(colors),
        JSON.stringify(builtVariants),
        JSON.stringify(sizes),
        totalStock,
        JSON.stringify(details || {}),
        id,
      ],
    );

    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
    res.json(mapProductRow(rows[0]));
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: err.message });
  }
});

/** * DELETE /api/products/:id
 * Delete a product by its ID. Restricted to Admin.
 */
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ ok: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
