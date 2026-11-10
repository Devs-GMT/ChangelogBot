"use client";

import { useId, useRef } from "react";
import { CheckIcon, GitHubIcon, LinkChainIcon, MailIcon, XLogoIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { FULL_MOTION, gsap, useGSAP } from "../animations/gsap";

/**
 * The hero's centrepiece: raw commits flow in on the left, through a glowing release block,
 * and come out as finished outputs on the right. One coordinate system (1200×520) is shared by
 * the SVG wiring and the absolutely positioned HTML, so lines meet the cards at every width.
 */
const W = 1200;
const H = 520;
const CX = 600;
const CY = 250;

const COMMITS = [
  { text: "feat: add testnet switch", dot: "bg-[#4ade80]" },
  { text: "fix: crash on empty repo", dot: "bg-[#fb923c]" },
  { text: "perf: cache tag list", dot: "bg-[#60a5fa]" },
  { text: "feat(export): md + x post", dot: "bg-[#4ade80]" },
  { text: "fix(ui): drag handles", dot: "bg-[#fb923c]" },
];
const COMMIT_Y = [70, 160, 250, 340, 430];

const OUTPUTS = [
  { icon: GitHubIcon, title: "GitHub Release", meta: "release-v1.4.0.md" },
  { icon: XLogoIcon, title: "X post", meta: "128 / 280" },
  { icon: LinkChainIcon, title: "Changelog page", meta: "/c/acme/widgets" },
  { icon: MailIcon, title: "Email summary", meta: "plain text" },
];
const OUTPUT_Y = [100, 200, 300, 400];

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const inPath = (y: number) => `M330 ${y} C 440 ${y}, 430 ${CY}, ${CX - 120} ${CY}`;
const outPath = (y: number) => `M${CX + 120} ${CY} C 770 ${CY}, 760 ${y}, 870 ${y}`;

/** Big isometric release block with notes on its face and a sparkle on top. */
function Block({ className }: { className?: string }) {
  // Unique gradient ids per copy: a gradient defined inside a hidden copy would not paint the visible one.
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 160 176" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a86ff" />
          <stop offset="1" stopColor="#6e56cf" />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6e56cf" />
          <stop offset="1" stopColor="#3f2a9e" />
        </linearGradient>
      </defs>
      <path d="M80 0L160 44L80 88L0 44Z" fill="#d9cfff" />
      <path d="M0 44L80 88V176L0 132Z" fill={`url(#${id}-l)`} />
      <path d="M160 44L80 88V176L160 132Z" fill={`url(#${id}-r)`} />
      <path d="M80 0L160 44V132L80 176L0 132V44Z" fill="none" stroke="#fff" strokeOpacity="0.35" strokeLinejoin="round" />
      <g stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.92">
        <path d="M16 72L54 93" />
        <path d="M16 91L62 116" />
        <path d="M16 110L40 123" />
      </g>
      <text
        transform="matrix(1 -0.55 0 1 96 140)"
        fontFamily="var(--font-geist-mono), ui-monospace, monospace"
        fontSize="19"
        fontWeight="700"
        fill="#fff"
      >
        v1.4
      </text>
      <path d="M80 22l3.4 8.2 8.2 3.4-8.2 3.4L80 45.2l-3.4-8.2-8.2-3.4 8.2-3.4L80 22Z" fill="#6e56cf" />
    </svg>
  );
}

function CommitPill({ text, dot, className, style }: { text: string; dot: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      data-commit
      style={style}
      className={cn(
        "flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3.5 py-2.5 font-mono text-[13px] text-white/70 ring-1 ring-white/10 backdrop-blur",
        className,
      )}
    >
      <i className={cn("size-1.5 shrink-0 rounded-full", dot)} />
      <span className="truncate">{text}</span>
    </div>
  );
}

function OutputCard({
  output,
  index,
  className,
  style,
}: {
  output: (typeof OUTPUTS)[number];
  index: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = output.icon;
  return (
    <div
      data-output
      style={{ ...style, ["--i" as string]: index }}
      className={cn(
        "engine-card flex items-center gap-3 rounded-xl bg-white/[0.04] px-3.5 py-3 ring-1 ring-white/10 backdrop-blur",
        className,
      )}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.07] text-white">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-white">{output.title}</span>
        <span className="block truncate font-mono text-[11px] text-white/45">{output.meta}</span>
      </span>
      <span className="engine-check grid size-5 place-items-center rounded-full bg-[#4ade80]/15 text-[#4ade80]">
        <CheckIcon className="size-3" />
      </span>
    </div>
  );
}

