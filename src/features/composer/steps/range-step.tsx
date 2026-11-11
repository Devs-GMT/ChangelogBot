"use client";

import { Button } from "@/components/ui/button";
import { inputClass, Notice } from "@/components/ui/field";
import type { RangeEdge, RangeEnd } from "@/lib/github/types";
import { cn } from "@/lib/utils/cn";
import { useComposer } from "../use-composer";
import { PaneSection } from "./pane-section";

type FromMode = "tag" | "date";
type ToMode = "latest" | "tag" | "date";

/** Small segmented switch beside a field label (Tag / Date / Latest). */
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  if (options.length < 2) return null;
  return (
    <div role="radiogroup" aria-label={label} className="flex shrink-0 rounded-lg bg-canvas p-0.5 ring-1 ring-line">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn(
            "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
            value === v ? "bg-paper text-ink shadow-sm" : "text-muted hover:text-ink",
          )}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

function FieldRow({ label, htmlFor, control, children }: { label: string; htmlFor: string; control?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[13px] font-medium">
          {label}
        </label>
        {control}
      </div>
      {children}
    </div>
  );
}

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
        <select id={id} className={cn(inputClass, "font-mono")} value={edge.ref} onChange={(e) => onChange({ kind: "ref", ref: e.target.value })}>
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

  const busy = state.reading === "loading" || state.drafting === "loading";
  const invalidVersion = state.version.length > 20;

  return (
    <PaneSection title="Range">
      <div className="grid gap-4">
        {!hasTags && <Notice>This repo has no tags yet, so pick dates. “From” starts at the first commit.</Notice>}

        <FieldRow
          label="From"
          htmlFor="from-value"
          control={
            <Segmented<FromMode> label="From type" value={fromMode} onChange={setFromMode} options={hasTags ? [["tag", "Tag"], ["date", "Date"]] : [["date", "Date"]]} />
          }
        >
          {edgeInput(from, (e) => actions.patch({ from: e }), "from-value")}
        </FieldRow>

        <FieldRow
          label="To"
          htmlFor="to-value"
          control={
            <Segmented<ToMode>
              label="To type"
              value={toMode}
              onChange={setToMode}
              options={hasTags ? [["latest", "Latest"], ["tag", "Tag"], ["date", "Date"]] : [["latest", "Latest"], ["date", "Date"]]}
            />
          }
        >
          {to.kind === "latest" ? (
            <input id="to-value" className={inputClass} value={`Latest commit on ${repo.defaultBranch}`} disabled readOnly />
          ) : (
            edgeInput(to, (e) => actions.patch({ to: e }), "to-value")
          )}
        </FieldRow>

        <FieldRow label="New version" htmlFor="version">
          <input
            id="version"
            className={cn(inputClass, "font-mono")}
            value={state.version}
            onChange={(e) => actions.setVersion(e.target.value.trim())}
            placeholder="v1.4.0"
            maxLength={40}
            spellCheck={false}
            aria-invalid={invalidVersion}
            aria-describedby="version-hint"
          />
          <p id="version-hint" className={cn("text-xs", invalidVersion ? "text-breaking" : "text-muted")}>
            {invalidVersion
              ? "Max 20 characters."
              : state.notes
                ? "Suggested from the changes. Edit it if you like."
                : "Suggested automatically after reading."}
          </p>
        </FieldRow>

        <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-muted">
          <input
            type="checkbox"
            checked={state.includeNoise}
            onChange={(e) => actions.patch({ includeNoise: e.target.checked })}
            className="mt-0.5 size-4 shrink-0 accent-violet"
          />
          Include merges, chores, CI and dependency bumps
        </label>

        <Button onClick={() => void actions.readChanges()} disabled={busy || invalidVersion}>
          {state.reading === "loading" ? "Reading changes…" : state.drafting === "loading" ? "Drafting…" : state.notes ? "Read again" : "Read changes"}
        </Button>
      </div>
    </PaneSection>
  );
}
