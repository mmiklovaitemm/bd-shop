// ============================================
// PATIKRINA AR MIGRACIJA PAVYKO
// ============================================

import db from "../db.js";

async function checkMigration() {
  console.log("\n🔍 TIKRINAMA MIGRACIJA\n");

  try {
    // 1. Kiek variantų sukurta?
    console.log("📊 PRODUCT_VARIANTS LENTELĖ:");
    console.log("=".repeat(60));

    const [countResult] = await db.query(
      "SELECT COUNT(*) as total FROM product_variants"
    );
    console.log(`✅ Iš viso variantų: ${countResult[0].total}\n`);

    // 2. Pavyzdžiai
    console.log("📦 PAVYZDŽIAI (pirmi 10 variantų):");
    console.log("=".repeat(60));
    const [variants] = await db.query(`
      SELECT
        pv.id,
        p.name as produktas,
        pv.color as spalva,
        pv.size as dydis,
        pv.stock
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      ORDER BY p.name, pv.color, pv.size
      LIMIT 10
    `);
    console.table(variants);

    // 3. Stock patikrinimas
    console.log("\n💰 STOCK PATIKRINIMAS:");
    console.log("=".repeat(60));
    const [stockCheck] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.stock_quantity as produkto_stock,
        COALESCE(SUM(pv.stock), 0) as variantu_stock,
        CASE
          WHEN p.stock_quantity = COALESCE(SUM(pv.stock), 0) THEN '✅ SUTAMPA'
          ELSE '❌ NESUTAMPA'
        END as patikrinimas
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      GROUP BY p.id, p.name, p.stock_quantity
      ORDER BY p.name
      LIMIT 15
    `);
    console.table(stockCheck);

    // 4. Produktai be variantų
    console.log("\n⚠️  PRODUKTAI BE VARIANTŲ:");
    console.log("=".repeat(60));
    const [noVariants] = await db.query(`
      SELECT
        p.id,
        p.name,
        p.stock_quantity
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE pv.id IS NULL
      LIMIT 10
    `);

    if (noVariants.length > 0) {
      console.table(noVariants);
      console.log(`\n⚠️  Rasta ${noVariants.length} produktų be variantų`);
    } else {
      console.log("✅ Visi produktai turi variantus!\n");
    }

    // 5. Statistika pagal spalvas
    console.log("\n🎨 STATISTIKA PAGAL SPALVAS:");
    console.log("=".repeat(60));
    const [colorStats] = await db.query(`
      SELECT
        color as spalva,
        COUNT(*) as kiekis,
        SUM(stock) as bendras_stock
      FROM product_variants
      GROUP BY color
      ORDER BY kiekis DESC
    `);
    console.table(colorStats);

    // 6. Produktai su daugiausiai variantų
    console.log("\n🏆 TOP 5 PRODUKTAI SU DAUGIAUSIAI VARIANTŲ:");
    console.log("=".repeat(60));
    const [topProducts] = await db.query(`
      SELECT
        p.name as produktas,
        COUNT(pv.id) as variantu_skaicius,
        SUM(pv.stock) as bendras_stock
      FROM products p
      JOIN product_variants pv ON p.id = pv.product_id
      GROUP BY p.id, p.name
      ORDER BY variantu_skaicius DESC
      LIMIT 5
    `);
    console.table(topProducts);

    console.log("\n" + "=".repeat(60));
    console.log("✅ PATIKRINIMAS BAIGTAS!");
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (err) {
    console.error("\n❌ KLAIDA:", err);
    process.exit(1);
  }
}

checkMigration();
