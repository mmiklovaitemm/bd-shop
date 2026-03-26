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
  "http://localhost:4000";

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

function withBackendBase(path) {
  const clean = String(path).replace(/^\/+/, "");
  return joinUrl(BACKEND_ORIGIN, clean);
}

function normalizeFrontendAssetUrl(value) {
  if (!value) return "";

  const raw = String(value).trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);

      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        if (url.pathname.startsWith("/products/")) {
          return withBase(url.pathname.replace(/^\/+/, ""));
        }

        if (url.pathname.startsWith("/uploads/")) {
          return withBackendBase(url.pathname.replace(/^\/+/, ""));
        }
      }

      return raw;
    } catch {
      return raw;
    }
  }

  if (raw.startsWith("/uploads/")) {
    return withBackendBase(raw);
  }

  if (raw.startsWith("uploads/")) {
    return withBackendBase(raw);
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
        try {
          const url = new URL(item);

          if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
            if (url.pathname.startsWith("/products/")) {
              return withBase(url.pathname.replace(/^\/+/, ""));
            }

            if (url.pathname.startsWith("/uploads/")) {
              return withBackendBase(url.pathname.replace(/^\/+/, ""));
            }
          }

          return item;
        } catch {
          return item;
        }
      }

      if (item.startsWith("/uploads/")) {
        return withBackendBase(item);
      }

      if (item.startsWith("uploads/")) {
        return withBackendBase(item);
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

function buildVariants({ variants = [], sizes = [], variantStock = {} }) {
  const cleanSizes = sizes.length ? sizes : ["one size"];

  const result = {};

  for (const variant of variants) {
    const color = variant.name.toLowerCase();

    const normalizedImages = normalizeImageList(
      variant.category || "",
      variant.images,
    );

    result[color] = cleanSizes.map((size) => ({
      size,
      stock: Math.max(0, Number(variantStock?.[color]?.[size] || 0)),
      images: normalizedImages,
    }));
  }

  return result;
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

function mapProductRow(row) {
  const colors = safeJsonParse(row.colors, []);
  const variantsRaw = safeJsonParse(row.variants, {});
  const sizes = safeJsonParse(row.sizes, []);
  const details = safeJsonParse(row.details, {});

  const variants = Object.fromEntries(
    Object.entries(variantsRaw || {}).map(([color, value]) => [
      color,
      value.map((variant) => ({
        size: variant.size,
        stock: variant.stock,
        images: variant.images.map(normalizeFrontendAssetUrl),
      })),
    ]),
  );

  const totalStockQuantity = getTotalStockFromVariants(variants);

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
    colors,
    variants,
    sizes,
    details,
  };
}

/**
 * GET ALL
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows.map(mapProductRow));
  } catch {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

/**
 * GET ONE
 */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);

    if (!rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(mapProductRow(rows[0]));
  } catch {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

/**
 * CREATE
 */
router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      id,
      name,
      category,
      priceValue,
      createdAt,
      description,
      variants = [],
      sizes = [],
      variantStock = {},
      isBestSeller = false,
    } = req.body;

    if (
      !id ||
      !name ||
      !category ||
      !priceValue ||
      !createdAt ||
      !description
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const builtVariants = buildVariants({
      variants: variants.map((v) => ({
        ...v,
        category,
      })),
      sizes,
      variantStock,
    });

    const colors = Object.keys(builtVariants);

    const totalStockQuantity = getTotalStockFromVariants(builtVariants);

    const firstVariant = Object.values(builtVariants)[0];
    const thumbnail = firstVariant?.[0]?.images?.[0] || "";

    const details = {
      detailsText: description,
    };

    await db.query(
      `INSERT INTO products (
        id, name, category, price_value, created_at,
        is_best_seller, thumbnail, colors, variants,
        sizes, details, stock_quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        category,
        Number(priceValue),
        createdAt,
        isBestSeller ? 1 : 0,
        thumbnail,
        JSON.stringify(colors),
        JSON.stringify(builtVariants),
        JSON.stringify(sizes),
        JSON.stringify(details),
        totalStockQuantity,
      ],
    );

    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);

    res.status(201).json({ product: mapProductRow(rows[0]) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * UPDATE
 */
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const {
      id,
      name,
      category,
      priceValue,
      createdAt,
      description,
      variants = [],
      sizes = [],
      variantStock = {},
      isBestSeller = false,
    } = req.body;

    const builtVariants = buildVariants({
      variants: variants.map((v) => ({
        ...v,
        category,
      })),
      sizes,
      variantStock,
    });

    const colors = Object.keys(builtVariants);
    const totalStockQuantity = getTotalStockFromVariants(builtVariants);

    const firstVariant = Object.values(builtVariants)[0];
    const thumbnail = firstVariant?.[0]?.images?.[0] || "";

    const details = {
      detailsText: description,
    };

    await db.query(
      `UPDATE products SET
        name = ?, category = ?, price_value = ?, created_at = ?,
        is_best_seller = ?, thumbnail = ?, colors = ?, variants = ?,
        sizes = ?, details = ?, stock_quantity = ?
      WHERE id = ?`,
      [
        name,
        category,
        Number(priceValue),
        createdAt,
        isBestSeller ? 1 : 0,
        thumbnail,
        JSON.stringify(colors),
        JSON.stringify(builtVariants),
        JSON.stringify(sizes),
        JSON.stringify(details),
        totalStockQuantity,
        id,
      ],
    );

    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);

    res.json({ product: mapProductRow(rows[0]) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE
 */
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);

    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
