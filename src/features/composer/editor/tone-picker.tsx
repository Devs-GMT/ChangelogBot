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
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[13px] font-medium">Tone</span>
      <Tabs label="Tone of voice" tabs={TONES} value={state.tone} onChange={(tone) => actions.patch({ tone })} />
      {changed && (
        <Button size="sm" disabled={busy} onClick={() => void actions.rewrite(state.tone)}>
          {busy ? "Rewriting…" : "Rewrite in this tone"}
        </Button>
      )}
      {changed && <span className="text-xs text-muted">Replaces the AI-written text and your edits.</span>}
    </div>
  );
}
