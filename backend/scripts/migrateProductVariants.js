import db from "../db.js";

function safeJsonParse(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return fallback;

  try {
    return JSON.parse(trimmed);
  } catch {
    return fallback;
  }
}

function getRandomInt(min, max) {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function isVariantObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray(value.images)
  );
}

function buildVariantLevelStockFromExistingProduct(row) {
  const variantsRaw = safeJsonParse(row.variants, {});
  const sizesRaw = safeJsonParse(row.sizes, []);

  const colors = Object.keys(variantsRaw || {});
  const normalizedSizes =
    Array.isArray(sizesRaw) && sizesRaw.length
      ? sizesRaw.map((size) => String(size).trim()).filter(Boolean)
      : [null];

  const variantPool = [];

  for (const color of colors) {
    const value = variantsRaw[color];

    if (!Array.isArray(value) || !value.length) continue;

    if (isVariantObject(value[0])) {
      return {
        variants: variantsRaw,
        totalStock: value.reduce(
          (sum, item) => sum + Math.max(0, Number(item?.stock) || 0),
          0,
        ),
        alreadyMigrated: true,
      };
    }

    const images = value.map((img) => String(img || "").trim()).filter(Boolean);

    if (!images.length) continue;

    for (const size of normalizedSizes) {
      variantPool.push({
        color,
        size,
        images,
      });
    }
  }

  if (!variantPool.length) {
    return {
      variants: variantsRaw,
      totalStock: Math.max(0, Number(row.stock_quantity) || 0),
      alreadyMigrated: false,
    };
  }

  const shuffled = shuffleArray(variantPool);

  const outOfStockCount =
    shuffled.length <= 1 ? 0 : Math.min(getRandomInt(1, 2), shuffled.length);

  const outOfStockKeys = new Set(
    shuffled
      .slice(0, outOfStockCount)
      .map((item) => `${item.color}__${String(item.size)}`),
  );

  const grouped = {};
  let totalStock = 0;

  for (const item of variantPool) {
    const key = `${item.color}__${String(item.size)}`;
    const stock = outOfStockKeys.has(key) ? 0 : getRandomInt(2, 10);

    totalStock += stock;

    if (!grouped[item.color]) {
      grouped[item.color] = [];
    }

    grouped[item.color].push({
      size: item.size,
      stock,
      images: item.images,
    });
  }

  return {
    variants: grouped,
    totalStock,
    alreadyMigrated: false,
  };
}

async function run() {
  try {
    const [rows] = await db.query(
      "SELECT id, variants, sizes, stock_quantity FROM products",
    );

    let updatedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
      const result = buildVariantLevelStockFromExistingProduct(row);

      if (result.alreadyMigrated) {
        skippedCount += 1;
        console.log(`Skipped already migrated product: ${row.id}`);
        continue;
      }

      await db.query(
        `UPDATE products
         SET variants = ?, stock_quantity = ?
         WHERE id = ?`,
        [JSON.stringify(result.variants), result.totalStock, row.id],
      );

      updatedCount += 1;
      console.log(`Updated product: ${row.id}`);
    }

    console.log(`Done. Updated: ${updatedCount}, skipped: ${skippedCount}`);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
