import { cn } from "@/lib/utils/cn";

/**
 * A staircase of soft blocks for framing a quote: release "blocks" stacking up.
 * `corner` sets which corner of its container the stair grows from.
 */
const STAIR: [number, number, boolean?][] = [
  // [col, row, accent]
  [0, 0],
  [1, 0],
  [2, 0],
  [0, 1],
  [1, 1, true],
  [0, 2],
];

export function PixelBlocks({ corner, className }: { corner: "tl" | "br"; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute grid grid-cols-3 gap-1.5 opacity-80 sm:gap-3 sm:opacity-100",
        corner === "tl" ? "left-0 top-0" : "bottom-0 right-0 rotate-180",
        className,
      )}
    >
      {STAIR.map(([c, r, accent], i) => (
        <span
          key={i}
          data-block
          className={cn(
            "size-8 rounded-lg border sm:size-16 sm:rounded-xl md:size-20 md:rounded-2xl lg:size-24",
            accent ? "border-violet/25 bg-violet-soft" : "border-line bg-canvas",
          )}
          style={{ gridColumn: c + 1, gridRow: r + 1 }}
        />
      ))}
    </div>
  );
}
