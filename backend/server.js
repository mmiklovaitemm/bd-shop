// backend/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { requireAuth, requireAdmin } from "./middleware/auth.js";

import db from "./db.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({ storage });

// middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(uploadsDir));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  "http://localhost:5173",
  "http://localhost:4173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

const COOKIE_NAME = "access_token";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: IS_PRODUCTION ? "none" : "lax",
  secure: IS_PRODUCTION,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setAuthCookie(res, payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
}

// test endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

// DB test
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        DATABASE() AS db_name,
        USER() AS db_user,
        @@hostname AS db_host
    `);

    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

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
    Object.entries(variantsRaw || {}).map(([color, images]) => [
      color,
      Array.isArray(images)
        ? images.map((img) => normalizeFrontendAssetUrl(img))
        : [],
    ]),
  );

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    priceValue: Number(row.price_value),
    price: `€${Number(row.price_value)}`,
    createdAt: row.created_at,
    isSoldOut: Boolean(row.is_sold_out),
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

function normalizeImageList(category, list = []) {
  return (list || [])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .map((item) => {
      if (/^https?:\/\//i.test(item)) {
        return item;
      }

      return withBase(`products/${category}/${item}`);
    });
}

app.post(
  "/api/uploads/product-image",
  requireAdmin,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required." });
      }

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

      return res.status(201).json({
        ok: true,
        file: {
          filename: req.file.filename,
          url: fileUrl,
        },
      });
    } catch (err) {
      console.error("Upload image error:", err);
      return res.status(500).json({ message: err.message });
    }
  },
);

// PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows.map(mapProductRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.get("/api/products/:id", async (req, res) => {
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

app.post("/api/products", requireAdmin, async (req, res) => {
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
      isBestSeller = false,
      isSoldOut = false,
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

    const variants = {
      ...(normalizedSilverImages.length
        ? { silver: normalizedSilverImages }
        : {}),
      ...(normalizedGoldImages.length ? { gold: normalizedGoldImages } : {}),
    };

    const colors = Object.keys(variants);

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
        is_sold_out,
        has_gem,
        surface,
        thumbnail,
        colors,
        variants,
        gemstones,
        sizes,
        details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        category,
        Number(priceValue),
        createdAt,
        isBestSeller ? 1 : 0,
        isSoldOut ? 1 : 0,
        0,
        "smooth",
        thumbnail,
        JSON.stringify(colors),
        JSON.stringify(variants),
        JSON.stringify([]),
        JSON.stringify(sizes),
        JSON.stringify(details),
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

app.delete("/api/products/:id", requireAdmin, async (req, res) => {
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

app.put("/api/products/:id", requireAdmin, async (req, res) => {
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
      isBestSeller = false,
      isSoldOut = false,
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

    const [existing] = await db.query(
      "SELECT id FROM products WHERE id = ? LIMIT 1",
      [id],
    );

    if (!existing.length) {
      return res.status(404).json({ message: "Product not found." });
    }

    const normalizedSilverImages = normalizeImageList(category, silverImages);
    const normalizedGoldImages = normalizeImageList(category, goldImages);

    const variants = {
      ...(normalizedSilverImages.length
        ? { silver: normalizedSilverImages }
        : {}),
      ...(normalizedGoldImages.length ? { gold: normalizedGoldImages } : {}),
    };

    const colors = Object.keys(variants);

    const thumbnail =
      normalizedSilverImages[0] || normalizedGoldImages[0] || "";

    const [existingRows] = await db.query(
      "SELECT details FROM products WHERE id = ? LIMIT 1",
      [id],
    );

    let existingDetails = {};

    try {
      existingDetails = existingRows[0]?.details
        ? JSON.parse(existingRows[0].details)
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
           is_sold_out = ?,
           has_gem = ?,
           surface = ?,
           thumbnail = ?,
           colors = ?,
           variants = ?,
           gemstones = ?,
           sizes = ?,
           details = ?
       WHERE id = ?`,
      [
        name,
        category,
        Number(priceValue),
        createdAt,
        isBestSeller ? 1 : 0,
        isSoldOut ? 1 : 0,
        0,
        "smooth",
        thumbnail,
        JSON.stringify(colors),
        JSON.stringify(variants),
        JSON.stringify([]),
        JSON.stringify(sizes),
        JSON.stringify(details),
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

// AUTH - REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is not set." });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [cleanEmail],
    );

    if (existing.length) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const [result] = await db.query(
      "INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)",
      [cleanEmail, passwordHash, firstName || null, lastName || null],
    );

    const user = {
      id: result.insertId,
      email: cleanEmail,
      firstName: firstName || null,
      lastName: lastName || null,
      role: "user",
    };

    setAuthCookie(res, { userId: user.id, role: "user" });

    return res.status(201).json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// AUTH - LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [cleanEmail],
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    setAuthCookie(res, {
      userId: user.id,
      role: user.role || "user",
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role || "user",
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// AUTH - ME
app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await db.query(
      "SELECT id, email, first_name, last_name, role FROM users WHERE id = ? LIMIT 1",
      [userId],
    );

    if (!rows.length) {
      return res.status(401).json({ user: null });
    }

    const user = rows[0];

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.log("Auth error:", err);
    return res.status(401).json({ user: null });
  }
});

