"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/field";
import { useCountUp } from "@/lib/hooks/use-count-up";
import { getRateLimit, subscribeRateLimit } from "@/lib/github/client";
import type { RateLimitInfo } from "@/lib/github/types";
import { useComposer } from "../use-composer";

/** Compact count for the narrow sidebar: number on top, short label below, never wider than its third. */
function AnimatedStat({ label, value }: { label: string; value: number }) {
  const shown = useCountUp(value);
  return (
    <div className="min-w-0 px-2 py-2.5 text-center">
      <div className="tabular truncate font-display text-xl font-semibold leading-none">{shown}</div>
      <div className="mt-1.5 truncate text-[11px] text-muted">{label}</div>
    </div>
  );
}

function RateLimitLine() {
  const [rate, setRate] = useState<RateLimitInfo | null>(getRateLimit());
  useEffect(() => subscribeRateLimit(setRate), []);
  if (!rate) return null;
  return (
    <p className="text-xs text-muted">
      GitHub requests left this hour: <span className="font-mono text-ink">{rate.remaining}</span> / {rate.limit}
    </p>
  );
}

export function ReadingStep() {
  const { state, actions } = useComposer();
  if (state.phase === "repo") return null;

  const { reading, stats, noiseCount, allNoise, readError } = state;

  return (
    <section aria-label="Changes" className="grid gap-3 px-5 py-5">
      {reading === "loading" && (
        <div role="status" className="rounded-xl border border-line bg-canvas/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-[13px] text-muted">
            <span className="size-2 animate-pulse rounded-full bg-violet" aria-hidden="true" />
            Reading commits and pull requests…
          </div>
          <div className="grid h-14 grid-cols-3 gap-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-lg bg-canvas" />
            ))}
          </div>
        </div>
      )}

      {readError && (
        <Notice tone="error">
          <p>{readError}</p>
          {/range has \d+ commits/.test(readError) && (
            <p className="mt-1 text-muted">Tip: pick a closer “From” tag or a narrower date range.</p>
          )}
        </Notice>
      )}

      {stats && reading !== "loading" && (
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="grid grid-cols-3 divide-x divide-line bg-canvas/50">
            <AnimatedStat label="Commits" value={stats.commits} />
            <AnimatedStat label="PRs" value={stats.pullRequests} />
            <AnimatedStat label="People" value={stats.contributors} />
          </div>
          <p className="border-t border-line px-3 py-2.5 text-xs leading-relaxed text-muted">
            {state.includeNoise
              ? "Maintenance commits are included."
              : noiseCount > 0
                ? `${noiseCount} maintenance commits filtered (merges, chore:, ci:, dependency bumps, bots).`
                : "No maintenance noise found."}
          </p>
        </div>
      )}

      {allNoise && (
        <Notice tone="warn">
          <p className="font-medium">Only maintenance changes in this range.</p>
          <p className="mt-0.5 text-muted">Nothing user-facing was found. Include them anyway?</p>
          <Button className="mt-2" size="sm" variant="secondary" onClick={() => void actions.readChanges({ includeNoise: true })}>
            Include maintenance commits
          </Button>
        </Notice>
      )}

      <RateLimitLine />
    </section>
  );
}
