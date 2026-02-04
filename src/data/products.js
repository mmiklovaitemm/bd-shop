// src/data/products.js

const makeTitle = (id) =>
  id
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

const makeProduct = ({
  id,
  category,
  silver = [],
  gold = [],
  extraVariants = {}, // pvz. soft-blue / soft-green
  priceValue = 120,
  isBestSeller = false,
  createdAt = "2026-01-01",
}) => {
  const variants = {
    silver: silver.map((p) => `/products/${category}/${p}`),
    ...(gold.length
      ? { gold: gold.map((p) => `/products/${category}/${p}`) }
      : {}),
    ...Object.fromEntries(
      Object.entries(extraVariants).map(([k, arr]) => [
        k,
        arr.map((p) => `/products/${category}/${p}`),
      ]),
    ),
  };

  const colors = Object.keys(variants); // pvz ["silver","gold"] arba ["silver","soft-blue","soft-green"]

  return {
    id,
    name: makeTitle(id),
    category, // rings | earrings | necklaces | bracelets
    priceValue, // sortingui
    price: `€${priceValue}`, // UI
    createdAt, // sortingui pagal date
    isBestSeller,
    colors,
    variants,
    thumbnail: variants.silver?.[0] ?? Object.values(variants)[0]?.[0] ?? "",
  };
};

export const PRODUCTS = [
  // ======================
  // RINGS
  // ======================
  makeProduct({
    id: "cut-ring",
    category: "rings",
    silver: ["cut-ring-1.png", "cut-ring-2.png"],
    priceValue: 58,
    createdAt: "2026-01-10",
  }),
  makeProduct({
    id: "drift-ring",
    category: "rings",
    silver: ["drift-ring-1.png", "drift-ring-2.png"],
    priceValue: 75,
    createdAt: "2026-01-12",
  }),
  makeProduct({
    id: "earth-ring",
    category: "rings",
    silver: ["earth-ring-1.png", "earth-ring-2.png"],
    gold: ["earth-ring-gold.png"],
    priceValue: 95,
    isBestSeller: true,
    createdAt: "2026-01-05",
  }),
  makeProduct({
    id: "echo-ring",
    category: "rings",
    silver: ["echo-ring-1.png", "echo-ring-2.png"],
    priceValue: 70,
    createdAt: "2026-01-18",
  }),
  makeProduct({
    id: "fluid-ring",
    category: "rings",
    silver: ["fluid-ring-1.png", "fluid-ring-2.png"],
    gold: ["fluid-ring-gold.png"],
    priceValue: 115,
    createdAt: "2026-01-08",
  }),
  makeProduct({
    id: "fold-ring",
    category: "rings",
    silver: ["fold-ring-1.png", "fold-ring-2.png"],
    gold: ["fold-ring-gold.png"],
    priceValue: 105,
    createdAt: "2026-01-15",
  }),
  makeProduct({
    id: "pure-ring",
    category: "rings",
    silver: ["pure-ring-1.png", "pure-ring-2.png"],
    priceValue: 65,
    createdAt: "2026-01-20",
  }),
  makeProduct({
    id: "ridge-ring",
    category: "rings",
    silver: ["ridge-ring-1.png", "ridge-ring-2.png"],
    priceValue: 80,
    createdAt: "2026-01-22",
  }),
  makeProduct({
    id: "stack-ring",
    category: "rings",
    silver: ["stack-ring-1.png", "stack-ring-2.png"],
    priceValue: 75,
    createdAt: "2026-01-25",
  }),
  makeProduct({
    id: "still-ring",
    category: "rings",
    silver: ["still-ring-1.png", "still-ring-2.png"],
    gold: ["still-ring-gold.png"],
    priceValue: 105,
    createdAt: "2026-01-28",
  }),
  makeProduct({
    id: "true-ring",
    category: "rings",
    silver: ["true-ring-1.png", "true-ring-2.png"],
    priceValue: 65,
    createdAt: "2026-01-30",
  }),
  makeProduct({
    id: "wave-ring",
    category: "rings",
    silver: ["wave-ring-1.png", "wave-ring-2.png"],
    gold: ["wave-ring-gold.png"],
    priceValue: 90,
    createdAt: "2026-02-01",
  }),

  // ======================
  // EARRINGS
  // ======================
  makeProduct({
    id: "light-earrings",
    category: "earrings",
    silver: [
      "light-earrings-1.png",
      "light-earrings-2.png",
      "light-earrings-3.png",
    ],
    extraVariants: {
      "soft-blue": [
        "light-earrings-soft-blue-1.png",
        "light-earrings-soft-blue-2.png",
      ],
      "soft-green": [
        "light-earrings-soft-green-1.png",
        "light-earrings-soft-green-2.png",
      ],
    },
    priceValue: 70,
    createdAt: "2026-01-06",
  }),
  makeProduct({
    id: "loop-earrings",
    category: "earrings",
    silver: [
      "loop-earrings-1.png",
      "loop-earrings-2.png",
      "loop-earrings-3.png",
    ],
    priceValue: 80,
    createdAt: "2026-01-14",
  }),
  makeProduct({
    id: "point-earrings",
    category: "earrings",
    silver: [
      "point-earrings-1.png",
      "point-earrings-2.png",
      "point-earrings-3.png",
    ],
    gold: ["point-earrings-gold.png"],
    priceValue: 85,
    createdAt: "2026-01-09",
    isBestSeller: true,
  }),
  makeProduct({
    id: "pure-earrings",
    category: "earrings",
    silver: [
      "pure-earrings-1.png",
      "pure-earrings-2.png",
      "pure-earrings-3.png",
    ],
    gold: ["pure-earrings-gold.png"],
    priceValue: 90,
    createdAt: "2026-01-16",
  }),
  makeProduct({
    id: "sol-earrings",
    category: "earrings",
    silver: ["sol-earrings-1.png", "sol-earrings-2.png", "sol-earrings-3.png"],
    priceValue: 75,
    createdAt: "2026-01-19",
  }),

  // ======================
  // NECKLACES
  // ======================
  makeProduct({
    id: "dot",
    category: "necklaces",
    silver: ["dot-1.png", "dot-2.png"],
    priceValue: 95,
    createdAt: "2026-01-07",
  }),
  makeProduct({
    id: "fall-necklace",
    category: "necklaces",
    silver: ["fall-necklace-1.png", "fall-necklace-2.png"],
    priceValue: 110,
    createdAt: "2026-01-11",
  }),

  // ======================
  // BRACELETS
  // ======================
  makeProduct({
    id: "bond-bracelet",
    category: "bracelets",
    silver: ["bond-bracelet-1.png", "bond-bracelet-2.png"],
    gold: ["bond-bracelet-gold.png"],
    priceValue: 100,
    createdAt: "2026-01-13",
  }),
  makeProduct({
    id: "core-bracelet",
    category: "bracelets",
    silver: ["core-bracelet-1.png", "core-bracelet-2.png"],
    priceValue: 105,
    createdAt: "2026-01-17",
  }),
];
