// src/data/products.js
const makeTitle = (id) =>
  id
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

// (local: "/" | GH Pages: "/bd-shop/")
const withBase = (path) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

const asWebp = (filename) => filename.replace(/\.(png|jpg|jpeg)$/i, ".webp");

const makeProduct = ({
  id,
  category,

  silver = [],
  gold = [],
  extraVariants = {},

  priceValue = 120,
  isBestSeller = false,
  createdAt = "2026-01-01",

  hasGem = false,
  surface = "smooth",
  gemstones = [],

  sizes = [],

  ...customVariants
}) => {
  const mapArr = (arr) =>
    (arr || []).map((p) => withBase(`products/${category}/${asWebp(p)}`));

  const customMapped = Object.fromEntries(
    Object.entries(customVariants)
      .filter(([, arr]) => Array.isArray(arr) && arr.length > 0)
      .map(([k, arr]) => [k, mapArr(arr)]),
  );

  const baseMapped = {
    ...(silver.length ? { silver: mapArr(silver) } : {}),
    ...(gold.length ? { gold: mapArr(gold) } : {}),
  };

  const extraMapped = Object.fromEntries(
    Object.entries(extraVariants).map(([k, arr]) => [k, mapArr(arr)]),
  );

  const variants = {
    ...customMapped,
    ...baseMapped,
    ...extraMapped,
  };

  const colors = Object.keys(variants);

  return {
    id,
    name: makeTitle(id),
    category,
    priceValue,
    price: `€${priceValue}`,
    createdAt,
    isBestSeller,

    colors,
    variants,

    thumbnail:
      Object.values(variants).find((arr) => (arr?.length ?? 0) > 0)?.[0] ?? "",

    hasGem,
    surface,
    gemstones,
    sizes,
  };
};

