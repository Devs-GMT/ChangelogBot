"use client";

import { GroupBadge } from "@/components/ui/group-badge";
import { GROUPS } from "@/lib/changelog/types";
import { useComposer } from "../use-composer";
import { TonePicker } from "./tone-picker";

/**
 * Top of the editor: the release as a card (repo, version, counts) with the tone control.
 * Sized by its container, not the viewport, so it stays tidy between the two side panes.
 */
export function ReleaseHeader() {
  const { state } = useComposer();
  const { notes, repo, stats } = state;
  if (!notes) return null;
  const visible = notes.items.filter((i) => !i.hidden);
  const version = state.version || notes.version;

  return (
    <header className="rise overflow-hidden rounded-2xl border border-line bg-paper shadow-card">
      <div className="grid gap-5 p-5 @2xl:grid-cols-[minmax(0,1fr)_auto] @2xl:items-center @2xl:p-6">
        <div className="flex min-w-0 items-center gap-3.5">
          {repo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={repo.avatarUrl}
              alt=""
              width={48}
              height={48}
              className="size-11 shrink-0 rounded-xl border border-line bg-canvas @2xl:size-12"
            />
          )}
          <div className="min-w-0">
            <p className="truncate font-mono text-xs text-muted" title={notes.repo}>
              {notes.repo}
            </p>
            <h2 className="mt-1 flex min-w-0 items-baseline gap-2 text-2xl leading-none tracking-[-0.035em] @2xl:text-[1.75rem]">
              <span className="shrink-0">Release</span>
              <span className="min-w-0 truncate font-mono text-[0.78em] font-semibold tracking-tight text-violet" title={version}>
                {version}
              </span>
            </h2>
          </div>
        </div>

        {stats && (
          <dl className="grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-canvas/60 text-center">
            {(
              [
                ["Commits", stats.commits],
                ["PRs", stats.pullRequests],
                ["People", stats.contributors],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex min-w-0 flex-col-reverse px-4 py-2">
                <dt className="truncate text-[11px] text-muted">{label}</dt>
                <dd className="tabular font-display text-lg font-semibold leading-tight">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="grid gap-3.5 border-t border-line bg-canvas/40 px-5 py-4 @2xl:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {GROUPS.map((g) => {
            const count = visible.filter((i) => i.group === g.id).length;
            return count ? (
              <span key={g.id} className="flex items-center gap-1.5">
                <GroupBadge group={g.id} />
                <span className="tabular text-xs text-muted">{count}</span>
              </span>
            ) : null;
          })}
        </div>
        <TonePicker />
      </div>
    </header>
  );
}
