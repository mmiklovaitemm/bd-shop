import db from "../db.js";

/**
 * Creates product_variants table and migrates existing JSON variant data.
 * Safe to run multiple times — skips migration if rows already exist.
 */
export async function migrateProductVariants() {
  // 1. Create table if not exists
  await db.query(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id VARCHAR(100) NOT NULL,
      color VARCHAR(100) NOT NULL,
      size VARCHAR(100) NOT NULL DEFAULT 'one size',
      stock INT NOT NULL DEFAULT 0,
      images JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_variant (product_id, color, size)
    )
  `);

  // 2. Skip if already populated
  const [[{ count }]] = await db.query(
    "SELECT COUNT(*) as count FROM product_variants"
  );
  if (Number(count) > 0) {
    console.log(
      `[migrate] product_variants already has ${count} rows — skipping.`
    );
    return;
  }

  // 3. Migrate from products.variants JSON
  const [products] = await db.query(
    "SELECT id, variants FROM products WHERE variants IS NOT NULL AND variants != '{}' AND variants != ''"
  );

  let inserted = 0;
  for (const p of products) {
    let variants = {};
    try {
      variants =
        typeof p.variants === "string"
          ? JSON.parse(p.variants)
          : p.variants || {};
    } catch {
      continue;
    }

    for (const [color, colorVariants] of Object.entries(variants)) {
      if (!Array.isArray(colorVariants)) continue;
      for (const v of colorVariants) {
        try {
          await db.query(
            `INSERT IGNORE INTO product_variants
              (product_id, color, size, stock, images)
             VALUES (?, ?, ?, ?, ?)`,
            [
              String(p.id),
              color,
              v.size || "one size",
              Math.max(0, Number(v.stock) || 0),
              JSON.stringify(Array.isArray(v.images) ? v.images : []),
            ]
          );
          inserted++;
        } catch (err) {
          console.error(
            `[migrate] Error for product ${p.id} ${color}/${v.size}:`,
            err.message
          );
        }
      }
    }
  }

  console.log(`[migrate] Done — inserted ${inserted} product_variants rows.`);
}
