"use client";

import Link from "next/link";
import { CheckIcon } from "@/components/ui/icons";
import { LogoMark } from "@/components/ui/logo";
import { GitHubButton } from "@/features/github-auth/github-button";
import { ConnectButton } from "@/features/wallet/connect-button";
import { cn } from "@/lib/utils/cn";
import { useComposer } from "./use-composer";

const STEPS = ["Repo", "Range", "Edit", "Publish"] as const;

/** 0-based index of the step the user is on. */
function currentStep(hasRepo: boolean, hasNotes: boolean): number {
  if (!hasRepo) return 0;
  return hasNotes ? 2 : 1;
}

function edgeLabel(edge: { kind: string; ref?: string; date?: string } | null | undefined) {
  if (!edge) return null;
  if (edge.kind === "ref") return edge.ref;
  if (edge.kind === "date") return edge.date;
  return "latest";
}

export function AppHeader() {
  const { state } = useComposer();
  const hasRepo = Boolean(state.repo) && state.phase !== "repo";
  const current = currentStep(hasRepo, Boolean(state.notes));
  const from = edgeLabel(state.from);

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-line bg-paper/90 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <Link href="/" aria-label="ChangelogBot home" className="shrink-0 rounded-md">
          <LogoMark className="size-7" />
        </Link>

        {/* Breadcrumb: where you are in the work. It gives way first when the buttons need room. */}
        <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-sm">
          <span aria-hidden="true" className="text-line">/</span>
          {hasRepo && state.repo ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={state.repo.avatarUrl} alt="" width={20} height={20} className="size-5 shrink-0 rounded-md border border-line" />
              <span className="min-w-0 truncate font-medium">{state.repo.fullName}</span>
              {from && (
                <>
                  <span aria-hidden="true" className="text-line max-md:hidden">/</span>
                  <span className="shrink-0 truncate font-mono text-xs text-muted max-md:hidden">
                    {from} → {state.version || edgeLabel(state.to)}
                  </span>
                </>
              )}
            </>
          ) : (
            <span className="min-w-0 truncate font-medium">New changelog</span>
          )}
        </nav>

        <ol aria-label="Progress" className="hidden shrink-0 items-center gap-1 xl:flex">
          {STEPS.map((label, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={label} className="flex items-center gap-1" aria-current={active ? "step" : undefined}>
                {i > 0 && <span aria-hidden="true" className={cn("h-px w-5", done || active ? "bg-violet/40" : "bg-line")} />}
                <span
                  className={cn(
                    "flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13px] transition-colors",
                    active ? "bg-violet-soft font-medium text-violet" : done ? "text-ink" : "text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "tabular grid size-5 place-items-center rounded-full text-[11px]",
                      active ? "bg-violet text-white" : done ? "bg-ink text-white" : "border border-line",
                    )}
                  >
                    {done ? <CheckIcon className="size-3" /> : i + 1}
                  </span>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 xl:ml-2 xl:border-l xl:border-line xl:pl-4">
          <GitHubButton size="sm" compact />
          <ConnectButton size="sm" compact />
        </div>
      </div>
      {/* Progress along the bottom edge */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-px h-px origin-left bg-violet transition-transform duration-700 ease-[var(--ease-out-expo)]"
        style={{ transform: `scaleX(${(current + 1) / STEPS.length})` }}
      />
    </header>
  );
}
