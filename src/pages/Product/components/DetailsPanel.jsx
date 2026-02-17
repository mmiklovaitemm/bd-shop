import { memo, useMemo } from "react";
import preventDragHandler from "@/utils/preventDrag";
import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";

const COLOR_NAMES = {
  "soft-yellow": "Soft yellow",
  "soft-blue": "Soft blue",
  "soft-green": "Soft green",
  gold: "Gold",
  silver: "Silver",
};

const formatMetal = (value) => {
  if (!value) return "";
  const raw = String(value).toLowerCase().trim();
  return COLOR_NAMES[raw] || raw.charAt(0).toUpperCase() + raw.slice(1);
};

const pickFirst = (...vals) =>
  vals.find((v) => v !== undefined && v !== null && String(v).trim() !== "");

const pickNumber = (...vals) => {
  for (const v of vals) {
    const n =
      typeof v === "number" ? v : Number(String(v ?? "").replace(",", "."));
    if (Number.isFinite(n)) return n;
  }
  return null;
};

const detectCategory = (product) => {
  const raw =
    pickFirst(
      product?.category,
      product?.type,
      product?.collection,
      product?.group,
      product?.slug,
      product?.tags?.[0],
    ) || "";
  const s = String(raw).toLowerCase();

  if (s.includes("ring")) return "rings";
  if (s.includes("bracelet")) return "bracelets";
  if (s.includes("necklace")) return "necklaces";
  if (s.includes("earring")) return "earrings";

  if (s.includes("rings")) return "rings";
  if (s.includes("bracelets")) return "bracelets";
  if (s.includes("necklaces")) return "necklaces";
  if (s.includes("earrings")) return "earrings";

  return "generic";
};

// === DEFAULT TEXTS ===
const CATEGORY_TEXT = {
  rings:
    "This wide band ring features a textured surface inspired by organic forms, creating a subtle play of light and depth. Its bold silhouette is balanced by a refined finish, giving the piece a modern yet timeless character. Designed to be worn alone as a statement or paired with minimal jewellery, this ring adds effortless sophistication to any look.",
  bracelets:
    "This bold chain bracelet is crafted from interlinked, polished rings that create a strong yet balanced silhouette. Its smooth, rounded links catch the light beautifully, giving the piece a refined, contemporary feel. Designed to stand out on its own or pair effortlessly with other jewellery, this bracelet adds a modern statement to both everyday and elevated looks.",
  necklaces:
    "This delicate necklace features a fine chain accented by a sleek, drop-shaped pendant that falls gracefully along the neckline. Its minimalist design highlights clean lines and subtle movement, creating an elegant, elongated silhouette. Perfect for layering or wearing on its own, this piece adds a refined, modern touch to both everyday and evening looks.",
  earrings:
    "These minimalist earrings feature a softly contoured triangular form with a smooth, brushed surface that reflects light in a subtle, elegant way. Their sculptural silhouette adds a modern touch while remaining timeless and easy to style. Designed to complement both everyday looks and more refined outfits, they are a versatile addition to any jewellery collection.",
};

// === DEFAULT VALUES
const CATEGORY_DEFAULTS = {
  rings: {
    bandWidthMm: 25,
    weightG: 4.5,
    productCode: "HG34-CT-N4_LD",
  },
  bracelets: {
    productCode: "HG34-CT-N4_LD",
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
  necklaces: {
    chain: "Curb",
    totalLengthCm: 45,
    adjustableFromCm: 41,
    adjustableToCm: 45,
    weightG: 4.5,
    productCode: "HG34-CT-N4_LD",
  },
  earrings: {
    heightMm: 25,
    widthMm: 16.4,
    weightG: 4.5,
    productCode: "HG34-CT-N4_LD",
  },
};

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <p className="font-ui text-[14px] leading-relaxed text-black">
      <span className="text-black/70">{label}</span>
      <span>{value}</span>
    </p>
  );
}

function SectionTitle({ children }) {
  return (
    <p className="font-ui text-[14px] leading-relaxed text-black/70">
      {children}
    </p>
  );
}

