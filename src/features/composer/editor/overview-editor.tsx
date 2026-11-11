"use client";

import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { useComposer } from "../use-composer";

const isHttp = (v: string) => v === "" || (/^https?:\/\//i.test(v) && URL.canParse(v));

/** Summary + up to three highlights (with optional image / GIF URL). */
export function OverviewEditor() {
  const { state, actions } = useComposer();
  const notes = state.notes;
  if (!notes) return null;

  return (
    <section aria-label="Summary and highlights" className="grid gap-4 rounded-2xl border border-line bg-paper p-4 shadow-card">
      <Field label="Summary" htmlFor="summary" hint="Two short sentences at the top of the release.">
        <textarea
          id="summary"
          value={notes.summary}
          onChange={(e) => actions.setSummary(e.target.value)}
          rows={2}
          maxLength={600}
          className={`${inputClass} field-sizing-content h-auto min-h-16 py-2 leading-snug`}
        />
      </Field>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-medium">Highlights</h3>
          {notes.highlights.length < 3 && (
            <Button size="sm" variant="ghost" onClick={actions.addHighlight}>
              + Add
            </Button>
          )}
        </div>
        {notes.highlights.length === 0 && <p className="text-xs text-muted">No highlights yet.</p>}
        {notes.highlights.map((h, i) => {
          const badUrl = !isHttp(h.imageUrl ?? "");
          return (
            <div key={i} className="grid gap-2 rounded-xl border border-line bg-canvas/50 p-3 [&>*:not(:first-child)]:ml-8 [&>*:not(:first-child)]:w-[calc(100%-2rem)]">
              <div className="flex items-center gap-2">
                <span className="tabular grid size-6 shrink-0 place-items-center rounded-full bg-violet-soft text-[11px] font-semibold text-violet">
                  {i + 1}
                </span>
                <input
                  aria-label={`Highlight ${i + 1} title`}
                  value={h.title}
                  onChange={(e) => actions.editHighlight(i, { title: e.target.value })}
                  maxLength={80}
                  placeholder="Highlight title"
                  className={`${inputClass} min-w-0 font-medium`}
                />
                <button
                  type="button"
                  onClick={() => actions.removeHighlight(i)}
                  aria-label={`Remove highlight ${i + 1}`}
                  title="Remove"
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-breaking-soft hover:text-breaking"
                >
                  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>
              <input
                aria-label={`Highlight ${i + 1} description`}
                value={h.text}
                onChange={(e) => actions.editHighlight(i, { text: e.target.value })}
                maxLength={300}
                placeholder="One sentence for users"
                className={inputClass}
              />
              <div>
                <input
                  aria-label={`Highlight ${i + 1} image or GIF URL`}
                  value={h.imageUrl ?? ""}
                  onChange={(e) => actions.editHighlight(i, { imageUrl: e.target.value.trim() })}
                  placeholder="Image or GIF URL (optional)"
                  inputMode="url"
                  aria-invalid={badUrl}
                  className={inputClass}
                />
                {badUrl && <p className="mt-1 text-xs text-breaking">Use a full https:// link.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
