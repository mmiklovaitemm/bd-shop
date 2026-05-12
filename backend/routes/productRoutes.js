import express from "express";
import db from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// --- HELPER FUNCTIONS ---

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

function normalizeFrontendAssetUrl(value) {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/uploads/") || raw.startsWith("uploads/")) {
    const cleanPath = raw.startsWith("/") ? raw : `/${raw}`;
    return `${BACKEND_ORIGIN}${cleanPath}`;
  }
  return raw;
}

/**
 * Builds variant rows from admin form input for inserting into product_variants.
 * Returns array of { color, size, stock, images }.
 */
function buildVariantRows({ variants = [], sizes = [], variantStock = {} }) {
  const cleanSizes = sizes.length ? sizes : ["one size"];
  const rows = [];

  for (const variant of variants) {
    const color = variant.name.toLowerCase();
    const rawImages = Array.isArray(variant.images)
      ? variant.images
      : String(variant.images || "")
          .split("\n")
          .filter(Boolean);
    const normalizedImages = rawImages.map(normalizeFrontendAssetUrl);

    for (const size of cleanSizes) {
      let stock = 0;
      if (variantStock[color]?.[size] !== undefined) {
        stock = Number(variantStock[color][size]);
      } else if (variantStock[color]?.["default"] !== undefined) {
        stock = Number(variantStock[color]["default"]);
      }
      rows.push({
        color,
        size: String(size),
        stock: Math.max(0, isNaN(stock) ? 0 : stock),
        images: normalizedImages,
      });
    }
  }
  return rows;
}

/**
 * Reconstructs the variants object shape from product_variants DB rows.
 * Returns { variants: {color: [{size, stock, images}]}, colors, sizes }
 */
function variantRowsToShape(rows = []) {
  const variants = {};
  const sizesSet = new Set();

  for (const row of rows) {
    const color = row.color;
    const images = safeJsonParse(
      typeof row.images === "string" ? row.images : JSON.stringify(row.images ?? []),
      []
    );
    if (!variants[color]) variants[color] = [];
    variants[color].push({
      size: row.size,
      stock: Number(row.stock),
      images: images.map(normalizeFrontendAssetUrl),
    });
    sizesSet.add(row.size);
  }

  return {
    variants,
    colors: Object.keys(variants),
    sizes: [...sizesSet],
  };
}

function getTotalStock(variantRows = []) {
  return variantRows.reduce(
    (sum, r) => sum + Math.max(0, Number(r.stock) || 0),
    0
  );
}

/**
 * Maps a raw DB row + its product_variants rows to a frontend product object.
 */
function mapProductRow(row, variantRows = []) {
  if (!row) return null;
  const details = safeJsonParse(row.details, {});
  const images = safeJsonParse(row.images, []);
  const { variants, sizes } = variantRowsToShape(variantRows);
  const stockQuantity = getTotalStock(variantRows);

  // Restore original color order from products.colors (stored when product was created)
  const storedColors = safeJsonParse(row.colors, []);
  const variantColorSet = new Set(Object.keys(variants));
  const colors =
    storedColors.length > 0
      ? [
          ...storedColors.filter((c) => variantColorSet.has(c)),
          ...Object.keys(variants).filter((c) => !storedColors.includes(c)),
        ]
      : Object.keys(variants);

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    priceValue: Number(row.price_value),
    price: `€${Number(row.price_value)}`,
    createdAt: row.created_at,
    stockQuantity,
    isSoldOut: stockQuantity <= 0,
    isBestSeller: Boolean(row.is_best_seller),
    thumbnail: normalizeFrontendAssetUrl(row.thumbnail),
    images: images.map(normalizeFrontendAssetUrl),
    colors,
    variants,
    sizes,
    details,
    hasGem: Boolean(details.hasGem),
    surface: details.surface || null,
    gemstones: Array.isArray(details.gemstones) ? details.gemstones : [],
  };
}

/**
 * Groups product_variants rows by product_id.
 */
