"use client";

import { Chip } from "@/components/ui/chip";
import { CheckIcon } from "@/components/ui/icons";
import { Sparkline } from "@/components/ui/sparkline";
import { StatTile } from "@/components/ui/stat-tile";
import { useCountUp } from "@/lib/hooks/use-count-up";
import { useInView } from "@/lib/hooks/use-in-view";

const WEEKLY_COMMITS = [4, 7, 5, 11, 9, 14, 8, 17, 12, 21, 15, 9];

function Counter({ label, value, go }: { label: string; value: number; go: boolean }) {
  const shown = useCountUp(go ? value : 0, 1100);
  return <StatTile label={label} value={shown} className="bg-canvas/70" />;
}

/** A changelog-timeline mockup: stat tiles count up and the sparkline draws in when it scrolls into view. */
export function TimelineMockup() {
  const [ref, seen] = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className="grid h-full gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="grid content-start gap-3 md:content-between">
        <div className="grid grid-cols-3 gap-2">
          <Counter label="Commits" value={42} go={seen} />
          <Counter label="PRs" value={7} go={seen} />
          <Counter label="People" value={3} go={seen} />
        </div>
        <div className="rounded-xl border border-line bg-canvas/70 p-3">
          <div className="mb-1 flex items-center justify-between text-xs text-muted">
            <span>Commits per week</span>
            <span className="font-mono">12 weeks</span>
          </div>
          <Sparkline values={WEEKLY_COMMITS} draw={seen} className="h-20" />
        </div>
      </div>

      <ol className="grid content-start gap-2" aria-label="Release timeline (example)">
        {[
          { v: "v1.4.0", d: "Nov 10", t: "Switch to testnet with one click" },
          { v: "v1.3.1", d: "Oct 28", t: "Fixed a crash on empty repos" },
          { v: "v1.3.0", d: "Oct 12", t: "Copy notes as an X post" },
          { v: "v1.2.0", d: "Sep 30", t: "Email summary for newsletters" },
        ].map((r) => (
          <li key={r.v} className="grid grid-cols-[64px_1fr] items-center gap-3 rounded-xl border border-line bg-paper px-3 py-2.5">
            <div>
              <p className="font-mono text-[13px] font-semibold">{r.v}</p>
              <p className="text-[11px] text-muted">{r.d}</p>
            </div>
            <div className="flex min-w-0 flex-col items-start gap-1">
              <span className="truncate text-[13px]">{r.t}</span>
              <Chip tone="violet" className="text-[10px]">
                <CheckIcon className="size-3" /> On-chain
              </Chip>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
