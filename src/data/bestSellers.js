import earthRing1 from "@/assets/images/products/earth-ring-1.png";
import earthRing2 from "@/assets/images/products/earth-ring-2.png";

import cutRing1 from "@/assets/images/products/cut-ring-1.png";
import cutRing2 from "@/assets/images/products/cut-ring-2.png";

import dot1 from "@/assets/images/products/dot-1.png";
import dot2 from "@/assets/images/products/dot-2.png";

import echoRing1 from "@/assets/images/products/echo-ring-1.png";
import echoRing2 from "@/assets/images/products/echo-ring-2.png";

import pureEarrings1 from "@/assets/images/products/pure-earrings-1.png";
import pureEarrings2 from "@/assets/images/products/pure-earrings-2.png";

import stillRing1 from "@/assets/images/products/still-ring-1.png";
import stillRing2 from "@/assets/images/products/still-ring-2.png";

export const BEST_SELLERS = [
  {
    id: "earth-ring",
    name: '"Earth" ring',
    price: "€89.49",
    image: earthRing1,
    variants: {
      silver: [earthRing1, earthRing2],
    },
  },
  {
    id: "cut-ring",
    name: '"Cut" ring',
    price: "€89.49",
    image: cutRing1,
    variants: {
      silver: [cutRing1, cutRing2],
    },
  },
  {
    id: "dot-ring",
    name: '"Dot" necklace',
    price: "€79.90",
    image: dot1,
    variants: {
      silver: [dot1, dot2],
    },
  },
  {
    id: "echo-ring",
    name: '"Echo" rings',
    price: "€84.90",
    image: echoRing1,
    variants: {
      silver: [echoRing1, echoRing2],
    },
  },
  {
    id: "pure-earrings",
    name: '"Pure" earrings',
    price: "€119.90",
    image: pureEarrings1,
    variants: {
      silver: [pureEarrings1, pureEarrings2],
    },
  },
  {
    id: "still-ring",
    name: '"Still" ring',
    price: "€89.90",
    image: stillRing1,
    variants: {
      silver: [stillRing1, stillRing2],
    },
  },
];
