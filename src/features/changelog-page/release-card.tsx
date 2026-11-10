import { Chip } from "@/components/ui/chip";
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
    <article className="group/release relative grid gap-4 py-8 pl-8 md:grid-cols-[150px_minmax(0,1fr)] md:gap-10 md:pl-0">
      {/* Timeline rail: one continuous line through every release, a node per version */}
      <span aria-hidden="true" className="absolute bottom-0 left-[7px] top-0 w-px bg-line md:left-[170px] group-first/release:top-10 group-last/release:bottom-auto group-last/release:h-10" />
      <span
        aria-hidden="true"
        className={`absolute left-0 top-9 size-[15px] rounded-full border-[3px] border-paper ring-1 md:left-[163px] ${
          pending ? "bg-line ring-line" : "bg-violet ring-violet/30"
        }`}
      />

      <header className="md:sticky md:top-24 md:self-start md:text-right">
        <h2 className="inline-block rounded-lg border border-line bg-paper px-2.5 py-1 font-mono text-base font-semibold tracking-tight shadow-card">
          {version}
        </h2>
        <time className="mt-1.5 block text-sm text-muted" dateTime={date}>
          {new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </time>
      </header>

      <div className="grid gap-4">
        {pending ? (
          <Chip tone="neutral">Preview — will be recorded on BOT Chain when you publish</Chip>
        ) : (
          recorded && <RecordedChip recorded={recorded} />
        )}
        {notes ? (
          <NotesBody notes={notes} />
        ) : (
          <p className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-muted">
            The notes for this release could not be loaded from IPFS right now (or did not match the recorded hash).
          </p>
        )}
      </div>
    </article>
  );
}
