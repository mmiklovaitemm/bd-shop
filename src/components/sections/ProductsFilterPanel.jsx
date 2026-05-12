import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

import closeIcon from "@/assets/ui/arrow-up-right.svg";
import FilterAccordion from "@/components/ui/FilterAccordion";
import ClearAllButton from "@/components/ui/ClearAllButton";
import useLanguage from "@/context/useLanguage";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function PriceRange({ priceBounds, priceRange, onPriceChange, t }) {
  const minBound = priceBounds?.min ?? 0;
  const maxBound = priceBounds?.max ?? 0;

  const safeMin = clamp(priceRange?.min ?? minBound, minBound, maxBound);
  const safeMax = clamp(priceRange?.max ?? maxBound, minBound, maxBound);

  const value = safeMin <= safeMax ? [safeMin, safeMax] : [safeMax, safeMin];

  const setRange = (nextMin, nextMax) => {
    const nMin = clamp(Number(nextMin), minBound, maxBound);
    const nMax = clamp(Number(nextMax), minBound, maxBound);

    const a = Math.min(nMin, nMax);
    const b = Math.max(nMin, nMax);

    if (a === priceRange.min && b === priceRange.max) return;
    onPriceChange?.({ min: a, max: b });
  };

  return (
    <div className="space-y-4">
      <Box sx={{ px: 1 }}>
        <Slider
          value={value}
          min={minBound}
          max={maxBound}
          step={1}
          disableSwap
          onChange={(_, newValue) => {
            if (!Array.isArray(newValue)) return;
            setRange(newValue[0], newValue[1]);
          }}
          sx={{
            color: "#000",
            "& .MuiSlider-rail": {
              color: "rgba(0,0,0,0.12)",
              opacity: 1,
              height: 3,
            },
            "& .MuiSlider-track": {
              border: "none",
              backgroundColor: "#000",
              height: 3,
            },
            "& .MuiSlider-thumb": {
              width: 14,
              height: 14,
              backgroundColor: "#000",
              boxShadow: "none",
              "&:hover, &.Mui-focusVisible": { boxShadow: "none" },
              "&::before": { boxShadow: "none" },
            },
          }}
        />
      </Box>

      <div className="flex items-center gap-3">
        <div className="flex h-12 flex-1 items-center gap-2 border border-black px-3">
          <span className="text-black/70">€</span>
          <input
            inputMode="numeric"
            className="w-full font-ui text-[14px] outline-none"
            value={value[0]}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d]/g, "");
              const num = raw === "" ? minBound : Number(raw);
              setRange(num, value[1]);
            }}
            onBlur={() => setRange(value[0], value[1])}
          />
        </div>

        <span className="font-ui text-[14px] text-black/70">{t.to}</span>

        <div className="flex h-12 flex-1 items-center gap-2 border border-black px-3">
          <span className="text-black/70">€</span>
          <input
            inputMode="numeric"
            className="w-full font-ui text-[14px] outline-none"
            value={value[1]}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d]/g, "");
              const num = raw === "" ? maxBound : Number(raw);
              setRange(value[0], num);
            }}
            onBlur={() => setRange(value[0], value[1])}
          />
        </div>
      </div>
    </div>
  );
}

function toggleInArray(arr, value) {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}

