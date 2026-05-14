import express from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Create table if it doesn't exist (product_id is VARCHAR to support string IDs)
await db.query(`
  CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_favorite (user_id, product_id)
  )
`);

// Migrate existing INT column to VARCHAR if needed
try {
  await db.query(`
    ALTER TABLE favorites MODIFY COLUMN product_id VARCHAR(100) NOT NULL
  `);
} catch {
  // already VARCHAR or table doesn't exist yet — ignore
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT product_id FROM favorites WHERE user_id = ?",
      [req.user.userId],
    );
    res.json({ favoriteIds: rows.map((r) => r.product_id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const productId = String(req.body?.productId || "").trim();
    if (!productId) return res.status(400).json({ message: "Invalid productId." });

    await db.query(
      "INSERT IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)",
      [req.user.userId, productId],
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:productId", requireAuth, async (req, res) => {
  try {
    const productId = String(req.params.productId || "").trim();
    if (!productId) return res.status(400).json({ message: "Invalid productId." });

    await db.query(
      "DELETE FROM favorites WHERE user_id = ? AND product_id = ?",
      [req.user.userId, productId],
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
