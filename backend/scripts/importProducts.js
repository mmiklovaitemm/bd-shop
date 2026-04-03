import mysql from "mysql2/promise";
import PRODUCTS from "../data/products.js";
import dotenv from "dotenv";

dotenv.config();

const connectionUrl =
  process.env.DATABASE_URL || "mysql://root:@localhost:3306/bd_shop";

const db = await mysql.createConnection(connectionUrl);

console.log("--- VALOMI SENI PRODUKTAI ---");
await db.execute("DELETE FROM products");

for (const p of PRODUCTS) {
  const productImages =
    p.images && p.images.length > 0
      ? p.images
      : Object.values(p.variants || {}).flat();

  await db.execute(
    `
    INSERT INTO products (
      id, 
      name, 
      category, 
      price_value, 
      created_at, 
      is_best_seller, 
      has_gem, 
      surface, 
      thumbnail, 
      images, 
      variants, 
      colors, 
      gemstones, 
      sizes, 
      details
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      p.id,
      p.name,
      p.category,
      p.priceValue,
      p.createdAt,
      p.isBestSeller ? 1 : 0,
      p.hasGem ? 1 : 0,
      p.surface,
      p.thumbnail,
      JSON.stringify(productImages),
      JSON.stringify(p.variants || {}),
      JSON.stringify(p.colors || []),
      JSON.stringify(p.gemstones || []),
      JSON.stringify(p.sizes || []),
      JSON.stringify(p.details || {}),
    ],
  );

  console.log("Sėkmingai įkeltas:", p.id);
}

await db.end();
console.log("--- A ŽINGSNIS BAIGTAS: DUOMENYS ATNAUJINTI ---");
