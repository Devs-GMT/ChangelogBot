"use client";

import { Button } from "@/components/ui/button";
import { useComposer } from "../use-composer";

/** Items the maintainer hid (or that the AI left out). They are never published unless restored. */
export function HiddenTray() {
  const { state, actions } = useComposer();
  const hidden = state.notes?.items.filter((i) => i.hidden) ?? [];
  if (!hidden.length) return null;

  return (
    <details className="rounded-xl border border-line bg-paper">
      <summary className="cursor-pointer px-4 py-3 text-[13px] font-medium text-muted hover:text-ink">
        Hidden items ({hidden.length}) — not published
      </summary>
      {/* grid-cols-1 + min-w-0: without them a long commit title stretches the whole page sideways. */}
      <ul className="grid grid-cols-1 gap-1.5 border-t border-line p-3">
        {hidden.map((item) => (
          <li key={item.id} className="flex min-w-0 items-center gap-2 rounded-lg bg-canvas px-3 py-2 text-[13px]">
            <span className="min-w-0 flex-1 truncate text-muted" title={item.text}>
              {item.text || "(empty)"}
            </span>
            <Button size="sm" variant="secondary" onClick={() => actions.toggleHidden(item.id)}>
              Restore
            </Button>
          </li>
        ))}
      </ul>
    </details>
  );
}