function groupVariantsByProduct(variantRows) {
  const map = {};
  for (const v of variantRows) {
    const pid = String(v.product_id);
    if (!map[pid]) map[pid] = [];
    map[pid].push(v);
  }
  return map;
}

/**
 * Inserts product_variants rows for a given product id.
 */
async function insertVariantRows(productId, rows, conn = db) {
  for (const row of rows) {
    await conn.query(
      `INSERT INTO product_variants (product_id, color, size, stock, images)
       VALUES (?, ?, ?, ?, ?)`,
      [
        String(productId),
        row.color,
        row.size,
        row.stock,
        JSON.stringify(row.images),
      ]
    );
  }
}

// --- ROUTES ---

/** GET /api/products */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    if (!rows.length) return res.json([]);

    const ids = rows.map((r) => String(r.id));
    const [variantRows] = await db.query(
      "SELECT * FROM product_variants WHERE product_id IN (?)",
      [ids]
    );
    const variantMap = groupVariantsByProduct(variantRows);

    res.json(
      rows.map((r) => mapProductRow(r, variantMap[String(r.id)] || []))
    );
  } catch {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

/** GET /api/products/:id */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (!rows.length)
      return res.status(404).json({ message: "Product not found" });

    const [variantRows] = await db.query(
      "SELECT * FROM product_variants WHERE product_id = ?",
      [String(req.params.id)]
    );

    res.json(mapProductRow(rows[0], variantRows));
  } catch {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

/** POST /api/products — Admin only */
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

    const variantRows = buildVariantRows({ variants, sizes });

    // Collect all images and derive thumbnail
    const allImages = [];
    for (const vr of variantRows) {
      for (const img of vr.images) {
        if (img && !allImages.includes(img)) allImages.push(img);
      }
    }
    const thumbnail = allImages[0] || "";
    const colors = [...new Set(variantRows.map((v) => v.color))];
    const uniqueSizes = [...new Set(variantRows.map((v) => v.size))];
    const totalStock = variantRows.reduce((s, v) => s + v.stock, 0);

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
        JSON.stringify(colors),
        JSON.stringify({}), // legacy field — no longer the source of truth
        JSON.stringify(uniqueSizes),
        Number(stockQuantity) || totalStock,
        JSON.stringify(details || {}),
      ]
    );

    await insertVariantRows(id, variantRows);

    const [pRows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
    const [vRows] = await db.query(
      "SELECT * FROM product_variants WHERE product_id = ?",
      [String(id)]
    );
    res.status(201).json(mapProductRow(pRows[0], vRows));
  } catch (err) {
    console.error("Create product error:", err);
    if (err.code === "ER_DUP_ENTRY")
      return res
        .status(400)
        .json({ message: "Product with this ID already exists" });
    res.status(500).json({ message: err.message });
  }
});

/** PUT /api/products/:id — Admin only */
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

    const variantRows = buildVariantRows({ variants, sizes, variantStock });
    const colors = [...new Set(variantRows.map((v) => v.color))];
    const uniqueSizes = [...new Set(variantRows.map((v) => v.size))];
    const totalStock = variantRows.reduce((s, v) => s + v.stock, 0);
    const allImages = [];
    for (const vr of variantRows) {
      for (const img of vr.images) {
        if (img && !allImages.includes(img)) allImages.push(img);
      }
    }
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
        JSON.stringify({}), // legacy field
        JSON.stringify(uniqueSizes),
        totalStock,
        JSON.stringify(details || {}),
        id,
      ]
    );

    // Replace all variants for this product
    await db.query(
      "DELETE FROM product_variants WHERE product_id = ?",
      [String(id)]
    );
    await insertVariantRows(id, variantRows);

    const [pRows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
    const [vRows] = await db.query(
      "SELECT * FROM product_variants WHERE product_id = ?",
      [String(id)]
    );
    res.json(mapProductRow(pRows[0], vRows));
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: err.message });
  }
});

/** DELETE /api/products/:id — Admin only */
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    // Delete variants first (no CASCADE since no FK constraint)
    await db.query(
      "DELETE FROM product_variants WHERE product_id = ?",
      [String(req.params.id)]
    );
    await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ ok: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
