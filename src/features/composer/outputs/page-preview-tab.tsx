"use client";

import { ReleaseCard } from "@/features/changelog-page/release-card";
import type { ReleaseNotes } from "@/lib/changelog/types";
import { useOrigin } from "@/lib/hooks/use-origin";

/** The public page as it will look, inside a little browser window. */
export function PagePreviewTab({ notes }: { notes: ReleaseNotes }) {
  const origin = useOrigin();
  const host = origin.replace(/^https?:\/\//, "") || "changelogbot.app";

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-card">
      <div className="flex items-center gap-2 border-b border-line bg-canvas px-3 py-2">
        <span aria-hidden="true" className="flex gap-1">
          <i className="size-2 rounded-full bg-line" />
          <i className="size-2 rounded-full bg-line" />
          <i className="size-2 rounded-full bg-line" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-md bg-paper px-2.5 py-1 text-center font-mono text-[11px] text-muted ring-1 ring-line">
          {host}/c/{notes.repo}
        </span>
      </div>
      <div className="max-h-[520px] overflow-auto px-4">
        <ReleaseCard version={notes.version} date={notes.date} notes={notes} pending />
      </div>
    </div>
  );
}
