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
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN ||
  process.env.API_ORIGIN ||
  "https://bd-shop-gfva.onrender.com";

function joinUrl(origin, path) {
  const o = String(origin).replace(/\/+$/, "");
  const p = String(path).replace(/^\/+/, "");
  return `${o}/${p}`;
}

function withBackendBase(path) {
  const clean = String(path).replace(/^\/+/, "");
  return joinUrl(BACKEND_ORIGIN, clean);
}

function normalizeFrontendAssetUrl(value) {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/uploads/") || raw.startsWith("uploads/"))
    return withBackendBase(raw);
  return raw;
}

// --- SUTVARKYTA VARIANTŲ KŪRIMO LOGIKA ---
function buildVariants({ variants = [], sizes = [], variantStock = {} }) {
  const cleanSizes = sizes.length ? sizes : ["one size"];
  const result = {};

  for (const variant of variants) {
    const color = variant.name.toLowerCase();
    const normalizedImages = Array.isArray(variant.images)
      ? variant.images.map(normalizeFrontendAssetUrl)
      : [];

    result[color] = cleanSizes.map((size) => {
      let stock = 0;
      if (variantStock[color] && variantStock[color][size] !== undefined) {
        stock = Number(variantStock[color][size]);
      } else if (
        variantStock[color] &&
        variantStock[color]["default"] !== undefined
      ) {
        stock = Number(variantStock[color]["default"]);
      }

      return {
        size: String(size),
        stock: Math.max(0, stock),
        images: normalizedImages,
      };
    });
  }
  return result;
}

function getTotalStockFromVariants(variants = {}) {
  return Object.values(variants).reduce((total, colorVariants) => {
    if (!Array.isArray(colorVariants)) return total;
    return (
      total + colorVariants.reduce((sum, v) => sum + (Number(v?.stock) || 0), 0)
    );
  }, 0);
}

function mapProductRow(row) {
  const colors = safeJsonParse(row.colors, []);
  const variants = safeJsonParse(row.variants, {});
  const sizes = safeJsonParse(row.sizes, []);
  const details = safeJsonParse(row.details, {});
  const images = safeJsonParse(row.images, []);

  const stockFromDb = Number(row.stock_quantity);
  const totalStockQuantity = !isNaN(stockFromDb)
    ? stockFromDb
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

/** GET ALL */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows.map(mapProductRow));
  } catch {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

/** GET ONE */
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

/** UPDATE */
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    // IŠ BODY PASIIMAME TIK TUOS DUOMENIS, KURIŲ REIKIA SQL UŽKLAUSAI
    const {
      name,
      category,
      priceValue,
      createdAt,
      variants,
      sizes,
      variantStock,
      isBestSeller,
    } = req.body;
    const id = req.params.id;

    const builtVariants = buildVariants({ variants, sizes, variantStock });
    const colors = Object.keys(builtVariants);
    const totalStock = getTotalStockFromVariants(builtVariants);

    const allImages = Object.values(builtVariants).flatMap(
      (colorArr) => colorArr[0]?.images || [],
    );
    const thumbnail = allImages[0] || "";

    await db.query(
      `UPDATE products SET 
        name = ?, category = ?, price_value = ?, created_at = ?, 
        is_best_seller = ?, thumbnail = ?, images = ?, colors = ?, 
        variants = ?, sizes = ?, stock_quantity = ? 
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
        id,
      ],
    );

    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
    res.json({ product: mapProductRow(rows[0]) });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: err.message });
  }
});

/** DELETE */
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