function FiltersContent({
  materialOptions,
  selectedMaterial,
  onMaterialChange,

  priceBounds,
  priceRange,
  onPriceChange,

  appearanceOptions,
  selectedAppearance,
  onAppearanceChange,

  gemOptions,
  selectedGems,
  onGemsChange,

  sizeOptions,
  selectedSize,
  onSizeChange,

  t,
}) {
  return (
    <>
      <FilterAccordion title={t.material}>
        {materialOptions.length === 0 ? (
          <p className="font-ui text-[14px] text-black/50">
            {t.noProductsFound}
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {materialOptions.map((opt) => {
              const active = selectedMaterial === opt.value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onMaterialChange?.(active ? null : opt.value)}
                  className={[
                    "h-10 border px-4 font-ui text-[13px] transition-colors",
                    active
                      ? "border-black bg-black text-white"
                      : "border-black/40 bg-white text-black hover:bg-black/5",
                  ].join(" ")}
                >
                  {opt.label} ({opt.count})
                </button>
              );
            })}
          </div>
        )}
      </FilterAccordion>

      <FilterAccordion title={t.price}>
        <PriceRange
          priceBounds={priceBounds}
          priceRange={priceRange}
          onPriceChange={onPriceChange}
          t={t}
        />
      </FilterAccordion>

      <FilterAccordion title={t.appearance}>
        <div className="space-y-3">
          {appearanceOptions.map((opt) => {
            const checked = selectedAppearance.includes(opt.value);

            return (
              <label
                key={opt.value}
                className="flex items-center gap-3 font-ui text-[14px]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onAppearanceChange?.(
                      toggleInArray(selectedAppearance, opt.value),
                    )
                  }
                  className="h-5 w-5 accent-black"
                />
                <span>
                  {opt.label} ({opt.count})
                </span>
              </label>
            );
          })}
        </div>
      </FilterAccordion>

      {gemOptions.length > 0 && (
        <FilterAccordion title={t.gemstones}>
          <div className="space-y-3">
            {gemOptions.map((opt) => {
              const checked = selectedGems.includes(opt.value);

              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 font-ui text-[14px]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      onGemsChange?.(toggleInArray(selectedGems, opt.value))
                    }
                    className="h-5 w-5 accent-black"
                  />
                  <span>
                    {opt.label} ({opt.count})
                  </span>
                </label>
              );
            })}
          </div>
        </FilterAccordion>
      )}

      {sizeOptions.length > 0 && (
      <FilterAccordion title={t.size}>
        <div className="flex flex-wrap gap-3">
          {sizeOptions.map((opt) => {
            const active = selectedSize === opt.value;
            const disabled = opt.count === 0;

            return (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                onClick={() => onSizeChange?.(active ? null : opt.value)}
                className={[
                  "relative h-10 w-14 border font-ui text-[13px] transition-colors",
                  active
                    ? "border-black bg-black text-white"
                    : "border-black/40 bg-white text-black",
                  disabled
                    ? "cursor-not-allowed opacity-45"
                    : "hover:bg-black/5",
                ].join(" ")}
              >
                {opt.label}
                {disabled ? (
                  <span className="pointer-events-none absolute left-1 right-1 top-1/2 h-px rotate-[-25deg] bg-black/50" />
                ) : null}
              </button>
            );
          })}
        </div>
      </FilterAccordion>
      )}
    </>
  );
}

export default function ProductsFilterPanel({
  isOpen,
  onClose,
  variant = "auto",

  materialOptions = [],
  selectedMaterial,
  onMaterialChange,

  priceBounds,
  priceRange,
  onPriceChange,

  appearanceOptions = [],
  selectedAppearance = [],
  onAppearanceChange,

  gemOptions = [],
  selectedGems = [],
  onGemsChange,

  sizeOptions = [],
  selectedSize,
  onSizeChange,

  onClearAll,
  clearDisabled = false,
}) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const contentProps = {
    materialOptions,
    selectedMaterial,
    onMaterialChange,

    priceBounds,
    priceRange,
    onPriceChange,

    appearanceOptions,
    selectedAppearance,
    onAppearanceChange,

    gemOptions,
    selectedGems,
    onGemsChange,

    sizeOptions,
    selectedSize,
    onSizeChange,

    t,
  };

  return (
    <>
      {(variant === "auto" || variant === "mobile") && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label={t.closeFilter}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          <aside className="absolute right-0 top-0 flex h-full w-[92%] max-w-[380px] flex-col border-l border-black bg-white">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-black px-4">
              <span className="font-ui text-[14px]">{t.filter}</span>

              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 font-ui text-[14px] transition-all duration-300 ease-out hover:-translate-y-[2px]"
              >
                {t.close}
                <img
                  src={closeIcon}
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <FiltersContent {...contentProps} />

              <div className="p-4">
                <ClearAllButton onClick={onClearAll} disabled={clearDisabled} />
              </div>
            </div>
          </aside>
        </div>
      )}

      {(variant === "auto" || variant === "desktop") && (
        <aside className="sticky top-6 hidden h-fit w-[320px] flex-col border border-black bg-white lg:flex">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-black bg-black px-4 text-white">
            <span className="font-ui text-[14px]">{t.filter}</span>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 font-ui text-[14px] text-white transition-all duration-300 ease-out hover:-translate-y-[2px]"
            >
              {t.close}
              <img
                src={closeIcon}
                alt=""
                aria-hidden="true"
                className="h-3 w-3 invert"
              />
            </button>
          </div>

          <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="p-4">
              <FiltersContent {...contentProps} />
            </div>

            <div className="p-4 pt-0">
              <ClearAllButton onClick={onClearAll} disabled={clearDisabled} />
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
