import mysql from "mysql2/promise";
import PRODUCTS from "../data/products.js";

const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bd_shop",
});

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
      colors,
      variants,
      gemstones,
      sizes,
      details
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

console.log("DONE");
