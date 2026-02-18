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

const DEFAULT_DETAILS_BY_CATEGORY = {
  rings: {
    bandWidthMm: 25,
    weightG: 4.5,
  },
  earrings: {
    dimensions: { heightMm: 25, widthMm: 16.4 },
    weightG: 4.5,
  },
  necklaces: {
    chain: "Curb",
    totalLengthCm: 45,
    adjustableFromCm: 41,
    adjustableToCm: 45,
    weightG: 4.5,
  },
  bracelets: {
    sizes: [
      {
        label: "S/M - 18 cm",
        lines: [
          {
            label: "Total Bracelet Length",
            value: "18.5 cm, adjustable from 16 cm to 18.5 cm",
          },
        ],
        weightG: 2.5,
      },
      {
        label: "M/L - 18 cm",
        lines: [
          {
            label: "Total Bracelet Length",
            value: "21.5 cm, adjustable from 19 cm to 18.5 cm",
          },
        ],
        weightG: 2.9,
      },
    ],
  },
};

const makeProductCode = (id) => {
  const parts = String(id)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const letters =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`
      : parts[0]
        ? parts[0].slice(0, 2)
        : "XX";

  let sum = 0;
  const s = String(id);
  for (let i = 0; i < s.length; i++) sum = (sum + s.charCodeAt(i)) % 100;

  const num = String(sum).padStart(2, "0");

  return `HG34-CT-N4_${letters}${num}`;
};

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
  details = {},

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

  const defaultMetal =
    colors.includes("silver") || colors.some((c) => c.startsWith("soft-"))
      ? colors[0] || "silver"
      : colors.includes("gold")
        ? "gold"
        : colors[0] || "silver";

  const mergedDetails = {
    ...(DEFAULT_DETAILS_BY_CATEGORY[category] || {}),
    ...details,
    metal: details?.metal ?? defaultMetal,
    productCode: details?.productCode ?? makeProductCode(id),
  };

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
    details: mergedDetails,
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
    details: {
      detailsText:
        "This elegant ring features a clear, rectangular-cut stone set on a slim, polished band. Its clean lines and refined proportions highlight the stone’s natural clarity, creating a light, timeless look. Designed for effortless elegance, this piece balances simplicity and sophistication, making it perfect for everyday wear or as a subtle statement for special occasions.",
    },
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
    details: {
      detailsText:
        "This statement ring features a bold, open design with softly hammered surfaces that reflect light in an organic, irregular way. The sculptural form wraps elegantly around the finger, creating a sense of movement and depth. Contemporary yet expressive, this piece is designed to stand out while maintaining a refined, modern aesthetic.",
    },
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
    details: {
      detailsText:
        "This sculptural ring combines a wide, softly hammered band with smooth, rounded loops that wrap around the finger in an open, fluid form. The contrast between textured and polished surfaces creates depth and visual interest, while the bold silhouette remains refined and balanced. Contemporary and expressive, this piece is designed as a statement ring that elevates both everyday and more considered looks.",
    },
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
    details: {
      detailsText:
        "This minimalist ring features softly layered, flowing bands that wrap seamlessly around the finger. Its smooth, polished surface creates a fluid silhouette with a subtle sense of movement and depth. Elegant yet understated, this piece is designed for everyday wear, offering a modern, timeless accent that pairs effortlessly with other jewellery or stands beautifully on its own.",
    },
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
    details: {
      detailsText:
        "This bold ring features a smooth, rounded band with a softly matte finish that highlights its sculptural form. Its clean, minimalist design creates a strong yet refined presence, making it a versatile piece for everyday wear. Timeless and modern, this ring is designed to stand alone or pair effortlessly with other jewellery for a balanced, contemporary look.",
    },
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
    details: {
      detailsText:
        "This modern ring is defined by crisp folds and sculpted edges that create a striking, architectural silhouette. Subtle texture catches the light across the surface, adding depth while keeping the design clean and minimal. Designed to feel contemporary yet timeless, this piece brings a confident accent to everyday styling.",
    },
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
    details: {
      detailsText:
        "This refined ring features a luminous pearl detail set into a slim, polished band, creating a delicate balance of softness and structure. Its minimalist silhouette highlights the natural glow of the pearl, offering an elegant touch without feeling overstated. Perfect for everyday wear or subtle occasions, this piece adds quiet sophistication to any jewellery collection.",
    },
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
    details: {
      detailsText:
        "This ring features a textured, ridged surface that creates a subtle rhythm of light and shadow across the band. Its bold shape feels sculptural yet wearable, combining an organic finish with a clean, modern silhouette. Designed to be worn alone as a statement or stacked with minimal pieces, it brings effortless character to everyday looks.",
    },
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
    details: {
      metal: "gold",
      detailsText:
        "This minimalist ring set features two delicate designs with subtle sculptural details. One ring is accented with a small, drop-shaped charm, while the other features a smooth, elongated element for a clean, modern look. Designed to be worn together or separately, these rings offer versatile styling and a refined, contemporary aesthetic suitable for everyday wear.",
    },
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
    details: {
      detailsText:
        "This delicate ring features a soft square stone set in a sleek, polished frame on a slender band. The warm gold tone enhances the stone’s subtle, milky translucence, creating a calm and elegant look. Minimal yet expressive, this piece is designed for everyday wear, adding a refined touch of warmth and modern simplicity to any jewellery collection.",
    },
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
    details: {
      detailsText:
        "This statement ring features a striking geometric-cut stone set into a bold, sculpted band. The clean, angular setting enhances the stone’s brilliance, while the smooth, polished band adds a sense of strength and balance. Modern and confident in design, this ring is created to stand out, making it a refined statement piece for both everyday wear and special occasions.",
    },
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
    details: {
      detailsText:
        "This sculptural ring is inspired by gentle wave-like curves, creating a smooth silhouette with soft movement around the finger. Its polished finish reflects light subtly, giving the piece a clean, modern feel. Designed to be timeless and easy to style, this ring works beautifully as a solo statement or layered with minimal jewellery for a refined, contemporary look.",
    },
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
    details: {
      metal: "soft-yellow",
      detailsText:
        "These minimalist stud earrings feature soft square silhouettes with gently rounded edges, set with a smooth, light-toned stone. Their clean lines and subtle contrast create a calm, refined look that feels both modern and timeless. Designed for effortless everyday wear, they add a quiet elegance and a touch of softness to any jewellery collection.",
    },
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
    details: {
      detailsText:
        "These refined hoop earrings feature a clean circular silhouette with a polished finish that catches the light in a subtle, elegant way. Their minimal form feels timeless and easy to style, making them an everyday essential. Designed to pair effortlessly with other pieces or stand on their own, they add a modern touch to both casual and elevated looks.",
    },
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
    details: {
      detailsText:
        "These modern earrings feature an organic, open-drop shape suspended from a sleek hoop, creating gentle movement and a sculptural feel. The smooth, polished surface enhances their contemporary silhouette, while the balanced form keeps them refined and wearable. Designed to stand out effortlessly, this piece brings a sophisticated, modern accent to both everyday and elevated looks.",
    },
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
    details: {
      detailsText:
        "These refined drop earrings feature two polished spherical elements suspended from a classic lever-back closure. Their smooth, high-shine finish catches the light beautifully, creating a subtle yet eye-catching movement. Elegant and timeless, they are designed to add a touch of sophistication to both everyday wear and special occasions.",
    },
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
    details: {
      detailsText:
        "These elegant drop earrings feature a smooth, elongated silhouette that gently tapers into a soft teardrop shape. Their polished surface reflects light beautifully, creating subtle movement with every turn. Minimal yet expressive, they are designed to elongate the neckline and add a refined, modern accent to both everyday and evening looks.",
    },
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
    details: {
      detailsText:
        "This delicate necklace pairs a fine chain with a minimal pendant detail that adds a soft point of light at the neckline. Its clean proportions make it ideal for layering, while the subtle texture gives it a refined, contemporary character. Designed to be effortless and versatile, it brings a quiet elegance to everyday styling and more polished occasions.",
    },
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
    details: {
      detailsText:
        "This necklace features a sleek, drop-shaped pendant that falls gracefully along the neckline, creating an elegant elongated silhouette. The smooth, polished finish catches the light softly, keeping the look minimal yet expressive. Designed to be worn alone for a refined statement or layered for depth, it adds a modern touch to both everyday and evening outfits.",
    },
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
    sizes: ["S/M", "M/L"],
    details: {
      detailsText:
        "This bold chain bracelet is crafted from interlinked, polished rings that create a strong yet balanced silhouette. Its smooth, rounded links catch the light beautifully, giving the piece a refined, contemporary feel. Designed to stand out on its own or pair effortlessly with other jewellery, this bracelet adds a modern statement to both everyday and elevated looks.",
      sizeDetails: {
        "S/M": {
          totalLengthText: "18.5 cm, adjustable from 16 cm to 18.5 cm",
          weightG: 2.5,
        },
        "M/L": {
          totalLengthText: "21.5 cm, adjustable from 19 cm to 18.5 cm",
          weightG: 2.9,
        },
      },
    },
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
    sizes: ["S/M", "M/L"],
    details: {
      detailsText:
        "This sculptural chain bracelet features smooth, rounded links designed to feel clean and minimal while still making an impact. Its polished finish reflects light softly, giving the piece a refined, modern character. Easy to style alone or stacked with other jewellery, this bracelet brings a contemporary accent to everyday looks and more elevated outfits.",
      sizeDetails: {
        "S/M": {
          totalLengthText: "18.5 cm, adjustable from 16 cm to 18.5 cm",
          weightG: 2.5,
        },
        "M/L": {
          totalLengthText: "21.5 cm, adjustable from 19 cm to 18.5 cm",
          weightG: 2.9,
        },
      },
    },
  }),

  // ======================
  // PERSONAL
  // ======================
  makeProduct({
    id: "forever-ring",
    category: "personal",
    silver: ["Forever-ring-silver-1.webp", "Forever-ring-silver-2.webp"],
    gold: ["Forever-ring-gold-1.webp", "Forever-ring-gold-2.webp"],
    priceValue: 120,
    createdAt: "2026-02-10",
    hasGem: false,
    surface: "smooth",
    gemstones: [],
    sizes: [15.5, 16, 17.5, 18, 18.5],
    details: {
      detailsText:
        "A bold signet-style ring created for personal engraving. Its smooth surface is perfect for initials, dates, or meaningful symbols.",
      serviceOptions: [
        {
          value: "shipping",
          label: "Shipping kit",
          description:
            "We send you a kit to capture your print. Send it back to us for engraving.",
          priceDelta: 0,
        },
        {
          value: "in_store",
          label: "In-store",
          description: "Visit our store and we’ll take your print on-site.",
          priceDelta: 0,
        },
      ],
    },
  }),

  makeProduct({
    id: "special-ring",
    category: "personal",
    silver: ["Special-ring-silver-1.webp", "Special-ring-silver-2.webp"],
    gold: ["Special-ring-gold-1.webp", "Special-ring-gold-2.webp"],
    priceValue: 110,
    createdAt: "2026-02-11",
    hasGem: false,
    surface: "rough",
    gemstones: [],
    sizes: [15.5, 16, 17.5, 18],
    details: {
      detailsText:
        "A textured ring designed to hold a unique personal imprint. The hammered finish reflects light beautifully while keeping a modern aesthetic.",
      serviceOptions: [
        {
          value: "shipping",
          label: "Shipping kit",
          description:
            "We send you a kit to capture your print. Send it back to us for engraving.",
          priceDelta: 0,
        },
        {
          value: "in_store",
          label: "In-store",
          description: "Visit our store and we’ll take your print on-site.",
          priceDelta: 0,
        },
      ],
    },
  }),

  makeProduct({
    id: "impressa-ring",
    category: "personal",
    silver: ["Impressa-ring-1-silver.webp", "Impressa-ring-2.webp"],
    gold: ["Impressa-ring-1-gold.webp", "Impressa-ring-2.webp"],
    priceValue: 125,
    createdAt: "2026-02-12",
    hasGem: false,
    surface: "smooth",
    gemstones: [],
    sizes: [16, 17.5, 18, 18.5],
    details: {
      detailsText:
        "A refined engraving ring with a clean plate surface. Designed for fingerprint, initials or custom engraving, turning jewellery into a personal story.",
      serviceOptions: [
        {
          value: "shipping",
          label: "Shipping kit",
          description:
            "We send you a kit to capture your print. Send it back to us for engraving.",
          priceDelta: 0,
        },
        {
          value: "in_store",
          label: "In-store",
          description: "Visit our store and we’ll take your print on-site.",
          priceDelta: 0,
        },
      ],
    },
  }),
];
