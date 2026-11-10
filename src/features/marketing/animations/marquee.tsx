"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { FULL_MOTION, gsap, useGSAP } from "./gsap";

/**
 * A column of text that scrolls upward forever. The list is rendered twice so the loop is seamless.
 * With reduced motion it stays still. Transform only.
 */
export function Marquee({
  items,
  duration = 40,
  className,
}: {
  items: string[];
  /** Seconds for one full loop — vary it per column. */
  duration?: number;
  className?: string;
}) {
  const track = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        const tween = gsap.to(track.current, { yPercent: -50, duration, ease: "none", repeat: -1 });
        return () => tween.kill();
      });
      return () => mm.revert();
    },
    { scope: track, dependencies: [duration] },
  );

  const row = (item: string, key: string, hidden = false) => (
    <li
      key={key}
      aria-hidden={hidden || undefined}
      className="rounded-lg border border-line bg-paper px-3 py-2 font-mono text-[12.5px] text-ink/80 shadow-sm"
    >
      {item}
    </li>
  );

  return (
    <div
      className={cn(
        "relative h-80 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_82%,transparent)]",
        className,
      )}
    >
      <ul ref={track} className="grid gap-2.5">
        {items.map((it) => row(it, it))}
        {items.map((it) => row(it, `${it}-dup`, true))}
      </ul>
    </div>
  );
}