const DetailsContent = memo(function DetailsContent({
  product,
  selectedColor,
  selectedSize,
}) {
  const view = useMemo(() => {
    if (!product) return null;

    const category = detectCategory(product);
    const categoryDefaults = CATEGORY_DEFAULTS[category] || {};

    const detailsObj =
      product.details || product.dimensionsDetails || product.specs || {};

    // Gemstones (from product.details or product.gemstones)
    const gemstonesArr =
      Array.isArray(detailsObj.gemstones) && detailsObj.gemstones.length > 0
        ? detailsObj.gemstones
        : Array.isArray(product.gemstones) && product.gemstones.length > 0
          ? product.gemstones
          : [];

    const gemstonesText = gemstonesArr.length ? gemstonesArr.join(", ") : "";

    const text = pickFirst(
      product.detailsText,
      detailsObj.detailsText,
      detailsObj.text,
      detailsObj.description,
      product.longDescription,
      product.description,
      CATEGORY_TEXT[category],
    );

    // Metal
    const metalRaw = pickFirst(
      selectedColor,
      detailsObj.metal,
      product.metal,
      Array.isArray(product.colors) ? product.colors[0] : null,
    );
    const metal = formatMetal(metalRaw);

    // Product code
    const productCode = pickFirst(
      detailsObj.productCode,
      product.productCode,
      product.sku,
      product.code,
      categoryDefaults.productCode,
      product.id ? `ID-${product.id}` : null, // fallback
    );

    // Common numbers
    const weightG = pickNumber(
      detailsObj.weightG,
      product.weightG,
      detailsObj.weight,
      product.weight,
      categoryDefaults.weightG,
    );

    const bandWidthMm = pickNumber(
      detailsObj.bandWidthMm,
      product.bandWidthMm,
      detailsObj.bandWidth,
      product.bandWidth,
      categoryDefaults.bandWidthMm,
    );

    // Necklace
    const chain = pickFirst(
      detailsObj.chain,
      product.chain,
      categoryDefaults.chain,
    );

    const totalLengthCm = pickNumber(
      detailsObj.totalLengthCm,
      product.totalLengthCm,
      detailsObj.totalLength,
      product.totalLength,
      categoryDefaults.totalLengthCm,
    );

    const adjustableFromCm = pickNumber(
      detailsObj.adjustableFromCm,
      product.adjustableFromCm,
      detailsObj.adjustableFrom,
      product.adjustableFrom,
      categoryDefaults.adjustableFromCm,
    );

    const adjustableToCm = pickNumber(
      detailsObj.adjustableToCm,
      product.adjustableToCm,
      detailsObj.adjustableTo,
      product.adjustableTo,
      categoryDefaults.adjustableToCm,
    );

    // Earrings dimensions
    const dims = detailsObj.dimensions || product.dimensions || {};
    const heightMm = pickNumber(
      dims.heightMm,
      product.heightMm,
      dims.height,
      product.height,
      categoryDefaults.heightMm,
    );
    const widthMm = pickNumber(
      dims.widthMm,
      product.widthMm,
      dims.width,
      product.width,
      categoryDefaults.widthMm,
    );

    const sizeDetailsMap =
      product.sizeDetails || detailsObj.sizeDetails || null;

    return {
      category,
      text: text ? String(text).trim() : "",
      metal,
      productCode,
      weightG,
      bandWidthMm,
      chain,
      totalLengthCm,
      adjustableFromCm,
      adjustableToCm,
      heightMm,
      widthMm,
      sizeDetailsMap,
      gemstonesText,
      selectedSize:
        selectedSize ??
        (Array.isArray(product.sizes) && product.sizes.length > 0
          ? product.sizes[0]
          : null),
    };
  }, [product, selectedColor, selectedSize]);

  if (!view) return null;

  const {
    category,
    text,
    metal,
    productCode,
    weightG,
    bandWidthMm,
    chain,
    totalLengthCm,
    adjustableFromCm,
    adjustableToCm,
    heightMm,
    widthMm,
    sizeDetailsMap,
    selectedSize: activeSize,
    gemstonesText,
  } = view;

  // --- helpers
  const metalLine = metal ? `${metal}` : null;

  const ringBlock = (
    <div className="space-y-2">
      <Row label="Metal - " value={metalLine} />
      <Row
        label="Band width: "
        value={bandWidthMm != null ? `${bandWidthMm} mm` : null}
      />
      <Row label="Weight: " value={weightG != null ? `${weightG} g` : null} />
      <Row label="Gemstone: " value={gemstonesText || null} />
      <Row label="Product Code: " value={productCode} />
    </div>
  );

  const necklaceLengthValue = (() => {
    const hasTotal = totalLengthCm != null;
    const hasAdj = adjustableFromCm != null && adjustableToCm != null;
    if (!hasTotal && !hasAdj) return null;

    const total = hasTotal ? `${totalLengthCm}cm` : "";
    const adj = hasAdj
      ? `, adjustable from ${adjustableFromCm} cm to ${adjustableToCm} cm`
      : "";
    return `${total}${adj}`.trim();
  })();

  const necklaceBlock = (
    <div className="space-y-2">
      <Row label="Metal - " value={metalLine} />
      <Row label="Chain - " value={chain} />
      <Row label="Total Necklace Length: " value={necklaceLengthValue} />
      <Row label="Weight: " value={weightG != null ? `${weightG} g` : null} />
      <Row label="Gemstone: " value={gemstonesText || null} />
      <Row label="Product Code: " value={productCode} />
    </div>
  );

  const earringsBlock = (
    <div className="space-y-2">
      <Row label="Metal - " value={metalLine} />
      {heightMm != null || widthMm != null ? (
        <div className="space-y-1">
          <SectionTitle>Dimensions:</SectionTitle>
          <Row
            label="Height: "
            value={heightMm != null ? `${heightMm} mm` : null}
          />
          <Row
            label="Width: "
            value={widthMm != null ? `${widthMm} mm` : null}
          />
        </div>
      ) : null}
      <Row label="Weight: " value={weightG != null ? `${weightG} g` : null} />
      <Row label="Gemstone: " value={gemstonesText || null} />
      <Row label="Product Code: " value={productCode} />
    </div>
  );

  const renderBraceletSizeBlocks = () => {
    if (sizeDetailsMap && activeSize && sizeDetailsMap[activeSize]) {
      const info = sizeDetailsMap[activeSize] || {};
      const totalText = pickFirst(
        info.totalLengthText,
        info.totalBraceletLength,
        info.totalLength,
      );
      const w = pickNumber(info.weightG, info.weight);

      return (
        <div className="space-y-2">
          <Row label="Size - " value={activeSize} />
          <Row label="Total Bracelet Length: " value={totalText} />
          <Row label="Weight: " value={w != null ? `${w} g` : null} />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Row label="Size - " value={activeSize || "—"} />
      </div>
    );
  };

  const braceletBlock = (
    <div className="space-y-2">
      <Row label="Metal - " value={metalLine} />
      <div className="pt-2">{renderBraceletSizeBlocks()}</div>
      <div className="pt-2">
        <Row label="Gemstone: " value={gemstonesText || null} />
        <Row label="Product Code: " value={productCode} />
      </div>
    </div>
  );

  const genericBlock = (
    <div className="space-y-2">
      <Row label="Metal - " value={metalLine} />
      <Row label="Size - " value={activeSize || "—"} />
      <Row label="Weight: " value={weightG != null ? `${weightG} g` : null} />
      <Row label="Product Code: " value={productCode} />
    </div>
  );

  const block =
    category === "rings"
      ? ringBlock
      : category === "bracelets"
        ? braceletBlock
        : category === "necklaces"
          ? necklaceBlock
          : category === "earrings"
            ? earringsBlock
            : genericBlock;

  return (
    <div className="select-none">
      {text ? (
        <p className="font-ui text-[14px] leading-relaxed text-black/80">
          {text}
        </p>
      ) : null}

      <div className={text ? "mt-6" : ""}>{block}</div>
    </div>
  );
});

const DetailsPanel = memo(function DetailsPanel({
  isOpen,
  onClose,
  product,
  selectedColor,
  selectedSize,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] select-none"
      onDragStart={preventDragHandler}
    >
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <aside className="absolute right-0 top-0 h-full w-[92%] max-w-[520px] bg-white border-l border-black flex flex-col">
        {/* HEADER */}
        <div className="px-6 pt-7 pb-5 border-b border-black shrink-0">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-display text-[24px] leading-[0.95]">
              Dimensions &amp; details
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="group inline-flex items-center gap-2 font-ui text-[14px] text-black/80 transition-transform duration-200 ease-out lg:hover:-translate-y-[2px] active:scale-95"
            >
              <span>Close</span>
              <img
                src={arrowUpRightIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
                onDragStart={preventDragHandler}
                className="h-3 w-3 transition-transform duration-200 ease-out lg:group-hover:translate-x-[1px] lg:group-hover:-translate-y-[1px] select-none"
              />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <DetailsContent
            product={product}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
          />
        </div>
      </aside>
    </div>
  );
});

export default DetailsPanel;
