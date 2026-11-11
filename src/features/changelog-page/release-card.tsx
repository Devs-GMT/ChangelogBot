import type { ReleaseNotes } from "@/lib/changelog/types";
import { NotesBody } from "./notes-body";
import { RecordedChip, type Recorded } from "./recorded-chip";

/** One timeline entry: version + date on the left rail, notes on the right. */
export function ReleaseCard({
  version,
  date,
  notes,
  recorded,
  pending,
}: {
  version: string;
  date: string;
  /** Null when the IPFS notes could not be loaded or did not match the on-chain hash. */
  notes: ReleaseNotes | null;
  recorded?: Recorded;
  /** Preview before publishing. */
  pending?: boolean;
}) {
  return (
    // Laid out by its container, not the viewport: it also renders inside the narrow outputs pane.
    <div className="@container">
      <article className="group/release relative grid gap-4 py-8 pl-8 @2xl:grid-cols-[150px_minmax(0,1fr)] @2xl:gap-10 @2xl:pl-0">
        {/* Timeline rail: one continuous line through every release, a node per version */}
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-[7px] top-0 w-px bg-line @2xl:left-[170px] group-first/release:top-10 group-last/release:bottom-auto group-last/release:h-10"
        />
        <span
          aria-hidden="true"
          className={`absolute left-0 top-9 size-[15px] rounded-full border-[3px] border-paper ring-1 @2xl:left-[163px] ${
            pending ? "bg-line ring-line" : "bg-violet ring-violet/30"
          }`}
        />

        <header className="@2xl:sticky @2xl:top-24 @2xl:self-start @2xl:text-right">
          <h2 className="inline-block rounded-lg border border-line bg-paper px-2.5 py-1 font-mono text-base font-semibold tracking-tight shadow-card">
            {version}
          </h2>
          <time className="mt-1.5 block text-sm text-muted" dateTime={date}>
            {new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        </header>

        <div className="grid min-w-0 gap-4 rounded-2xl border border-line bg-paper p-5 shadow-card transition-shadow group-hover/release:shadow-lift sm:p-6">
          {pending ? (
            <p className="w-fit rounded-lg border border-line bg-canvas px-2.5 py-1 text-xs font-medium text-muted">
              Preview · recorded on BOT Chain when you publish
            </p>
          ) : (
            recorded && <RecordedChip recorded={recorded} />
          )}
          {notes ? (
            <NotesBody notes={notes} />
          ) : (
            <p className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-muted">
              The notes for this release could not be loaded from IPFS right now
              (or did not match the recorded hash).
            </p>
          )}
        </div>
      </article>
    </div>
  );
}
