import { useMemo } from "react";

function range(start, end) {
  const out = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

function getPaginationRange({ page, totalPages, siblingCount = 1 }) {
  const totalPageNumbers = siblingCount * 2 + 5; // first, last, current, 2* siblings, 2 dots

  if (totalPages <= totalPageNumbers) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  const firstPage = 1;
  const lastPage = totalPages;

  if (!showLeftDots && showRightDots) {
    const leftRange = range(1, 3 + siblingCount * 2);
    return [...leftRange, "...", lastPage];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = range(totalPages - (2 + siblingCount * 2), totalPages);
    return [firstPage, "...", ...rightRange];
  }

  const middleRange = range(leftSibling, rightSibling);
  return [firstPage, "...", ...middleRange, "...", lastPage];
}

export default function Pagination({
  totalItems = 0,
  page = 1,
  pageSize = 12,
  onPageChange,
  siblingCount = 1,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));

  const items = useMemo(() => {
    return getPaginationRange({
      page: safePage,
      totalPages,
      siblingCount,
    });
  }, [safePage, totalPages, siblingCount]);

  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  const baseBtn =
    "h-8 min-w-8 px-2 border border-black font-ui text-[13px] flex items-center justify-center transition-all duration-200 ease-out";
  const hoverBtn = "hover:-translate-y-[1px]";
  const disabledBtn = "opacity-40 pointer-events-none";
  const activeBtn = "bg-black text-white";
  const ghostBtn = "bg-white text-black";

  return (
    <nav
      className="flex items-center gap-2 select-none"
      aria-label="Pagination"
    >
      {/* PREV */}
      <button
        type="button"
        onClick={() => onPageChange?.(safePage - 1)}
        disabled={!canPrev}
        className={[
          baseBtn,
          ghostBtn,
          hoverBtn,
          !canPrev ? disabledBtn : "",
        ].join(" ")}
        aria-label="Previous page"
      >
        ←
      </button>

      {/* NUMBERS */}
      <div className="flex items-center gap-2">
        {items.map((it, idx) => {
          if (it === "...") {
            return (
              <span
                key={`dots-${idx}`}
                className="h-8 min-w-8 px-2 flex items-center justify-center font-ui text-[13px] text-black/60"
              >
                …
              </span>
            );
          }

          const p = it;
          const isActive = p === safePage;

          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange?.(p)}
              className={[
                baseBtn,
                isActive ? activeBtn : ghostBtn,
                !isActive ? hoverBtn : "",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* NEXT */}
      <button
        type="button"
        onClick={() => onPageChange?.(safePage + 1)}
        disabled={!canNext}
        className={[
          baseBtn,
          ghostBtn,
          hoverBtn,
          !canNext ? disabledBtn : "",
        ].join(" ")}
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  );
}
