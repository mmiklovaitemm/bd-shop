import express from "express";
import db from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

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

function hasVariantLevelStockStructure(variants) {
  return Object.values(variants || {}).some(
    (value) =>
      Array.isArray(value) && value.length > 0 && typeof value[0] === "object",
  );
}

function getTotalStockFromVariantStructure(variants = {}) {
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

function increaseVariantStock(variants, color, size, qty) {
  const nextVariants = structuredClone(variants || {});
  const colorKey = String(color || "")
    .trim()
    .toLowerCase();
  const sizeKey = String(size || "").trim();
  const quantity = Math.max(0, Number(qty) || 0);

  if (!colorKey || !sizeKey || quantity <= 0) return nextVariants;

  const actualColorKey = Object.keys(nextVariants).find(
    (k) => k.toLowerCase() === colorKey,
  );
  if (!actualColorKey) return nextVariants;

  const colorVariants = nextVariants[actualColorKey];
  if (!Array.isArray(colorVariants)) return nextVariants;

  const target = colorVariants.find(
    (variant) => String(variant?.size || "").trim() === sizeKey,
  );

  if (!target) return nextVariants;

  target.stock = Math.max(0, Number(target.stock) || 0) + quantity;
  return nextVariants;
}

function decreaseVariantStock(variants, color, size, qty) {
  const nextVariants = structuredClone(variants || {});
  const colorKey = String(color || "")
    .trim()
    .toLowerCase();
  const sizeKey = String(size || "").trim();
  const quantity = Math.max(0, Number(qty) || 0);

  if (!colorKey || !sizeKey || quantity <= 0)
    throw new Error("Invalid variant selection.");

  const actualColorKey = Object.keys(nextVariants).find(
    (k) => k.toLowerCase() === colorKey,
  );
  if (!actualColorKey) throw new Error("Variant color not found.");

  const colorVariants = nextVariants[actualColorKey];
  if (!Array.isArray(colorVariants)) throw new Error("Invalid variants data.");

  const target = colorVariants.find(
    (variant) => String(variant?.size || "").trim() === sizeKey,
  );

  if (!target) throw new Error("Variant size not found.");
  const currentStock = Math.max(0, Number(target.stock) || 0);
  if (currentStock < quantity) throw new Error("Not enough stock.");

  target.stock = currentStock - quantity;
  return nextVariants;
}

// --- ROUTES ---

/** GET ALL ORDERS (ADMIN) */
router.get("/all", requireAdmin, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT * FROM orders ORDER BY created_at DESC`,
    );
    if (!orders.length) return res.json({ orders: [] });

    const [items] = await db.query(
      `SELECT * FROM order_items WHERE order_id IN (?)`,
      [orders.map((o) => o.id)],
    );
    const itemsByOrderId = items.reduce((acc, it) => {
      (acc[it.order_id] ||= []).push(it);
      return acc;
    }, {});

    res.json({
      orders: orders.map((o) => ({ ...o, items: itemsByOrderId[o.id] || [] })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/** GET USER ORDERS */
router.get("/", requireAuth, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.userId],
    );
    if (!orders.length) return res.json({ orders: [] });

    const [items] = await db.query(
      `SELECT * FROM order_items WHERE order_id IN (?)`,
      [orders.map((o) => o.id)],
    );
    const itemsByOrderId = items.reduce((acc, it) => {
      (acc[it.order_id] ||= []).push(it);
      return acc;
    }, {});

    res.json({
      orders: orders.map((o) => ({ ...o, items: itemsByOrderId[o.id] || [] })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/** UPDATE STATUS (ADMIN) */
router.patch("/:id/status", requireAdmin, async (req, res) => {
  let connection;
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

    if (!allowedStatuses.includes(nextStatus))
      return res.status(400).json({ message: "Invalid status." });

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [orderRows] = await connection.query(
      "SELECT id, status FROM orders WHERE id = ? FOR UPDATE",
      [orderId],
    );
    if (!orderRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Order not found." });
    }

    const previousStatus = orderRows[0].status;

    // Jei atšaukiame užsakymą, grąžiname prekes į likutį
    if (previousStatus !== "Canceled" && nextStatus === "Canceled") {
      const [items] = await connection.query(
        "SELECT * FROM order_items WHERE order_id = ?",
        [orderId],
      );
      for (const item of items) {
        const [productRows] = await connection.query(
          "SELECT id, variants, stock_quantity FROM products WHERE id = ? FOR UPDATE",
          [item.product_id],
        );
        if (!productRows.length) continue;

        const product = productRows[0];
        const variants = safeJsonParse(product.variants, {});

        if (
          hasVariantLevelStockStructure(variants) &&
          item.color &&
          item.size
        ) {
          const nextVariants = increaseVariantStock(
            variants,
            item.color,
            item.size,
            item.quantity,
          );
          const nextTotal = getTotalStockFromVariantStructure(nextVariants);
          await connection.query(
            "UPDATE products SET variants = ?, stock_quantity = ? WHERE id = ?",
            [JSON.stringify(nextVariants), nextTotal, product.id],
          );
        } else {
          await connection.query(
            "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
            [item.quantity, product.id],
          );
        }
      }
    }

    await connection.query("UPDATE orders SET status = ? WHERE id = ?", [
      nextStatus,
      orderId,
    ]);
    await connection.commit();

    res.json({ ok: true, status: nextStatus });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
});

/** CREATE ORDER */
router.post("/", requireAuth, async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const userId = req.user.userId;
    const { items, contact, delivery, shipping, payment } = req.body || {};
    const email = String(contact?.email || "")
      .trim()
      .toLowerCase();

    if (!email) throw new Error("Email is required.");
    if (!Array.isArray(items) || items.length === 0)
      throw new Error("Cart is empty.");

    const deliveryType = delivery?.type || "ship";
    const deliveryMethod = delivery?.method || "";
    const paymentType = payment?.type || "card";
    const paymentBank = payment?.bank || null;

    const normalized = [];
    for (const it of items) {
      const productId = it.productId || it.id;
      const [pRows] = await connection.query(
        "SELECT id, name, price_value, stock_quantity, variants FROM products WHERE id = ? FOR UPDATE",
        [productId],
      );
      if (!pRows.length) throw new Error(`Product ${productId} not found.`);

      const p = pRows[0];
      const qty = Math.max(1, Number(it.quantity || it.qty || 1));
      const color = String(it.color || "").trim();
      const size = String(it.size || "").trim();
      const variants = safeJsonParse(p.variants, {});

      if (hasVariantLevelStockStructure(variants)) {
        const nextVariants = decreaseVariantStock(variants, color, size, qty);
        const nextTotal = getTotalStockFromVariantStructure(nextVariants);
        await connection.query(
          "UPDATE products SET variants = ?, stock_quantity = ? WHERE id = ?",
          [JSON.stringify(nextVariants), nextTotal, p.id],
        );
      } else {
        if (p.stock_quantity < qty)
          throw new Error(`Not enough stock for ${p.name}`);
        await connection.query(
          "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
          [qty, p.id],
        );
      }

      normalized.push({
        productId: p.id,
        productName: p.name,
        priceCents: Math.round(Number(p.price_value) * 100),
        qty,
        color: color || null,
        size: size || null,
        imageUrl: it.image || p.thumbnail,
      });
    }

    const itemsTotal = normalized.reduce(
      (sum, i) => sum + i.priceCents * i.qty,
      0,
    );
    const deliveryFee = deliveryType === "pickup" ? 0 : 300;

    const [orderRes] = await connection.query(
      `INSERT INTO orders 
      (user_id, status, total_cents, currency, contact_email, delivery_type, delivery_method, delivery_fee_cents, ship_first_name, ship_last_name, ship_address, ship_city, ship_postal_code, ship_phone, payment_type, payment_bank) 
      VALUES (?, 'Pending', ?, 'EUR', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        itemsTotal + deliveryFee,
        email,
        deliveryType,
        deliveryMethod,
        deliveryFee,
        shipping?.firstName || null,
        shipping?.lastName || null,
        shipping?.address || null,
        shipping?.city || null,
        shipping?.postalCode || null,
        shipping?.phone || null,
        paymentType,
        paymentBank,
      ],
    );

    const orderId = orderRes.insertId;
    const itemValues = normalized.map((i) => [
      orderId,
      i.productId,
      i.productName,
      i.priceCents,
      i.qty,
      i.color,
      i.size,
      i.imageUrl,
    ]);

    await connection.query(
      "INSERT INTO order_items (order_id, product_id, product_name, price_cents, quantity, color, size, image_url) VALUES ?",
      [itemValues],
    );

    await connection.commit();
    res.status(201).json({ ok: true, orderId });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
});

export default router;