export const PRODUCTS = [
  // ======================
  // RINGS
  // ======================
  makeProduct({
    id: "cut-ring",
    category: "rings",
    silver: ["cut-ring-1.webp", "cut-ring-2.webp"],
    priceValue: 58,
    createdAt: "2026-01-10",
    hasGem: true,
    surface: "smooth",
    gemstones: ["deimantas"],
    sizes: [15.5, 16, 17.5, 18],
  }),
  makeProduct({
    id: "drift-ring",
    category: "rings",
    silver: ["drift-ring-1.webp", "drift-ring-2.webp"],
    priceValue: 75,
    createdAt: "2026-01-12",
    hasGem: false,
    surface: "rough",
    gemstones: [],
    sizes: [16, 17.5, 18, 18.5],
  }),
  makeProduct({
    id: "earth-ring",
    category: "rings",
    silver: ["earth-ring-1.webp", "earth-ring-2.webp"],
    gold: ["earth-ring-gold.webp", "earth-ring-gold-2.webp"],
    priceValue: 95,
    isBestSeller: true,
    createdAt: "2026-01-05",
    hasGem: false,
    surface: "rough",
    gemstones: [],
    sizes: [15.5, 16, 17.5, 18],
  }),
  makeProduct({
    id: "echo-ring",
    category: "rings",
    silver: ["echo-ring-1.webp", "echo-ring-2.webp"],
    gold: ["echo-ring-gold-1.webp", "echo-ring-gold-2.webp"],
    priceValue: 70,
    createdAt: "2026-01-18",
    hasGem: false,
    surface: "smooth",
    gemstones: [],
    sizes: [15.5, 16, 17.5, 18, 18.5],
  }),
  makeProduct({
    id: "fluid-ring",
    category: "rings",
    silver: ["fluid-ring-1.webp", "fluid-ring-2.webp"],
    gold: ["fluid-ring-gold.webp", "fluid-ring-gold-2.webp"],
    priceValue: 115,
    createdAt: "2026-01-08",
    hasGem: false,
    surface: "smooth",
    gemstones: [],
    sizes: [16, 17.5, 18, 18.5],
  }),
  makeProduct({
    id: "fold-ring",
    category: "rings",
    silver: ["fold-ring-1.webp", "fold-ring-2.webp"],
    gold: ["fold-ring-gold.webp", "fold-ring-gold-2.webp"],
    priceValue: 105,
    createdAt: "2026-01-15",
    hasGem: false,
    surface: "rough",
    gemstones: [],
    sizes: [15.5, 16, 17.5, 18],
  }),
  makeProduct({
    id: "pure-ring",
    category: "rings",
    silver: ["pure-ring-1.webp", "pure-ring-2.webp"],
    priceValue: 65,
    createdAt: "2026-01-20",
    hasGem: true,
    surface: "smooth",
    gemstones: ["perlas"],
    sizes: [15.5, 16, 17.5, 18],
  }),
  makeProduct({
    id: "ridge-ring",
    category: "rings",
    silver: ["ridge-ring-1.webp", "ridge-ring-2.webp"],
    priceValue: 80,
    createdAt: "2026-01-22",
    hasGem: false,
    surface: "rough",
    gemstones: [],
    sizes: [16, 17.5, 18, 18.5],
  }),
  makeProduct({
    id: "stack-ring",
    category: "rings",
    silver: [],
    gold: ["stack-ring-1.webp", "stack-ring-2.webp"],
    priceValue: 75,
    createdAt: "2026-01-25",
    hasGem: false,
    surface: "smooth",
    gemstones: [],
    sizes: [15.5, 16, 17.5, 18, 18.5],
  }),
  makeProduct({
    id: "still-ring",
    category: "rings",
    silver: ["still-ring-1.webp", "still-ring-2.webp"],
    gold: ["still-ring-gold.webp", "still-ring-gold-color-2.webp"],
    priceValue: 105,
    createdAt: "2026-01-28",
    hasGem: false,
    surface: "smooth",
    gemstones: [],
    sizes: [16, 17.5, 18, 18.5],
  }),
  makeProduct({
    id: "true-ring",
    category: "rings",
    silver: ["true-ring-1.webp", "true-ring-2.webp"],
    priceValue: 65,
    createdAt: "2026-01-30",
    hasGem: true,
    surface: "smooth",
    gemstones: ["kristolas"],
    sizes: [15.5, 16, 17.5, 18],
  }),
  makeProduct({
    id: "wave-ring",
    category: "rings",
    silver: ["wave-ring-1.webp", "wave-ring-2.webp"],
    gold: ["wave-ring-gold.webp", "wave-ring-gold-2.webp"],
    priceValue: 90,
    createdAt: "2026-02-01",
    hasGem: false,
    surface: "smooth",
    gemstones: [],
    sizes: [15.5, 16, 17.5, 18, 18.5],
  }),

  // ======================
  // EARRINGS
  // ======================
  makeProduct({
    id: "light-earrings",
    category: "earrings",
    "soft-yellow": [
      "light-earrings-1.webp",
      "light-earrings-3.webp",
      "light-earrings-2.webp",
    ],
    extraVariants: {
      "soft-blue": [
        "light-earrings-soft-blue-1.webp",
        "light-earrings-soft-blue-2.webp",
      ],
      "soft-green": [
        "light-earrings-soft-green-1.webp",
        "light-earrings-soft-green-2.webp",
      ],
    },
    priceValue: 70,
    createdAt: "2026-01-06",
    hasGem: true,
    surface: "smooth",
    gemstones: ["kristolas", "cirkonis", "perlas"],
    sizes: [],
  }),
  makeProduct({
    id: "loop-earrings",
    category: "earrings",
    silver: [
      "loop-earrings-1.webp",
      "loop-earrings-2.webp",
      "loop-earrings-3.webp",
    ],
    priceValue: 80,
    createdAt: "2026-01-14",
    hasGem: false,
    surface: "smooth",
    gemstones: [],
    sizes: [],
  }),
  makeProduct({
    id: "point-earrings",
    category: "earrings",
    silver: [
      "point-earrings-1.webp",
      "point-earrings-2.webp",
      "point-earrings-3.webp",
    ],
    gold: ["point-earrings-gold.webp", "point-earrings-gold-2.webp"],
    priceValue: 85,
    createdAt: "2026-01-09",
    isBestSeller: true,
    hasGem: false,
    surface: "smooth",
    gemstones: [],
    sizes: [],
  }),
  makeProduct({
    id: "pure-earrings",
    category: "earrings",
    silver: [
      "pure-earrings-1.webp",
      "pure-earrings-2.webp",
      "pure-earrings-3.webp",
    ],
    gold: ["pure-earrings-gold.webp", "pure-earrings-gold-2.webp"],
    priceValue: 90,
    createdAt: "2026-01-16",
    hasGem: false,
    surface: "smooth",
    gemstones: [],
    sizes: [],
  }),
  makeProduct({
    id: "sol-earrings",
    category: "earrings",
    silver: [
      "sol-earrings-1.webp",
      "sol-earrings-2.webp",
      "sol-earrings-3.webp",
    ],
    priceValue: 75,
    createdAt: "2026-01-19",
    hasGem: false,
    surface: "smooth",
    gemstones: [],
    sizes: [],
  }),

  // ======================
  // NECKLACES
  // ======================
  makeProduct({
    id: "dot-necklace",
    category: "necklaces",
    silver: ["dot-silver-1.webp", "dot-silver-2.webp"],
    gold: ["dot-1.webp", "dot-2.webp"],
    priceValue: 95,
    createdAt: "2026-01-07",
    isBestSeller: true,
    hasGem: true,
    surface: "rough",
    gemstones: ["cirkonis"],
    sizes: [],
  }),
  makeProduct({
    id: "fall-necklace",
    category: "necklaces",
    silver: ["fall-necklace-1.webp", "fall-necklace-2.webp"],
    priceValue: 110,
    createdAt: "2026-01-11",
    hasGem: false,
    surface: "smooth",
    gemstones: [],
    sizes: [],
  }),

  // ======================
  // BRACELETS
  // ======================
  makeProduct({
    id: "bond-bracelet",
    category: "bracelets",
    silver: ["bond-bracelet-1.webp", "bond-bracelet-2.webp"],
    gold: ["bond-bracelet-gold.webp", "bond-bracelet-gold-2.webp"],
    priceValue: 100,
    createdAt: "2026-01-13",
    hasGem: false,
    surface: "smooth",
    gemstones: [],
    sizes: [],
  }),
  makeProduct({
    id: "core-bracelet",
    category: "bracelets",
    silver: ["core-bracelet-1.webp", "core-bracelet-2.webp"],
    gold: ["core-bracelet-gold-1.webp", "core-bracelet-gold-2.webp"],
    priceValue: 105,
    createdAt: "2026-01-17",
    hasGem: false,
    surface: "smooth",
    gemstones: [],
    sizes: [],
  }),
];
