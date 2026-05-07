import express from "express";
import db from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// --- ROUTES ---

/** GET ALL ORDERS (ADMIN) */
router.get("/all", requireAdmin, async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    if (!orders.length) return res.json({ orders: [] });

    const [items] = await db.query(
      "SELECT * FROM order_items WHERE order_id IN (?)",
      [orders.map((o) => o.id)]
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
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.userId]
    );
    if (!orders.length) return res.json({ orders: [] });

    const [items] = await db.query(
      "SELECT * FROM order_items WHERE order_id IN (?)",
      [orders.map((o) => o.id)]
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

/** UPDATE ORDER STATUS (ADMIN) */
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
      [orderId]
    );
    if (!orderRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Order not found." });
    }

    const previousStatus = orderRows[0].status;

    // Restore stock when canceling a non-canceled order
    if (previousStatus !== "Canceled" && nextStatus === "Canceled") {
      const [items] = await connection.query(
        "SELECT * FROM order_items WHERE order_id = ?",
        [orderId]
      );

      for (const item of items) {
        const color = String(item.color || "").trim().toLowerCase();
        const size = String(item.size || "one size").trim();

        // Restore stock in product_variants
        await connection.query(
          `UPDATE product_variants
           SET stock = stock + ?
           WHERE product_id = ? AND color = ? AND size = ?`,
          [item.quantity, String(item.product_id), color, size]
        );

        // Keep products.stock_quantity in sync
        await connection.query(
          "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
          [item.quantity, item.product_id]
        );
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
      const qty = Math.max(1, Number(it.quantity || it.qty || 1));
      const color = String(it.color || "").trim().toLowerCase();
      const size = String(it.size || "one size").trim();

      // Lock the product row
      const [pRows] = await connection.query(
        "SELECT id, name, price_value FROM products WHERE id = ? FOR UPDATE",
        [productId]
      );
      if (!pRows.length) throw new Error(`Product ${productId} not found.`);
      const p = pRows[0];

      // Lock the specific variant row in product_variants
      const [vRows] = await connection.query(
        `SELECT id, stock FROM product_variants
         WHERE product_id = ? AND color = ? AND size = ?
         FOR UPDATE`,
        [String(productId), color, size]
      );

      if (!vRows.length) {
        throw new Error(
          `Variant not found for "${p.name}" (${color} / ${size}).`
        );
      }
      if (vRows[0].stock < qty) {
        throw new Error(`Not enough stock for "${p.name}" (${color} / ${size}).`);
      }

      // Deduct stock from product_variants
      await connection.query(
        "UPDATE product_variants SET stock = stock - ? WHERE id = ?",
        [qty, vRows[0].id]
      );

      // Keep products.stock_quantity in sync
      await connection.query(
        "UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?",
        [qty, productId]
      );

      normalized.push({
        productId: p.id,
        productName: p.name,
        priceCents: Math.round(Number(p.price_value) * 100),
        qty,
        color: color || null,
        size: size || null,
        imageUrl: it.image || null,
      });
    }

    const itemsTotal = normalized.reduce(
      (sum, i) => sum + i.priceCents * i.qty,
      0
    );
    const deliveryFee = deliveryType === "pickup" ? 0 : 300;

    const [orderRes] = await connection.query(
      `INSERT INTO orders
       (user_id, status, total_cents, currency, contact_email,
        delivery_type, delivery_method, delivery_fee_cents,
        ship_first_name, ship_last_name, ship_address, ship_city,
        ship_postal_code, ship_phone, payment_type, payment_bank)
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
      ]
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
      [itemValues]
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