// AUTH - LOGOUT
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: COOKIE_OPTIONS.sameSite,
    secure: COOKIE_OPTIONS.secure,
  });
  res.json({ ok: true });
});

// AUTH - CHANGE PASSWORD
app.post("/api/auth/change-password", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required." });
    }

    const [rows] = await db.query(
      "SELECT id, password_hash FROM users WHERE id = ? LIMIT 1",
      [userId],
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const user = rows[0];

    const ok = await bcrypt.compare(
      String(currentPassword),
      user.password_hash,
    );

    if (!ok) {
      return res.status(401).json({ message: "Wrong current password." });
    }

    const newHash = await bcrypt.hash(String(newPassword), 10);

    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      newHash,
      userId,
    ]);

    res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// AUTH - ORDERS
app.get("/api/orders", requireAuth, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT
      id, user_id, created_at, status, total_cents, currency,
      contact_email, delivery_type, delivery_method, delivery_fee_cents,
      ship_country, ship_first_name, ship_last_name, ship_address, ship_apartment,
      ship_city, ship_postal_code, ship_phone,
      payment_type, payment_bank
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [req.user.userId],
    );

    if (!orders.length) {
      return res.json({ orders: [] });
    }

    const orderIds = orders.map((o) => o.id);

    const [items] = await db.query(
      `SELECT id, order_id, product_id, product_name, price_cents, quantity, color, size, service_option, image_url
       FROM order_items
       WHERE order_id IN (?)`,
      [orderIds],
    );

    const itemsByOrderId = items.reduce((acc, it) => {
      (acc[it.order_id] ||= []).push(it);
      return acc;
    }, {});

    const ordersWithItems = orders.map((o) => ({
      ...o,
      items: itemsByOrderId[o.id] || [],
    }));

    return res.json({ orders: ordersWithItems });
  } catch (err) {
    console.log("Orders error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ADMIN - ALL ORDERS
app.get("/api/admin/orders", requireAdmin, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT
        id, user_id, created_at, status, total_cents, currency,
        contact_email, delivery_type, delivery_method, delivery_fee_cents,
        ship_country, ship_first_name, ship_last_name, ship_address, ship_apartment,
        ship_city, ship_postal_code, ship_phone, payment_type, payment_bank
       FROM orders
       ORDER BY created_at DESC`,
    );

    if (!orders.length) {
      return res.json({ orders: [] });
    }

    const orderIds = orders.map((o) => o.id);

    const [items] = await db.query(
      `SELECT
        id, order_id, product_id, product_name, price_cents, quantity,
        color, size, service_option, image_url
       FROM order_items
       WHERE order_id IN (?)`,
      [orderIds],
    );

    const itemsByOrderId = items.reduce((acc, it) => {
      (acc[it.order_id] ||= []).push(it);
      return acc;
    }, {});

    const ordersWithItems = orders.map((o) => ({
      ...o,
      items: itemsByOrderId[o.id] || [],
    }));

    return res.json({ orders: ordersWithItems });
  } catch (err) {
    console.log("Admin orders error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ORDERS - UPDATE STATUS
app.patch("/api/orders/:id/status", requireAdmin, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const nextStatus = String(req.body?.status || "").trim();

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Completed",
      "Canceled",
    ];

    if (!Number.isFinite(orderId) || orderId <= 0) {
      return res.status(400).json({ message: "Invalid order id." });
    }

    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const [result] = await db.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [nextStatus, orderId],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Order not found." });
    }

    const [rows] = await db.query(
      "SELECT id, status FROM orders WHERE id = ? LIMIT 1",
      [orderId],
    );

    return res.json({
      ok: true,
      order: rows[0],
    });
  } catch (err) {
    console.log("Update order status error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ORDERS - CREATE
app.post("/api/orders", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items, contact, delivery, shipping, payment } = req.body || {};
    const email = String(contact?.email || "")
      .trim()
      .toLowerCase();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Valid email is required." });
    }

    const deliveryType = String(delivery?.type || "").trim(); // "ship" | "pickup"
    const deliveryMethodRaw = String(delivery?.method || "")
      .trim()
      .toLowerCase();

    if (!["ship", "pickup"].includes(deliveryType)) {
      return res.status(400).json({ message: "Invalid delivery type." });
    }

    let deliveryMethod = null;

    if (deliveryType === "ship") {
      if (!["lp", "omniva"].includes(deliveryMethodRaw)) {
        return res.status(400).json({ message: "Invalid shipping method." });
      }

      deliveryMethod = deliveryMethodRaw;

      if (!shipping) {
        return res
          .status(400)
          .json({ message: "Shipping information is required." });
      }

      if (!String(shipping.firstName || "").trim()) {
        return res.status(400).json({ message: "First name is required." });
      }

      if (!String(shipping.lastName || "").trim()) {
        return res.status(400).json({ message: "Last name is required." });
      }

      if (!String(shipping.address || "").trim()) {
        return res.status(400).json({ message: "Address is required." });
      }

      if (!String(shipping.city || "").trim()) {
        return res.status(400).json({ message: "City is required." });
      }

      if (!String(shipping.postalCode || "").trim()) {
        return res.status(400).json({ message: "Postal code is required." });
      }

      if (!String(shipping.phone || "").trim()) {
        return res.status(400).json({ message: "Phone is required." });
      }
    }

    if (deliveryType === "pickup") {
      if (!["vilnius", "kaunas"].includes(deliveryMethodRaw)) {
        return res.status(400).json({ message: "Invalid pickup location." });
      }

      deliveryMethod = deliveryMethodRaw;
    }

    const paymentType = String(payment?.type || "")
      .trim()
      .toLowerCase();
    const paymentBankRaw = String(payment?.bank || "")
      .trim()
      .toLowerCase();

    if (!["card", "bank"].includes(paymentType)) {
      return res.status(400).json({ message: "Invalid payment type." });
    }

    let paymentBank = null;

    if (paymentType === "bank") {
      if (!["swedbank", "seb", "luminor", "revolut"].includes(paymentBankRaw)) {
        return res.status(400).json({ message: "Invalid bank selection." });
      }

      paymentBank = paymentBankRaw;
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    const getQty = (it) => {
      const q = Number(it?.quantity ?? it?.qty ?? 1);
      return Number.isFinite(q) && q > 0 ? Math.floor(q) : 1;
    };

    const getProductId = (it) => {
      const direct = it?.productId ?? it?.product_id ?? it?.id;
      if (direct) return String(direct);
      const key = String(it?.key || "");
      return key ? key.split("|")[0] : "";
    };
    const SHIPPING_KIT_FEE_CENTS = 1500;

    const normalized = await Promise.all(
      items.map(async (it) => {
        const productId = getProductId(it);

        const [rows] = await db.query(
          "SELECT id, name, price_value, thumbnail, is_sold_out FROM products WHERE id = ? LIMIT 1",
          [productId],
        );

        const productRow = rows[0];

        if (!productRow) {
          const name =
            it?.product_name ?? it?.title ?? it?.name ?? productId ?? "Unknown";
          throw new Error(`Unknown product in cart: ${name}`);
        }

        if (Number(productRow.is_sold_out) === 1) {
          throw new Error(`Product "${productRow.name}" is sold out.`);
        }

        const qty = getQty(it);

        const serviceOption = String(
          it?.serviceOption ?? it?.service_option ?? "",
        ).trim();

        const isShippingKit = serviceOption === "shipping";

        const basePriceCents = Math.round(
          Number(productRow.price_value || 0) * 100,
        );
        const unitPriceCents =
          basePriceCents + (isShippingKit ? SHIPPING_KIT_FEE_CENTS : 0);

        return {
          productId,
          productName: productRow.name,
          unitPriceCents,
          qty,
          color: it?.color ?? null,
          size: it?.size ?? null,
          serviceOption: serviceOption || null,
          imageUrl: it?.image_url ?? it?.image ?? productRow.thumbnail ?? null,
        };
      }),
    );

    const itemsTotalCents = normalized.reduce(
      (sum, it) => sum + it.unitPriceCents * it.qty,
      0,
    );

    const calcDeliveryFeeCents = ({ type, method }) => {
      if (type === "pickup") return 0;
      if (type !== "ship") return 0;

      if (method === "lp") return 200;
      if (method === "omniva") return 250;

      return 299;
    };

    const deliveryFeeCents = calcDeliveryFeeCents({
      type: deliveryType,
      method: deliveryMethod,
    });

    const totalCents = itemsTotalCents + deliveryFeeCents;

    const status = "Pending";
    const currency = "EUR";

    const [orderResult] = await db.query(
      `INSERT INTO orders
        (user_id, status, total_cents, currency,
         contact_email, delivery_type, delivery_method, delivery_fee_cents,
         ship_country, ship_first_name, ship_last_name, ship_address, ship_apartment,
         ship_city, ship_postal_code, ship_phone, payment_type, payment_bank)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        status,
        totalCents,
        currency,

        email,
        deliveryType,
        deliveryMethod,
        deliveryFeeCents,

        shipping?.country ?? null,
        shipping?.firstName ?? null,
        shipping?.lastName ?? null,
        shipping?.address ?? null,
        shipping?.apartment ?? null,
        shipping?.city ?? null,
        shipping?.postalCode ?? null,
        shipping?.phone ?? null,
        paymentType,
        paymentBank,
      ],
    );

    const orderId = orderResult.insertId;

    const values = normalized.map((it) => [
      orderId,
      it.productId,
      it.productName,
      it.unitPriceCents,
      it.qty,
      it.color,
      it.size,
      it.serviceOption,
      it.imageUrl,
    ]);

    await db.query(
      `INSERT INTO order_items
    (order_id, product_id, product_name, price_cents, quantity, color, size, service_option, image_url)
   VALUES ?`,
      [values],
    );

    return res.status(201).json({ ok: true, orderId });
  } catch (err) {
    console.log("Create order error:", err);
    return res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
