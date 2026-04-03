import mysql from "mysql2/promise";
import PRODUCTS from "../data/products.js";
import dotenv from "dotenv";

dotenv.config();

const connectionUrl =
  process.env.DATABASE_URL || "mysql://root:@localhost:3306/bd_shop";

const db = await mysql.createConnection(connectionUrl);

console.log("Cleaning old products...");
await db.execute("DELETE FROM products");

for (const p of PRODUCTS) {
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
      images,      -- PRIDĖTA: naujas stulpelis
      colors, 
      variants, 
      gemstones, 
      sizes, 
      details
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) -- PRIDĖTAS vienas papildomas ?
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
      JSON.stringify(p.images),
      JSON.stringify(p.colors),
      JSON.stringify(p.variants),
      JSON.stringify(p.gemstones),
      JSON.stringify(p.sizes),
      JSON.stringify(p.details),
    ],
  );

  console.log("Inserted:", p.id);
}

await db.end();
console.log("DONE: All products imported with images!");
