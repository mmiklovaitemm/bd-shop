// backend/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

import products from "./data/products.js";
import db from "./db.js";

const app = express();

// middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// CORS (cookies require credentials: true)
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

const COOKIE_NAME = "access_token";
const productById = new Map(products.map((p) => [String(p.id), p]));

function setAuthCookie(res, payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // local dev
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// test endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

// DB test
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS ok");
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// PRODUCTS
app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;

  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  res.json(product);
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

    setAuthCookie(res, { userId: user.id });

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

    setAuthCookie(res, { userId: user.id });

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
app.get("/api/auth/me", async (req, res) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({ user: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await db.query(
      "SELECT id, email, first_name, last_name, role FROM users WHERE id = ? LIMIT 1",
      [decoded.userId],
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
    sameSite: "lax",
    secure: false,
  });
  res.json({ ok: true });
});

// AUTH - CHANGE PASSWORD
app.post("/api/auth/change-password", async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "Unauthorized." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required." });
    }

    const [rows] = await db.query(
      "SELECT id, password_hash FROM users WHERE id = ? LIMIT 1",
      [decoded.userId],
    );
    if (!rows.length) return res.status(401).json({ message: "Unauthorized." });

    const user = rows[0];
    const ok = await bcrypt.compare(
      String(currentPassword),
      user.password_hash,
    );
    if (!ok)
      return res.status(401).json({ message: "Wrong current password." });

    const newHash = await bcrypt.hash(String(newPassword), 10);
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      newHash,
      user.id,
    ]);

    res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// AUTH - UPDATE PROFILE
app.patch("/api/auth/profile", async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "Unauthorized." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { firstName, lastName } = req.body || {};

    const cleanFirst = firstName ? String(firstName).trim() : null;
    const cleanLast = lastName ? String(lastName).trim() : null;

    await db.query(
      "UPDATE users SET first_name = ?, last_name = ? WHERE id = ?",
      [cleanFirst, cleanLast, decoded.userId],
    );

    const [rows] = await db.query(
      "SELECT id, email, first_name, last_name FROM users WHERE id = ? LIMIT 1",
      [decoded.userId],
    );

    const user = rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// AUTH - ORDERS
app.get("/api/orders", async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ orders: [] });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
      [decoded.userId],
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
app.get("/api/admin/orders", async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ orders: [] });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await db.query(
      "SELECT id, role FROM users WHERE id = ? LIMIT 1",
      [decoded.userId],
    );

    if (!users.length || users[0].role !== "admin") {
      return res.status(403).json({ message: "Forbidden." });
    }

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
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "Unauthorized." });

    jwt.verify(token, process.env.JWT_SECRET);

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
app.post("/api/orders", async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "Unauthorized." });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is not set." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

    const normalized = items.map((it) => {
      const productId = getProductId(it);
      const product = productById.get(productId);

      if (!product) {
        const name =
          it?.product_name ?? it?.title ?? it?.name ?? productId ?? "Unknown";
        throw new Error(`Unknown product in cart: ${name}`);
      }

      const qty = getQty(it);

      const serviceOption = String(
        it?.serviceOption ?? it?.service_option ?? "",
      ).trim();

      const isShippingKit = serviceOption === "shipping";

      const basePriceCents = Math.round(Number(product.priceValue || 0) * 100);
      const unitPriceCents =
        basePriceCents + (isShippingKit ? SHIPPING_KIT_FEE_CENTS : 0);

      return {
        productId,
        productName: product.name,
        unitPriceCents,
        qty,
        color: it?.color ?? null,
        size: it?.size ?? null,
        serviceOption: serviceOption || null,
        imageUrl: it?.image_url ?? it?.image ?? product.thumbnail ?? null,
      };
    });

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
        decoded.userId,
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
