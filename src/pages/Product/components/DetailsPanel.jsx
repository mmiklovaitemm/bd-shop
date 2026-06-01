import { memo, useMemo } from "react";
import useLanguage from "@/context/useLanguage";
import preventDragHandler from "@/utils/preventDrag";
import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";

/**
Selection helpers for flexible data structures
 */
const pickFirst = (...vals) =>
  vals.find((v) => v !== undefined && v !== null && String(v).trim() !== "");

const pickNumber = (...vals) => {
  for (const v of vals) {
    if (v === undefined || v === null || v === "") continue;
    const n =
      typeof v === "number" ? v : Number(String(v ?? "").replace(",", "."));
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return null;
};

/**
Logic to identify product category based on various fields
 */
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
  return "generic";
};

/**
Formatting helpers for labels and metals
 */
const toTitleCaseLabel = (value) =>
  String(value || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatMetal = (value, t) => {
  if (!value) return "";
  const raw = String(value).toLowerCase().trim();
  const colorNames = {
    "soft-yellow": t.product.detailsPanel.metals.softYellow,
    "soft-blue": t.product.detailsPanel.metals.softBlue,
    "soft-green": t.product.detailsPanel.metals.softGreen,
    gold: t.product.detailsPanel.metals.gold,
    silver: t.product.detailsPanel.metals.silver,
    pearl: t.perlas,
  };
  return colorNames[raw] || toTitleCaseLabel(raw);
};

const getDefaultCategoryText = (category, t) => {
  const texts = {
    rings: t.product.detailsPanel.defaultTexts.rings,
    bracelets: t.product.detailsPanel.defaultTexts.bracelets,
    necklaces: t.product.detailsPanel.defaultTexts.necklaces,
    earrings: t.product.detailsPanel.defaultTexts.earrings,
  };
  return texts[category] || "";
};

/**
UI Components for data rows
 */
function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <p className="font-ui text-[14px] leading-relaxed text-black">
      <span className="text-black/70">{label} </span>
      <span>{value}</span>
    </p>
  );
}

function SectionTitle({ children }) {
  return (
    <p className="font-ui text-[14px] leading-relaxed text-black/70 font-medium">
      {children}
    </p>
  );
}

