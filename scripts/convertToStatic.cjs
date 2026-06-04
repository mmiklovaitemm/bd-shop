// Run: node scripts/convertToStatic.cjs
const fs = require("fs");
const path = require("path");

const jsonPath = path.join(__dirname, "../products_backup.json");
const outPath = path.join(__dirname, "../src/data/products.js");

if (!fs.existsSync(jsonPath)) {
  console.error("products_backup.json not found!");
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
const products = Array.isArray(raw) ? raw : raw.products || [];

console.log(`Converting ${products.length} products...`);

const content = `// Auto-generated static product data
export const PRODUCTS = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync(outPath, content, "utf-8");
console.log(`Written to ${outPath}`);
