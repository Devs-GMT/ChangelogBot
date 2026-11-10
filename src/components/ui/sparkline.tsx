import { cn } from "@/lib/utils/cn";

/**
 * Tiny line chart. The path has pathLength=1 so animations can draw it with
 * stroke-dashoffset (data-sparkline-path marks the element for GSAP).
 */
export function Sparkline({
  values,
  className,
  stroke = "var(--color-violet)",
  draw,
}: {
  values: number[];
  className?: string;
  stroke?: string;
  /** When defined, the line draws in once this turns true (CSS transition, skipped for reduced motion). */
  draw?: boolean;
}) {
  const w = 120;
  const h = 36;
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const points = values.map((v, i) => [i * step, h - 3 - (v / max) * (h - 6)] as const);
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${d} L${w} ${h} L0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-9 w-full", className)} preserveAspectRatio="none" aria-hidden="true">
      <path d={area} fill={stroke} opacity="0.08" />
      <path
        data-sparkline-path
        d={d}
        pathLength={1}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={draw === undefined ? undefined : "motion-safe:transition-[stroke-dashoffset] motion-safe:duration-[1400ms] motion-safe:ease-out"}
        style={draw === undefined ? undefined : { strokeDasharray: 1, strokeDashoffset: draw ? 0 : 1 }}
      />
    </svg>
  );
}
