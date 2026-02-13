// src/utils/parsePriceToNumber.js
export default function parsePriceToNumber(price) {
  if (typeof price === "number") return price;

  const str = String(price ?? "").trim();
  const cleaned = str.replace(/[^\d.,-]/g, "").trim();
  if (!cleaned) return 0;

  // "1,299.00" -> remove thousands commas
  if (cleaned.includes(",") && cleaned.includes(".")) {
    const noThousands = cleaned.replace(/,/g, "");
    const n = Number(noThousands);
    return Number.isFinite(n) ? n : 0;
  }

  // "89,49" -> comma decimal
  if (cleaned.includes(",") && !cleaned.includes(".")) {
    const n = Number(cleaned.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
