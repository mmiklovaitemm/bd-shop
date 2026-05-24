// ============================================
// MIGRUOJA JSON VARIANTS → product_variants LENTELĘ
// ============================================

import db from "../db.js";

async function migrateToVariantsTable() {
  console.log("\n🚀 PRADEDAMA MIGRACIJA: JSON → product_variants\n");

  try {
    // 1. Paimame visus produktus su variants
    console.log("📊 Skaitomi produktai su variants...");
    const [products] = await db.query(
      "SELECT id, name, colors FROM products WHERE colors IS NOT NULL"
    );

    console.log(`✅ Rasta ${products.length} produktų su variants\n`);

    if (products.length === 0) {
      console.log("ℹ️  Nėra produktų su variants - migracija nereikalinga");
      process.exit(0);
    }

    let totalVariants = 0;
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // 2. Kiekvienam produktui sukuriame variantus
    for (const product of products) {
      console.log(`\n📦 Produktas: ${product.name} (ID: ${product.id})`);

      try {
        // Parsiname JSON variants
        let colors;
        try {
          colors = JSON.parse(product.colors);
        } catch (e) {
          console.log(`   ⚠️  Nepavyko parsinti colors JSON - praleista`);
          skipCount++;
          continue;
        }

        if (!colors || typeof colors !== "object") {
          console.log(`   ⚠️  Tuščias arba neteisingas colors formatas - praleista`);
          skipCount++;
          continue;
        }

        // 3. Einame per kiekvieną spalvą
        let productTotalStock = 0;

        for (const [color, sizesArray] of Object.entries(colors)) {
          if (!Array.isArray(sizesArray)) {
            console.log(`   ⚠️  Spalva "${color}" - neteisingas formatas, praleista`);
            continue;
          }

          // 4. Einame per kiekvieną dydį
          for (const sizeObj of sizesArray) {
            const size = sizeObj.size || null;
            const stock = parseInt(sizeObj.stock) || 0;
            const images = sizeObj.images ? JSON.stringify(sizeObj.images) : null;

            try {
              // Tikriname ar jau egzistuoja toks variantas
              const [existing] = await db.query(
                "SELECT id FROM product_variants WHERE product_id = ? AND color = ? AND size = ?",
                [product.id, color, size]
              );

              if (existing.length > 0) {
                console.log(`   ⚠️  Variantas jau egzistuoja: ${color} / ${size} - praleista`);
                skipCount++;
                // Bet vis tiek pridedame prie stock skaičiavimo
                productTotalStock += stock;
                continue;
              }

              // Įterpiame naują variantą
              await db.query(
                `INSERT INTO product_variants (product_id, color, size, stock, images)
                 VALUES (?, ?, ?, ?, ?)`,
                [product.id, color, size, stock, images]
              );

              console.log(`   ✅ Sukurtas variantas: ${color} / ${size} (stock: ${stock})`);
              successCount++;
              totalVariants++;
              productTotalStock += stock;
            } catch (err) {
              console.error(`   ❌ KLAIDA kuriant variantą ${color}/${size}:`, err.message);
              errorCount++;
            }
          }
        }

        // 5. Atnaujiname produkto stock_quantity
        await db.query(
          "UPDATE products SET stock_quantity = ? WHERE id = ?",
          [productTotalStock, product.id]
        );

        console.log(`   📊 Produkto bendras stock atnaujintas: ${productTotalStock}`);
      } catch (err) {
        console.error(`   ❌ KLAIDA apdorojant produktą:`, err.message);
        errorCount++;
      }
    }

    // 6. Baigiamoji ataskaita
    console.log("\n" + "=".repeat(60));
    console.log("📊 MIGRACIJOS REZULTATAI:");
    console.log("=".repeat(60));
    console.log(`✅ Sėkmingai sukurta: ${successCount} variantų`);
    console.log(`⚠️  Praleista (jau egzistuoja): ${skipCount} variantų`);
    console.log(`❌ Klaidos: ${errorCount}`);
    console.log(`📦 Iš viso apdorota: ${products.length} produktų`);
    console.log("=".repeat(60) + "\n");

    if (successCount > 0) {
      console.log("🎉 MIGRACIJA SĖKMINGAI BAIGTA!\n");
    } else if (skipCount > 0 && errorCount === 0) {
      console.log("ℹ️  Visi variantai jau egzistuoja!\n");
    }

    // 7. Parodome pavyzdį
    console.log("📊 Patikrinimas - pavyzdys iš lentelės:\n");
    const [sample] = await db.query(`
      SELECT pv.id, p.name, pv.color, pv.size, pv.stock
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      LIMIT 5
    `);

    console.table(sample);

    process.exit(0);
  } catch (err) {
    console.error("\n❌ KRITINĖ KLAIDA:", err);
    process.exit(1);
  }
}

// Paleidžiame
migrateToVariantsTable();
