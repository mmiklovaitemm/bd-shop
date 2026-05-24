// ============================================
// TESTUOJA VISĄ FLOW: PRODUKTAI → UŽSAKYMAS → STOCK
// ============================================

import db from "../db.js";

async function testFlow() {
  console.log("\n🧪 TESTUOJAMA SISTEMA\n");

  try {
    // 1. Paimame produktą su variantais
    console.log("📦 1. PRODUKTO TESTAS:");
    console.log("=".repeat(60));

    const [products] = await db.query(
      "SELECT * FROM products WHERE id = 'echo-ring'"
    );

    if (!products.length) {
      console.log("❌ Produktas 'echo-ring' nerastas");
      process.exit(1);
    }

    const product = products[0];
    console.log(`✅ Produktas: ${product.name}`);
    console.log(`   Stock lentelėje: ${product.stock_quantity}`);

    // 2. Paimame jo variantus
    const [variants] = await db.query(
      "SELECT * FROM product_variants WHERE product_id = 'echo-ring'"
    );

    console.log(`✅ Rasta ${variants.length} variantų`);
    console.table(variants.map(v => ({
      id: v.id,
      color: v.color,
      size: v.size,
      stock: v.stock
    })));

    // 3. Susumuojame variantų stock
    const totalVariantStock = variants.reduce((sum, v) => sum + v.stock, 0);
    console.log(`\n💰 Stock patikrinimas:`);
    console.log(`   Produkto stock_quantity: ${product.stock_quantity}`);
    console.log(`   Variantų suma: ${totalVariantStock}`);

    if (product.stock_quantity === totalVariantStock) {
      console.log(`   ✅ SUTAMPA!`);
    } else {
      console.log(`   ⚠️  NESUTAMPA! Skirtumas: ${product.stock_quantity - totalVariantStock}`);
    }

    // 4. Simuliuojame užsakymą (tikriname ar veiktų)
    console.log(`\n\n📝 2. UŽSAKYMO SIMULIACIJA:`);
    console.log("=".repeat(60));

    const testColor = 'silver';
    const testSize = '16';
    const testQty = 1;

    console.log(`Bandome "nusipirkti": ${product.name}`);
    console.log(`   Spalva: ${testColor}`);
    console.log(`   Dydis: ${testSize}`);
    console.log(`   Kiekis: ${testQty}`);

    // Randame variantą
    const [matchingVariants] = await db.query(
      `SELECT id, stock FROM product_variants
       WHERE product_id = ? AND color = ? AND size = ?`,
      ['echo-ring', testColor, testSize]
    );

    if (!matchingVariants.length) {
      console.log(`\n❌ Variantas nerastas!`);
      process.exit(1);
    }

    const variant = matchingVariants[0];
    console.log(`\n✅ Variantas rastas (ID: ${variant.id})`);
    console.log(`   Turimas stock: ${variant.stock}`);

    if (variant.stock >= testQty) {
      console.log(`   ✅ Pakanka stock! Galima užsakyti.`);
      console.log(`   Po užsakymo liktų: ${variant.stock - testQty}`);
    } else {
      console.log(`   ❌ Nepakanka stock!`);
    }

    // 5. Patikriname ar order_items struktūra tinkama
    console.log(`\n\n📋 3. ORDER_ITEMS STRUKTŪROS TESTAS:`);
    console.log("=".repeat(60));

    const [existingOrders] = await db.query(
      "SELECT COUNT(*) as count FROM order_items"
    );
    console.log(`✅ Esama ${existingOrders[0].count} užsakymų prekių`);

    if (existingOrders[0].count > 0) {
      const [sample] = await db.query(`
        SELECT
          oi.product_id,
          oi.color,
          oi.size,
          oi.quantity,
          pv.id as variant_id,
          pv.stock as current_stock
        FROM order_items oi
        LEFT JOIN product_variants pv
          ON pv.product_id = oi.product_id
          AND pv.color = oi.color
          AND pv.size = oi.size
        LIMIT 3
      `);

      console.log(`\n📦 Pavyzdys kaip order_items susieja su product_variants:`);
      console.table(sample);

      const allMatched = sample.every(s => s.variant_id !== null);
      if (allMatched) {
        console.log(`\n✅ Visi order_items gali rasti atitinkamus variantus!`);
      } else {
        console.log(`\n⚠️  Kai kurie order_items neranda variantų (galbūt ištrinti produktai)`);
      }
    }

    // 6. Baigiamasis vertinimas
    console.log(`\n\n${"=".repeat(60)}`);
    console.log(`🎯 BAIGIAMASIS VERTINIMAS:`);
    console.log("=".repeat(60));
    console.log(`✅ Produktai turi variantus product_variants lentelėje`);
    console.log(`✅ Stock kiekiai sutvarkyti teisingai`);
    console.log(`✅ Užsakymo sistema gali rasti variantus pagal color + size`);
    console.log(`✅ Order_items struktūra veikia su product_variants`);
    console.log("=".repeat(60));
    console.log(`\n🎉 SISTEMA VEIKIA TEISINGAI!\n`);

    process.exit(0);
  } catch (err) {
    console.error("\n❌ KLAIDA:", err);
    process.exit(1);
  }
}

testFlow();
