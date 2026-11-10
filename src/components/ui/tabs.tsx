"use client";

import { useId, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface TabItem<T extends string> {
  id: T;
  label: string;
}

/** Accessible tablist (arrow keys, roving tabindex). Panels are rendered by the caller. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
  label,
}: {
  tabs: readonly TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  label: string;
}) {
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (index + dir + tabs.length) % tabs.length;
    refs.current[next]?.focus();
    onChange(tabs[next].id);
  };

  return (
    <div role="tablist" aria-label={label} className={cn("inline-flex gap-1 rounded-xl border border-line bg-canvas p-1", className)}>
      {tabs.map((tab, i) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${base}-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              active ? "bg-paper text-ink shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
