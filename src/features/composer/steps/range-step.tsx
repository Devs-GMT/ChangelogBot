"use client";

import { Button } from "@/components/ui/button";
import { Field, inputClass, Notice } from "@/components/ui/field";
import type { RangeEdge, RangeEnd } from "@/lib/github/types";
import { useComposer } from "../use-composer";

type FromMode = "tag" | "date";
type ToMode = "latest" | "tag" | "date";

export function RangeStep() {
  const { state, actions } = useComposer();
  const { repo, tags, from, to } = state;
  if (!repo || state.phase === "repo") return null;

  const hasTags = tags.length > 0;
  const fromMode: FromMode = from?.kind === "ref" ? "tag" : "date";
  const toMode: ToMode = to.kind === "ref" ? "tag" : to.kind === "date" ? "date" : "latest";
  const createdDate = repo.createdAt.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const setFromMode = (m: FromMode) =>
    actions.patch({ from: m === "tag" ? { kind: "ref", ref: tags[0].name } : { kind: "date", date: createdDate } });
  const setToMode = (m: ToMode) =>
    actions.patch({
      to: m === "latest" ? { kind: "latest" } : m === "tag" ? { kind: "ref", ref: tags[0].name } : { kind: "date", date: today },
    });

  const edgeInput = (edge: RangeEdge | RangeEnd | null, onChange: (e: RangeEdge) => void, id: string) => {
    if (edge?.kind === "ref") {
      return (
        <select id={id} className={inputClass} value={edge.ref} onChange={(e) => onChange({ kind: "ref", ref: e.target.value })}>
          {tags.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      );
    }
    if (edge?.kind === "date") {
      return (
        <input id={id} type="date" className={inputClass} value={edge.date} max={today} onChange={(e) => onChange({ kind: "date", date: e.target.value })} />
      );
    }
    return null;
  };

  const modeSelect = <T extends string>(id: string, value: T, onChange: (v: T) => void, options: [T, string][]) => (
    <select id={id} className={inputClass} value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map(([v, label]) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  );

  const busy = state.reading === "loading" || state.drafting === "loading";
  const invalidVersion = state.version.length > 20;

  return (
    <section aria-label="Range" className="rise border-b border-line p-5">
      <h2 className="mb-3 flex items-center gap-2 text-[15px]">
        <span className="tabular grid size-5 place-items-center rounded-full bg-violet-soft text-[11px] text-violet">2</span>
        What changed?
      </h2>
      <div className="grid gap-3">
        {!hasTags && (
          <Notice>This repo has no tags yet — pick a date range. Start from the first commit with the default date.</Notice>
        )}

        <div className="grid grid-cols-[96px_1fr] items-end gap-2">
          <Field label="From" htmlFor="from-mode">
            {modeSelect<FromMode>("from-mode", fromMode, setFromMode, hasTags ? [["tag", "Tag"], ["date", "Date"]] : [["date", "Date"]])}
          </Field>
          <Field label="From (tag or date)" htmlFor="from-value" className="[&>label]:sr-only">
            {edgeInput(from, (e) => actions.patch({ from: e }), "from-value")}
          </Field>
        </div>

        <div className="grid grid-cols-[96px_1fr] items-end gap-2">
          <Field label="To" htmlFor="to-mode">
            {modeSelect<ToMode>(
              "to-mode",
              toMode,
              setToMode,
              hasTags
                ? [["latest", "Latest"], ["tag", "Tag"], ["date", "Date"]]
                : [["latest", "Latest"], ["date", "Date"]],
            )}
          </Field>
          <Field label="To (tag or date)" htmlFor="to-value" className="[&>label]:sr-only">
            {to.kind === "latest" ? (
              <input id="to-value" className={inputClass} value={`Latest commit (${repo.defaultBranch})`} disabled readOnly />
            ) : (
              edgeInput(to, (e) => actions.patch({ to: e }), "to-value")
            )}
          </Field>
        </div>

        <Field
          label="New version"
          htmlFor="version"
          hint={
            invalidVersion
              ? "Max 20 characters."
              : state.notes
                ? "Suggested from the changes (breaking → major, new → minor, fixes → patch)."
                : "Suggested automatically once changes are read."
          }
        >
          <input
            id="version"
            className={inputClass}
            value={state.version}
            onChange={(e) => actions.setVersion(e.target.value.trim())}
            placeholder="v1.4.0"
            maxLength={40}
            spellCheck={false}
            aria-invalid={invalidVersion}
          />
        </Field>

        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted">
          <input
            type="checkbox"
            checked={state.includeNoise}
            onChange={(e) => actions.patch({ includeNoise: e.target.checked })}
            className="size-4 accent-violet"
          />
          Include merges, chores, CI and dependency bumps
        </label>

        <Button onClick={() => void actions.readChanges()} disabled={busy || invalidVersion}>
          {state.reading === "loading" ? "Reading changes…" : state.drafting === "loading" ? "Drafting…" : state.notes ? "Read again" : "Read changes"}
        </Button>
      </div>
    </section>
  );
}