export function ReleaseEngine() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        const q = gsap.utils.selector(root);
        const tl = gsap.timeline({ delay: 0.5, defaults: { ease: "power3.out" } });
        tl.from(q("[data-core]"), { scale: 0.7, opacity: 0, duration: 1.1, ease: "back.out(1.6)" })
          .from(q("[data-wire]"), { strokeDashoffset: 260, duration: 1, stagger: 0.06 }, "-=0.6")
          .from(q("[data-commit]"), { x: -40, opacity: 0, duration: 0.6, stagger: 0.08 }, "<")
          .from(q("[data-output]"), { x: 40, opacity: 0, duration: 0.6, stagger: 0.08 }, "<0.2");
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      {/* Wide screens: the wired stage */}
      <div className="relative mx-auto hidden aspect-[1200/520] w-full max-w-6xl lg:block">
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="wire-in" x1="0" x2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.05" />
              <stop offset="1" stopColor="#8b74ff" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="wire-out" x1="0" x2="1">
              <stop offset="0" stopColor="#8b74ff" stopOpacity="0.7" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          {COMMIT_Y.map((y) => (
            <path key={`i${y}`} id={`wire-i${y}`} data-wire d={inPath(y)} fill="none" stroke="url(#wire-in)" strokeWidth="1.5" strokeDasharray="260" />
          ))}
          {OUTPUT_Y.map((y) => (
            <path key={`o${y}`} id={`wire-o${y}`} data-wire d={outPath(y)} fill="none" stroke="url(#wire-out)" strokeWidth="1.5" strokeDasharray="260" />
          ))}
          {/* Sparks travelling along the wires; hidden for reduced motion */}
          <g className="motion-reduce:hidden">
            {COMMIT_Y.map((y, i) => (
              <circle key={`si${y}`} r="3" fill="#c4b5ff">
                <animateMotion dur="2.6s" begin={`${i * 0.5}s`} repeatCount="indefinite">
                  <mpath href={`#wire-i${y}`} />
                </animateMotion>
              </circle>
            ))}
            {OUTPUT_Y.map((y, i) => (
              <circle key={`so${y}`} r="3" fill="#86efac">
                <animateMotion dur="2.2s" begin={`${1.3 + i * 0.6}s`} repeatCount="indefinite">
                  <mpath href={`#wire-o${y}`} />
                </animateMotion>
              </circle>
            ))}
          </g>
        </svg>

        {COMMITS.map((c, i) => (
          <CommitPill
            key={c.text}
            {...c}
            className="absolute w-[27.5%] -translate-y-1/2"
            style={{ left: 0, top: pct(COMMIT_Y[i], H) }}
          />
        ))}

        <div
          data-core
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: pct(CX, W), top: pct(CY, H), width: pct(240, W) }}
        >
          <div aria-hidden="true" className="engine-halo absolute inset-[-35%] rounded-full bg-[radial-gradient(closest-side,rgb(139_116_255/0.55),transparent)]" />
          <div aria-hidden="true" className="absolute -bottom-[18%] left-1/2 h-[16%] w-[90%] -translate-x-1/2 rounded-[50%] bg-[#8b74ff]/40 blur-xl" />
          <Block className="float-y relative w-full drop-shadow-[0_30px_60px_rgb(110_86_207/0.55)]" />
        </div>

        {OUTPUTS.map((o, i) => (
          <OutputCard
            key={o.title}
            output={o}
            index={i}
            className="absolute right-0 w-[27.5%] -translate-y-1/2"
            style={{ top: pct(OUTPUT_Y[i], H) }}
          />
        ))}
      </div>

      {/* Phones and tablets: the same story, stacked */}
      <div className="mx-auto grid max-w-md gap-6 lg:hidden">
        <div className="grid gap-2">
          {COMMITS.slice(0, 3).map((c) => (
            <CommitPill key={c.text} {...c} />
          ))}
        </div>
        <div data-core className="relative mx-auto w-40">
          <div aria-hidden="true" className="engine-halo absolute inset-[-40%] rounded-full bg-[radial-gradient(closest-side,rgb(139_116_255/0.5),transparent)]" />
          <Block className="float-y relative w-full drop-shadow-[0_24px_40px_rgb(110_86_207/0.5)]" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {OUTPUTS.map((o, i) => (
            <OutputCard key={o.title} output={o} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
