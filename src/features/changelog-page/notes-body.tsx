import { GroupBadge } from "@/components/ui/group-badge";
import { itemsByGroup } from "@/lib/changelog/outputs";
import { GROUPS, type ReleaseNotes } from "@/lib/changelog/types";
import { safeHttpUrl } from "@/lib/utils/safe-url";

/** Renders release notes as React elements — never as HTML — so untrusted notes cannot inject markup. */
export function NotesBody({ notes }: { notes: ReleaseNotes }) {
  const grouped = itemsByGroup(notes);

  return (
    <div className="grid gap-5">
      {notes.summary && <p className="text-[15px] leading-relaxed text-ink">{notes.summary}</p>}

      {notes.highlights.length > 0 && (
        <ul className="grid gap-3">
          {notes.highlights.map((h, i) => {
            const image = safeHttpUrl(h.imageUrl);
            return (
              <li key={i} className="rounded-xl border border-line bg-canvas/60 p-3.5">
                <p className="text-sm font-semibold">{h.title}</p>
                {h.text && <p className="mt-0.5 text-sm text-muted">{h.text}</p>}
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={h.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="mt-3 max-h-72 rounded-lg border border-line"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {GROUPS.map((g) =>
        grouped[g.id].length ? (
          <section key={g.id} aria-label={g.label}>
            <GroupBadge group={g.id} />
            <ul className="mt-2.5 grid gap-2">
              {grouped[g.id].map((item) => (
                <li key={item.id} className="flex gap-2 text-[15px] leading-snug">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-muted/60" aria-hidden="true" />
                  <span>
                    {item.text}
                    {item.refs.map((r) => {
                      const url = safeHttpUrl(r.url);
                      return url ? (
                        <a
                          key={r.url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1.5 font-mono text-xs text-muted underline-offset-2 hover:text-violet hover:underline"
                        >
                          {r.label}
                        </a>
                      ) : null;
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null,
      )}
    </div>
  );
}
