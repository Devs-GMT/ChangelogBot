"use client";

import { useRef } from "react";
import { FULL_MOTION, gsap, ScrollTrigger, useGSAP } from "./gsap";

/**
 * Fades children marked with [data-reveal] up as they scroll into view.
 * Transform/opacity only; does nothing when the user prefers reduced motion.
 */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(FULL_MOTION, () => {
        const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]", root.current);
        gsap.set(targets, { opacity: 0, y: 24 });
        ScrollTrigger.batch(targets, {
          start: "top 88%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.09 }),
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
