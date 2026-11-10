import { ReleaseCard } from "@/features/changelog-page/release-card";
import type { ReleaseNotes } from "@/lib/changelog/types";

export function PagePreviewTab({ notes }: { notes: ReleaseNotes }) {
  return (
    <div className="max-h-[560px] overflow-auto rounded-2xl border border-line bg-paper px-4 shadow-card">
      <ReleaseCard version={notes.version} date={notes.date} notes={notes} pending />
    </div>
  );
}
