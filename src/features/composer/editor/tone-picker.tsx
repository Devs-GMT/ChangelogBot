"use client";

import { Button } from "@/components/ui/button";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import type { Tone } from "@/lib/changelog/types";
import { useComposer } from "../use-composer";

const TONES: readonly TabItem<Tone>[] = [
  { id: "friendly", label: "Friendly" },
  { id: "professional", label: "Professional" },
  { id: "playful", label: "Playful" },
];

export function TonePicker() {
  const { state, actions } = useComposer();
  const notes = state.notes;
  if (!notes) return null;
  const changed = state.tone !== notes.tone;
  const busy = state.drafting === "loading";

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-xs font-medium text-muted">Tone of voice</span>
        <Tabs label="Tone of voice" size="sm" tabs={TONES} value={state.tone} onChange={(tone) => actions.patch({ tone })} />
      </div>
      {changed && (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" disabled={busy} onClick={() => void actions.rewrite(state.tone)}>
            {busy ? "Rewriting…" : "Rewrite in this tone"}
          </Button>
          <span className="text-xs text-muted">Replaces the AI text and your edits.</span>
        </div>
      )}
    </div>
  );
}
