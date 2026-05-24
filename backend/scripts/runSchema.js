// ============================================
// PALEIDŽIA schema.sql Railway duomenų bazėje
// ============================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lentelių sąrašas
const TABLES = [
  "users",
  "products",
  "product_variants",
  "orders",
  "order_items",
  "favorites",
];

async function runSchema() {
  console.log("\n🚀 PALEIDŽIAMA DUOMENŲ BAZĖS SCHEMA\n");

  try {
    // 1. Skaitome schema.sql failą
    const schemaPath = path.join(__dirname, "..", "schema.sql");
    console.log("📄 Skaitomas failas:", schemaPath);

    if (!fs.existsSync(schemaPath)) {
      console.error("❌ KLAIDA: schema.sql failas nerastas!");
      console.error("   Tikėtasi: " + schemaPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(schemaPath, "utf8");
    console.log("✅ Failas nuskaitytas (" + sql.length + " simbolių)\n");

    // 2. Išskaidome pagal kiekvieną CREATE TABLE
    const regex = /CREATE TABLE IF NOT EXISTS (\w+)\s*\([^;]+;/gis;
    const matches = [...sql.matchAll(regex)];

    console.log(`📊 Rasta ${matches.length} CREATE TABLE komandų\n`);

    if (matches.length === 0) {
      console.error("❌ KLAIDA: Nerasta CREATE TABLE komandų!");
      console.error("   Patikrinkite schema.sql formato teisingumą.");
      process.exit(1);
    }

    // 3. Vykdome kiekvieną komandą
    let success = 0;
    let skipped = 0;

    for (const match of matches) {
      const statement = match[0];
      const tableName = match[1];

      try {
        console.log(`🔨 Kuriama lentelė: ${tableName}...`);

        await db.query(statement);

        console.log(`   ✅ Sėkmingai sukurta: ${tableName}\n`);
        success++;
      } catch (err) {
        // Jei lentelė jau egzistuoja - tai OK
        if (err.message.includes("already exists")) {
          console.log(`   ⚠️  Lentelė jau egzistuoja - praleista\n`);
          skipped++;
        } else {
          console.error(`   ❌ KLAIDA:`, err.message);
        }
      }
    }

    // 4. Baigiamoji ataskaita
    console.log("=".repeat(60));
    console.log("📊 REZULTATAI:");
    console.log("=".repeat(60));
    console.log(`✅ Sėkmingai sukurta: ${success} lentelių`);
    console.log(`⚠️  Praleista (jau egzistuoja): ${skipped} lentelių`);
    console.log("=".repeat(60) + "\n");

    if (success > 0) {
      console.log("🎉 SCHEMA SĖKMINGAI PALEISTA!\n");
    } else if (skipped > 0) {
      console.log("ℹ️  Visos lentelės jau egzistuoja!\n");
    }

    process.exit(0);
  } catch (err) {
    console.error("\n❌ KRITINĖ KLAIDA:", err);
    process.exit(1);
  }
}

// Paleidžiame
runSchema();