const DetailsContent = memo(function DetailsContent({
  product,
  selectedColor,
  selectedSize,
}) {
  const { t } = useLanguage();

  const view = useMemo(() => {
    if (!product) return null;

    const baseCategory = detectCategory(product);
    const detailsObj =
      product.details || product.dimensionsDetails || product.specs || {};

    const personalType = pickFirst(
      detailsObj.personalType,
      product.personalType,
    );

    // specific category
    const category =
      baseCategory === "personal"
        ? personalType === "necklace"
          ? "necklaces"
          : personalType === "bracelet"
            ? "bracelets"
            : "rings"
        : baseCategory;

    // Gemstones parsing
    const gemstonesArr = Array.isArray(detailsObj.gemstones)
      ? detailsObj.gemstones
      : [];
    const gemstonesText = gemstonesArr.length
      ? gemstonesArr.join(", ")
      : pickFirst(detailsObj.metal === "Pearl" ? "Pearl" : null);

    // Description text resolution - always use translation based on category
    const text = getDefaultCategoryText(category, t);

    const metalRaw = pickFirst(
      detailsObj.metal,
      selectedColor,
      product.metal,
      Array.isArray(product.colors) ? product.colors[0] : null,
    );

    return {
      category,
      text: text ? String(text).trim() : "",
      metal: formatMetal(metalRaw, t),
      productCode: pickFirst(
        detailsObj.productCode,
        product.productCode,
        `ID-${product.id}`,
      ),
      weightG: pickNumber(
        detailsObj.weightG,
        product.weightG,
        detailsObj.weight,
      ),
      bandWidthMm: pickNumber(
        detailsObj.bandWidthMm,
        product.bandWidthMm,
        detailsObj.bandWidth,
      ),
      chain: pickFirst(detailsObj.chain, product.chain),
      totalLengthCm: pickNumber(
        detailsObj.totalLengthCm,
        product.totalLengthCm,
        detailsObj.totalLength,
      ),
      adjustableFromCm: pickNumber(
        detailsObj.adjustableFromCm,
        product.adjustableFromCm,
      ),
      adjustableToCm: pickNumber(
        detailsObj.adjustableToCm,
        product.adjustableToCm,
      ),
      braceletLengthCm: pickNumber(
        detailsObj.braceletLengthCm,
        detailsObj.totalBraceletLengthCm,
        product.braceletLengthCm,
      ),
      heightMm: pickNumber(detailsObj.dimensions?.heightMm, product.heightMm),
      widthMm: pickNumber(detailsObj.dimensions?.widthMm, product.widthMm),
      sizeDetailsMap: product.sizeDetails || detailsObj.sizeDetails || null,
      gemstonesText,
      selectedSize:
        selectedSize ??
        (Array.isArray(product.sizes) ? product.sizes[0] : null),
    };
  }, [product, selectedColor, selectedSize, t]);

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
    braceletLengthCm,
    heightMm,
    widthMm,
    sizeDetailsMap,
    gemstonesText,
    selectedSize: activeSize,
  } = view;

  // RINGS Display Block
  const ringBlock = (
    <div className="space-y-2">
      <Row label={t.product.detailsPanel.labels.metal} value={metal} />
      <Row
        label={t.product.detailsPanel.labels.bandWidth}
        value={bandWidthMm ? `${bandWidthMm} mm` : null}
      />
      <Row
        label={t.product.detailsPanel.labels.weight}
        value={weightG ? `${weightG} g` : null}
      />
      <Row
        label={t.product.detailsPanel.labels.gemstone}
        value={gemstonesText}
      />
      <Row
        label={t.product.detailsPanel.labels.productCode}
        value={productCode}
      />
    </div>
  );

  // NECKLACES Display Block
  const necklaceLengthValue = (() => {
    if (totalLengthCm == null && adjustableFromCm == null) return null;
    const total = totalLengthCm ? `${totalLengthCm} cm` : "";
    const adj =
      adjustableFromCm && adjustableToCm
        ? `, ${t.product.detailsPanel.adjustableFromToPrefix} ${adjustableFromCm}-${adjustableToCm} cm`
        : "";
    return `${total}${adj}`.trim();
  })();

  const necklaceBlock = (
    <div className="space-y-2">
      <Row label={t.product.detailsPanel.labels.metal} value={metal} />
      <Row label={t.product.detailsPanel.labels.chain} value={chain} />
      <Row
        label={t.product.detailsPanel.labels.totalNecklaceLength}
        value={necklaceLengthValue}
      />
      <Row
        label={t.product.detailsPanel.labels.weight}
        value={weightG ? `${weightG} g` : null}
      />
      <Row
        label={t.product.detailsPanel.labels.gemstone}
        value={gemstonesText}
      />
      <Row
        label={t.product.detailsPanel.labels.productCode}
        value={productCode}
      />
    </div>
  );

  // EARRINGS Display Block
  const earringsBlock = (
    <div className="space-y-2">
      <Row label={t.product.detailsPanel.labels.metal} value={metal} />
      {(heightMm || widthMm) && (
        <div className="pt-1">
          <SectionTitle>
            {t.product.detailsPanel.sectionTitles.dimensions}
          </SectionTitle>
          <Row
            label={t.product.detailsPanel.labels.height}
            value={`${heightMm} mm`}
          />
          <Row
            label={t.product.detailsPanel.labels.width}
            value={`${widthMm} mm`}
          />
        </div>
      )}
      <Row
        label={t.product.detailsPanel.labels.weight}
        value={weightG ? `${weightG} g` : null}
      />
      <Row
        label={t.product.detailsPanel.labels.gemstone}
        value={gemstonesText}
      />
      <Row
        label={t.product.detailsPanel.labels.productCode}
        value={productCode}
      />
    </div>
  );

  // BRACELETS Logic for sizes
  const renderBraceletSizeBlocks = () => {
    if (sizeDetailsMap && activeSize && sizeDetailsMap[activeSize]) {
      const info = sizeDetailsMap[activeSize];
      return (
        <div className="space-y-2">
          <Row label={t.product.detailsPanel.labels.size} value={activeSize} />
          <Row
            label={t.product.detailsPanel.labels.totalBraceletLength}
            value={info.totalLength || info.totalBraceletLength}
          />
          <Row
            label={t.product.detailsPanel.labels.weight}
            value={info.weightG ? `${info.weightG} g` : null}
          />
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <Row
          label={t.product.detailsPanel.labels.size}
          value={activeSize || "—"}
        />
        <Row
          label={t.product.detailsPanel.labels.totalBraceletLength}
          value={braceletLengthCm ? `${braceletLengthCm} cm` : null}
        />
        <Row
          label={t.product.detailsPanel.labels.weight}
          value={weightG ? `${weightG} g` : null}
        />
      </div>
    );
  };

  const braceletBlock = (
    <div className="space-y-2">
      <Row label={t.product.detailsPanel.labels.metal} value={metal} />
      <div className="pt-2">{renderBraceletSizeBlocks()}</div>
      <Row
        label={t.product.detailsPanel.labels.gemstone}
        value={gemstonesText}
      />
      <Row
        label={t.product.detailsPanel.labels.productCode}
        value={productCode}
      />
    </div>
  );

  // Fallback for unknown categories
  const genericBlock = (
    <div className="space-y-2">
      <Row label={t.product.detailsPanel.labels.metal} value={metal} />
      <Row
        label={t.product.detailsPanel.labels.weight}
        value={weightG ? `${weightG} g` : null}
      />
      <Row
        label={t.product.detailsPanel.labels.productCode}
        value={productCode}
      />
    </div>
  );

  // Determine which block to render
  const block =
    {
      rings: ringBlock,
      bracelets: braceletBlock,
      necklaces: necklaceBlock,
      earrings: earringsBlock,
    }[category] || genericBlock;

  return (
    <div className="select-none">
      {text && (
        <p className="font-ui text-[14px] leading-relaxed text-black/80">
          {text}
        </p>
      )}
      <div className={text ? "mt-6" : ""}>{block}</div>
    </div>
  );
});

/**
MAIN PANEL COMPONENT Handles the slide-out sidebar logic
 */
const DetailsPanel = memo(function DetailsPanel({
  isOpen,
  onClose,
  product,
  selectedColor,
  selectedSize,
}) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] select-none"
      onDragStart={preventDragHandler}
    >
      {/* Background Overlay */}
      <button
        type="button"
        aria-label={t.product.detailsPanel.closeAriaLabel}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Sidebar Content */}
      <aside className="absolute right-0 top-0 flex h-full w-[92%] max-w-[520px] flex-col border-l border-black bg-white shadow-2xl">
        <div className="shrink-0 border-b border-black px-6 pt-7 pb-5">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-display text-[24px] leading-[0.95] uppercase">
              {t.product.detailsPanel.title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="group inline-flex items-center gap-2 font-ui text-[14px] text-black/80 transition-transform duration-200 active:scale-95 lg:hover:-translate-y-[2px]"
            >
              <span>{t.product.detailsPanel.close}</span>
              <img
                src={arrowUpRightIcon}
                alt=""
                className="h-3 w-3 transition-transform duration-200 lg:group-hover:translate-x-[1px] lg:group-hover:-translate-y-[1px]"
              />
            </button>
          </div>
        </div>

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
