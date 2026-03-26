import { memo, useMemo } from "react";

import useLanguage from "@/context/useLanguage";
import preventDragHandler from "@/utils/preventDrag";
import arrowUpRightIcon from "@/assets/ui/arrow-up-right.svg";

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
  const { t } = useLanguage();

  const view = useMemo(() => {
    if (!product) return null;

    const category = detectCategory(product);
    const categoryDefaults = CATEGORY_DEFAULTS[category] || {};

    const detailsObj =
      product.details || product.dimensionsDetails || product.specs || {};

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
      getDefaultCategoryText(category, t),
    );

    const metalRaw = pickFirst(
      selectedColor,
      detailsObj.metal,
      product.metal,
      Array.isArray(product.colors) ? product.colors[0] : null,
    );
    const metal = formatMetal(metalRaw, t);

    const productCode = pickFirst(
      detailsObj.productCode,
      product.productCode,
      product.sku,
      product.code,
      categoryDefaults.productCode,
      product.id ? `ID-${product.id}` : null,
    );

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
    heightMm,
    widthMm,
    sizeDetailsMap,
    selectedSize: activeSize,
    gemstonesText,
  } = view;

  const metalLine = metal ? `${metal}` : null;

  const ringBlock = (
    <div className="space-y-2">
      <Row label={t.product.detailsPanel.labels.metal} value={metalLine} />
      <Row
        label={t.product.detailsPanel.labels.bandWidth}
        value={bandWidthMm != null ? `${bandWidthMm} mm` : null}
      />
      <Row
        label={t.product.detailsPanel.labels.weight}
        value={weightG != null ? `${weightG} g` : null}
      />
      <Row
        label={t.product.detailsPanel.labels.gemstone}
        value={gemstonesText || null}
      />
      <Row
        label={t.product.detailsPanel.labels.productCode}
        value={productCode}
      />
    </div>
  );

  const necklaceLengthValue = (() => {
    const hasTotal = totalLengthCm != null;
    const hasAdj = adjustableFromCm != null && adjustableToCm != null;
    if (!hasTotal && !hasAdj) return null;

    const total = hasTotal ? `${totalLengthCm} cm` : "";
    const adj = hasAdj
      ? `, ${t.product.detailsPanel.adjustableFromToPrefix} ${adjustableFromCm} cm ${t.product.detailsPanel.adjustableFromToMiddle} ${adjustableToCm} cm`
      : "";

    return `${total}${adj}`.trim();
  })();

  const necklaceBlock = (
    <div className="space-y-2">
      <Row label={t.product.detailsPanel.labels.metal} value={metalLine} />
      <Row label={t.product.detailsPanel.labels.chain} value={chain} />
      <Row
        label={t.product.detailsPanel.labels.totalNecklaceLength}
        value={necklaceLengthValue}
      />
      <Row
        label={t.product.detailsPanel.labels.weight}
        value={weightG != null ? `${weightG} g` : null}
      />
      <Row
        label={t.product.detailsPanel.labels.gemstone}
        value={gemstonesText || null}
      />
      <Row
        label={t.product.detailsPanel.labels.productCode}
        value={productCode}
      />
    </div>
  );

  const earringsBlock = (
    <div className="space-y-2">
      <Row label={t.product.detailsPanel.labels.metal} value={metalLine} />
      {heightMm != null || widthMm != null ? (
        <div className="space-y-1">
          <SectionTitle>
            {t.product.detailsPanel.sectionTitles.dimensions}
          </SectionTitle>
          <Row
            label={t.product.detailsPanel.labels.height}
            value={heightMm != null ? `${heightMm} mm` : null}
          />
          <Row
            label={t.product.detailsPanel.labels.width}
            value={widthMm != null ? `${widthMm} mm` : null}
          />
        </div>
      ) : null}
      <Row
        label={t.product.detailsPanel.labels.weight}
        value={weightG != null ? `${weightG} g` : null}
      />
      <Row
        label={t.product.detailsPanel.labels.gemstone}
        value={gemstonesText || null}
      />
      <Row
        label={t.product.detailsPanel.labels.productCode}
        value={productCode}
      />
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
          <Row label={t.product.detailsPanel.labels.size} value={activeSize} />
          <Row
            label={t.product.detailsPanel.labels.totalBraceletLength}
            value={totalText}
          />
          <Row
            label={t.product.detailsPanel.labels.weight}
            value={w != null ? `${w} g` : null}
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
      </div>
    );
  };

  const braceletBlock = (
    <div className="space-y-2">
      <Row label={t.product.detailsPanel.labels.metal} value={metalLine} />
      <div className="pt-2">{renderBraceletSizeBlocks()}</div>
      <div className="pt-2">
        <Row
          label={t.product.detailsPanel.labels.gemstone}
          value={gemstonesText || null}
        />
        <Row
          label={t.product.detailsPanel.labels.productCode}
          value={productCode}
        />
      </div>
    </div>
  );

  const genericBlock = (
    <div className="space-y-2">
      <Row label={t.product.detailsPanel.labels.metal} value={metalLine} />
      <Row
        label={t.product.detailsPanel.labels.size}
        value={activeSize || "—"}
      />
      <Row
        label={t.product.detailsPanel.labels.weight}
        value={weightG != null ? `${weightG} g` : null}
      />
      <Row
        label={t.product.detailsPanel.labels.productCode}
        value={productCode}
      />
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
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] select-none"
      onDragStart={preventDragHandler}
    >
      <button
        type="button"
        aria-label={t.product.detailsPanel.closeAriaLabel}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <aside className="absolute right-0 top-0 flex h-full w-[92%] max-w-[520px] flex-col border-l border-black bg-white">
        <div className="shrink-0 border-b border-black px-6 pt-7 pb-5">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-display text-[24px] leading-[0.95]">
              {t.product.detailsPanel.title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="group inline-flex items-center gap-2 font-ui text-[14px] text-black/80 transition-transform duration-200 ease-out active:scale-95 lg:hover:-translate-y-[2px]"
            >
              <span>{t.product.detailsPanel.close}</span>
              <img
                src={arrowUpRightIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
                onDragStart={preventDragHandler}
                className="h-3 w-3 select-none transition-transform duration-200 ease-out lg:group-hover:translate-x-[1px] lg:group-hover:-translate-y-[1px]"
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
