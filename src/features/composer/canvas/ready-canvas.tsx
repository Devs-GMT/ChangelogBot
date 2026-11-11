"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon, TagIcon } from "@/components/ui/icons";
import type { RangeEdge, RangeEnd } from "@/lib/github/types";
import { useComposer } from "../use-composer";

function label(edge: RangeEdge | RangeEnd | null): string {
  if (!edge) return "first commit";
  if (edge.kind === "ref") return edge.ref;
  if (edge.kind === "date") return edge.date;
  return "latest";
}

/** Repo loaded, nothing read yet: one quiet card that restates the range and offers the next action. */
export function ReadyCanvas() {
  const { state, actions } = useComposer();
  const busy = state.reading === "loading";

  return (
    <div className="flex min-h-full items-center justify-center py-6">
      <div className="rise w-full max-w-md text-center">
        <div className="relative rounded-3xl border border-line bg-paper p-6 shadow-card sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Range</p>

          <div className="mt-4 flex items-center justify-center gap-2 sm:gap-3">
            <span className="flex min-w-0 items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-2 font-mono text-[13px]">
              <TagIcon className="size-3.5 shrink-0 text-muted" />
              <span className="truncate">{label(state.from)}</span>
            </span>
            <span aria-hidden="true" className="relative h-px w-8 shrink-0 bg-line sm:w-12">
              <i className="absolute -right-0.5 -top-[3px] size-[7px] rotate-45 border-r border-t border-muted/60" />
            </span>
            <span className="flex min-w-0 items-center gap-1.5 rounded-xl border border-violet/25 bg-violet-soft px-3 py-2 font-mono text-[13px] text-violet">
              <TagIcon className="size-3.5 shrink-0" />
              <span className="truncate">{state.version || label(state.to)}</span>
            </span>
          </div>

          <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-muted">
            Adjust the range on the left, then read the commits and pull requests in between.
          </p>

          <Button size="lg" className="mt-6 w-full" disabled={busy} onClick={() => void actions.readChanges()}>
            {busy ? "Reading changes…" : "Read changes"}
            {!busy && <ArrowRightIcon className="size-4" />}
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted">Nothing is published until you press Publish.</p>
      </div>
    </div>
  );
}
