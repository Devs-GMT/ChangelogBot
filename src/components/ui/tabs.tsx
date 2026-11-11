"use client";

import { useId, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/** Accessible tablist (arrow keys, roving tabindex). Panels are rendered by the caller. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
  label,
  size = "md",
  stretch = false,
}: {
  tabs: readonly TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  label: string;
  size?: "sm" | "md";
  /** Fill the row with equal-width tabs (narrow panes). */
  stretch?: boolean;
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
    <div role="tablist" aria-label={label} className={cn(
        "gap-1 rounded-xl border border-line bg-canvas p-1",
        stretch ? "grid w-full auto-cols-fr grid-flow-col" : "inline-flex",
        className,
      )}>
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
              "flex min-w-0 items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-colors",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-[13px]",
              active ? "bg-paper text-ink shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            {tab.icon && <tab.icon className="size-3.5 shrink-0" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
