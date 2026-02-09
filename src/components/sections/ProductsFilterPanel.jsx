import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

import closeIcon from "@/assets/ui/arrow-up-right.svg";
import FilterAccordion from "@/components/ui/FilterAccordion";
import ClearAllButton from "@/components/ui/ClearAllButton";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function PriceRange({ priceBounds, priceRange, onPriceChange }) {
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
        <div className="flex-1 border border-black h-12 px-3 flex items-center gap-2">
          <span className="text-black/70">€</span>
          <input
            inputMode="numeric"
            className="w-full outline-none font-ui text-[14px]"
            value={value[0]}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d]/g, "");
              const num = raw === "" ? minBound : Number(raw);
              setRange(num, value[1]);
            }}
            onBlur={() => setRange(value[0], value[1])}
          />
        </div>

        <span className="text-black/70 font-ui text-[14px]">to</span>

        <div className="flex-1 border border-black h-12 px-3 flex items-center gap-2">
          <span className="text-black/70">€</span>
          <input
            inputMode="numeric"
            className="w-full outline-none font-ui text-[14px]"
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
}) {
  return (
    <>
      {/* MATERIAL */}
      <FilterAccordion title="Material">
        <div className="flex gap-3 flex-wrap">
          {materialOptions.map((opt) => {
            const active = selectedMaterial === opt.value;
            const isGold = opt.value === "gold";

            const activeCls = isGold
              ? "bg-white text-[#c58a2a] border-[#c58a2a]"
              : "bg-black/60 text-white border-black/60";

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onMaterialChange?.(active ? null : opt.value)}
                className={[
                  "h-10 px-4 border font-ui text-[13px] transition-colors",
                  active
                    ? activeCls
                    : "bg-white text-black border-black/40 hover:bg-black/5",
                ].join(" ")}
              >
                {opt.label} ({opt.count})
              </button>
            );
          })}
        </div>
      </FilterAccordion>

      {/* PRICE */}
      <FilterAccordion title="Price">
        <PriceRange
          priceBounds={priceBounds}
          priceRange={priceRange}
          onPriceChange={onPriceChange}
        />
      </FilterAccordion>

      {/* APPEARANCE */}
      <FilterAccordion title="Appearance">
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

      {/* GEMS */}
      <FilterAccordion title="Brangakmeniai">
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

      {/* SIZE */}
      <FilterAccordion title="Size">
        <div className="flex gap-3 flex-wrap">
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
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black/40",
                  disabled
                    ? "opacity-45 cursor-not-allowed"
                    : "hover:bg-black/5",
                ].join(" ")}
              >
                {opt.label}
                {disabled ? (
                  <span className="pointer-events-none absolute left-1 right-1 top-1/2 h-px bg-black/50 rotate-[-25deg]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </FilterAccordion>
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
  };

  return (
    <>
      {/* Mobile/Tablet overlay */}
      {(variant === "auto" || variant === "mobile") && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close filter"
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          <aside className="absolute right-0 top-0 h-full w-[92%] max-w-[380px] bg-white border-l border-black flex flex-col">
            <div className="h-12 px-4 flex items-center justify-between border-b border-black shrink-0">
              <span className="font-ui text-[14px]">Filter</span>

              <button
                type="button"
                onClick={onClose}
                className="font-ui text-[14px] flex items-center gap-2 transition-all duration-300 ease-out hover:-translate-y-[2px]"
              >
                Close
                <img src={closeIcon} alt="Close" className="w-4 h-4" />
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

      {/* Desktop inline */}
      {(variant === "auto" || variant === "desktop") && (
        <aside className="hidden lg:flex w-[260px] bg-white border border-black h-fit sticky top-6 flex-col">
          <div className="h-12 px-4 flex items-center justify-between border-b border-black bg-black text-white shrink-0">
            <span className="font-ui text-[14px]">Filter</span>

            <button
              type="button"
              onClick={onClose}
              className="font-ui text-[14px] flex items-center gap-2 text-white transition-all duration-300 ease-out hover:-translate-y-[2px]"
            >
              Close
              <img src={closeIcon} alt="Close" className="w-3 h-3 invert" />
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
