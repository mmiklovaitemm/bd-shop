export function getMaterialOptions(products, categoryValue) {
  const inCategory = products.filter((p) => p.category === categoryValue);

  const counts = {};
  for (const p of inCategory) {
    for (const c of p.colors) {
      counts[c] = (counts[c] || 0) + 1;
    }
  }

  const order = ["silver", "gold"];
  const entries = Object.entries(counts);

  entries.sort((a, b) => {
    const ai = order.indexOf(a[0]);
    const bi = order.indexOf(b[0]);
    const aRank = ai === -1 ? 999 : ai;
    const bRank = bi === -1 ? 999 : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a[0].localeCompare(b[0]);
  });

  const prettyLabel = (v) => {
    if (v === "silver") return "Silver";
    if (v === "gold") return "Gold";
    if (v === "soft-blue") return "Soft blue";
    if (v === "soft-green") return "Soft green";
    return v;
  };

  return entries.map(([value, count]) => ({
    value,
    label: prettyLabel(value),
    count,
  }));
}
