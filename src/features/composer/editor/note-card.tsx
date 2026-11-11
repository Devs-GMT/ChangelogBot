"use client";

import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { cn } from "@/lib/utils/cn";
import { GROUPS, type Group, type NoteItem } from "@/lib/changelog/types";

export interface NoteCardProps {
  item: NoteItem;
  onEdit?: (text: string) => void;
  onHide?: () => void;
  onMove?: (group: Group) => void;
  handleProps?: { attributes: DraggableAttributes; listeners: SyntheticListenerMap | undefined };
  overlay?: boolean;
}

export function NoteCard({ item, onEdit, onHide, onMove, handleProps, overlay }: NoteCardProps) {
  return (
    <div
      className={cn(
        "group/note rounded-xl border border-line bg-paper p-2.5 text-sm shadow-card transition hover:-translate-y-px hover:border-violet/30",
        overlay && "shadow-float ring-1 ring-violet/30",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label="Drag to reorder or move to another group"
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-1 text-muted/70 hover:bg-canvas hover:text-ink active:cursor-grabbing"
          {...handleProps?.attributes}
          {...handleProps?.listeners}
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden="true">
            <circle cx="5.5" cy="4" r="1.2" />
            <circle cx="10.5" cy="4" r="1.2" />
            <circle cx="5.5" cy="8" r="1.2" />
            <circle cx="10.5" cy="8" r="1.2" />
            <circle cx="5.5" cy="12" r="1.2" />
            <circle cx="10.5" cy="12" r="1.2" />
          </svg>
        </button>
        <textarea
          value={item.text}
          onChange={(e) => onEdit?.(e.target.value)}
          readOnly={!onEdit}
          rows={1}
          maxLength={400}
          aria-label="Release note text"
          placeholder="Describe the change for users…"
          className="field-sizing-content min-h-[1.75rem] w-full resize-none rounded bg-transparent px-1 py-0.5 leading-snug focus:bg-canvas focus:outline-none"
        />
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 pl-8">
        {item.refs.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-muted underline-offset-2 hover:text-violet hover:underline"
          >
            {r.label}
          </a>
        ))}
        {item.source === "ai" && <span className="text-[11px] text-violet">AI</span>}
        <span className="ml-auto flex items-center gap-1">
          {onMove && (
            <select
              aria-label="Move to group"
              value={item.group}
              onChange={(e) => onMove(e.target.value as Group)}
              className="rounded border border-transparent bg-transparent py-0.5 text-[11px] text-muted hover:border-line focus:border-violet focus:outline-none"
            >
              {GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.emoji} {g.label}
                </option>
              ))}
            </select>
          )}
          {onHide && (
            <button
              type="button"
              onClick={onHide}
              className="rounded px-1.5 py-0.5 text-[11px] text-muted hover:bg-canvas hover:text-ink"
            >
              Hide
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
