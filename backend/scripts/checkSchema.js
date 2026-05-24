// ============================================
// PATIKRINA LENTELIŲ STRUKTŪRĄ
// ============================================

import db from "../db.js";

async function checkSchema() {
  console.log("\n🔍 TIKRINAMA LENTELIŲ STRUKTŪRA\n");

  try {
    // 1. Check order_items columns
    console.log("📋 ORDER_ITEMS LENTELĖ:");
    console.log("=".repeat(60));
    const [orderItemsCols] = await db.query("DESCRIBE order_items");
    console.table(orderItemsCols);

    // 2. Check product_variants columns
    console.log("\n📋 PRODUCT_VARIANTS LENTELĖ:");
    console.log("=".repeat(60));
    const [variantsCols] = await db.query("DESCRIBE product_variants");
    console.table(variantsCols);

    // 3. Sample order_items data
    console.log("\n📦 ORDER_ITEMS PAVYZDYS:");
    console.log("=".repeat(60));
    const [items] = await db.query("SELECT * FROM order_items LIMIT 3");
    console.table(items);

    console.log("\n✅ PATIKRINIMAS BAIGTAS!\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ KLAIDA:", err);
    process.exit(1);
  }
}

checkSchema();
