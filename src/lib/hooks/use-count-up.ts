"use client";

import { useEffect, useState } from "react";

/** Counts from 0 to `target`. Jumps straight to the target when the user prefers reduced motion. */
export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = reduced ? 0 : duration;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = ms === 0 ? 1 : Math.min((now - start) / ms, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
