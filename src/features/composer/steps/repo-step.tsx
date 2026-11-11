"use client";

import { StarIcon } from "@/components/ui/icons";
import { useComposer } from "../use-composer";
import { PaneSection } from "./pane-section";

/** The loaded repo, as a compact card at the top of the sidebar. Loading itself happens in the launcher. */
export function RepoStep() {
  const { state, actions } = useComposer();
  const r = state.repo;
  if (!r) return null;

  return (
    <PaneSection
      title="Repository"
      action={
        <button
          type="button"
          onClick={() => actions.backTo("repo")}
          className="rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          Change
        </button>
      }
    >
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={r.avatarUrl} alt="" width={40} height={40} className="size-10 shrink-0 rounded-xl border border-line bg-canvas" />
        <div className="min-w-0 flex-1">
          <a
            href={r.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={r.fullName}
            className="block truncate text-sm font-semibold hover:text-violet"
          >
            {r.fullName}
          </a>
          <p className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-muted">
            <span className="flex shrink-0 items-center gap-1">
              <StarIcon className="size-3" /> {r.stars.toLocaleString("en-US")}
            </span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{state.tags.length} tags</span>
            {r.language && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{r.language}</span>
              </>
            )}
          </p>
        </div>
      </div>
      {r.description && <p className="mt-3 line-clamp-2 break-words text-[13px] leading-relaxed text-muted">{r.description}</p>}
    </PaneSection>
  );
}
