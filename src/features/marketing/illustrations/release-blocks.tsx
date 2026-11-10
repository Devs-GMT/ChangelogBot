"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { FULL_MOTION, gsap, useGSAP } from "../animations/gsap";

/**
 * Floating isometric "release blocks": each cube is one release. Drawn in SVG from the product
 * palette; cubes drift at different depths as the page scrolls (static under reduced motion).
 */
type Tone = "violet" | "lavender" | "blue" | "green" | "orange";

const TONES: Record<Tone, { top: string; left: string; right: string; ink: string }> = {
  violet: { top: "#d9cfff", left: "#8b74ff", right: "#6e56cf", ink: "#ffffff" },
  lavender: { top: "#f4f1ff", left: "#ddd3ff", right: "#c9bbff", ink: "#6e56cf" },
  blue: { top: "#f2f6ff", left: "#dce7ff", right: "#c5d6fd", ink: "#2563eb" },
  green: { top: "#f0faf3", left: "#d3f0dd", right: "#b9e6c8", ink: "#16a34a" },
  orange: { top: "#fff5ee", left: "#fde0cc", right: "#fbcaa9", ink: "#ea580c" },
};

type Cube = { x: number; y: number; s: number; tone: Tone; label?: string; lines?: boolean; spark?: boolean; depth: number };

/** One cube on an 80×88 grid: top rhombus, left face, right face. */
function CubeShape({ c }: { c: Cube }) {
  const t = TONES[c.tone];
  return (
    <g transform={`translate(${c.x} ${c.y}) scale(${c.s})`}>
      <g data-depth={c.depth}>
        {/* soft contact shadow */}
        <ellipse cx="40" cy="104" rx="34" ry="8" fill="#6e56cf" opacity="0.08" />
        <path d="M40 0L80 22L40 44L0 22Z" fill={t.top} />
        <path d="M0 22L40 44V88L0 66Z" fill={t.left} />
        <path d="M80 22L40 44V88L80 66Z" fill={t.right} />
        <path d="M40 0L80 22V66L40 88L0 66V22Z" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1" strokeLinejoin="round" />
        {c.lines && (
          <g stroke={t.ink} strokeOpacity="0.85" strokeWidth="3" strokeLinecap="round">
            <path d="M9 36.5L27 46.4" />
            <path d="M9 46L31 58.1" />
            <path d="M9 55.5L21 62.1" />
          </g>
        )}
        {c.label && (
          <text
            transform="matrix(1 -0.55 0 1 49 70)"
            fontFamily="var(--font-geist-mono), ui-monospace, monospace"
            fontSize="11"
            fontWeight="700"
            fill={t.ink}
          >
            {c.label}
          </text>
        )}
        {c.spark && <path d="M40 9l1.8 4.4 4.4 1.8-4.4 1.8L40 21.4l-1.8-4.4-4.4-1.8 4.4-1.8L40 9Z" fill="#6e56cf" />}
      </g>
    </g>
  );
}

const SCENES: Record<"hero" | "small" | "pair", { viewBox: string; cubes: Cube[]; links: string[] }> = {
  hero: {
    viewBox: "0 0 420 340",
    cubes: [
      { x: 330, y: 40, s: 0.45, tone: "orange", depth: 1.6 },
      { x: 40, y: 150, s: 1.05, tone: "lavender", label: "v1.3", lines: true, depth: 0.8 },
      { x: 170, y: 30, s: 1.55, tone: "violet", label: "v1.4", lines: true, spark: true, depth: 0.5 },
      { x: 300, y: 190, s: 0.75, tone: "blue", label: "v1.2", depth: 1.1 },
      { x: 175, y: 250, s: 0.55, tone: "green", depth: 1.4 },
    ],
    links: ["M124 236 C 150 250, 168 214, 200 196", "M300 230 C 280 216, 270 200, 262 186"],
  },
  small: {
    viewBox: "0 0 220 170",
    cubes: [
      { x: 20, y: 70, s: 0.7, tone: "lavender", depth: 1 },
      { x: 90, y: 10, s: 1, tone: "violet", lines: true, spark: true, depth: 0.6 },
      { x: 160, y: 95, s: 0.5, tone: "green", depth: 1.4 },
    ],
    links: [],
  },
  pair: {
    viewBox: "0 0 200 150",
    cubes: [
      { x: 10, y: 50, s: 0.8, tone: "blue", label: "v2.0", depth: 1 },
      { x: 100, y: 10, s: 0.95, tone: "lavender", lines: true, depth: 0.6 },
    ],
    links: [],
  },
};

export function ReleaseBlocks({ scene = "hero", className }: { scene?: keyof typeof SCENES; className?: string }) {
  const root = useRef<SVGSVGElement>(null);
  const { viewBox, cubes, links } = SCENES[scene];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        gsap.utils.toArray<SVGGElement>("[data-depth]", root.current).forEach((el, i) => {
          const depth = Number(el.dataset.depth);
          // Parallax: deeper cubes travel further as the section scrolls past.
          gsap.fromTo(
            el,
            { y: 30 * depth },
            {
              y: -30 * depth,
              ease: "none",
              scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
          // A slow idle bob so the scene feels alive at rest.
          gsap.to(el, { rotation: i % 2 ? 1.5 : -1.5, svgOrigin: "40 44", duration: 3 + i, yoyo: true, repeat: -1, ease: "sine.inOut" });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <svg ref={root} viewBox={viewBox} aria-hidden="true" className={cn("pointer-events-none overflow-visible", className)}>
      {links.map((d) => (
        <path key={d} d={d} fill="none" stroke="#b9a8ff" strokeWidth="1.5" strokeDasharray="3 5" strokeLinecap="round" />
      ))}
      {cubes.map((c, i) => (
        <CubeShape key={i} c={c} />
      ))}
    </svg>
  );
}
