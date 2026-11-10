"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/field";
import { GroupBadge } from "@/components/ui/group-badge";
import { ArrowRightIcon, GitHubIcon, LinkChainIcon, SparkleIcon, TagIcon } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/sheet";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils/cn";
import { AppHeader } from "./app-header";
import { GroupBoard } from "./editor/group-board";
import { HiddenTray } from "./editor/hidden-tray";
import { OverviewEditor } from "./editor/overview-editor";
import { TonePicker } from "./editor/tone-picker";
import { OutputTabs } from "./outputs/output-tabs";
import { PublishStep } from "./steps/publish-step";
import { RangeStep } from "./steps/range-step";
import { ReadingStep } from "./steps/reading-step";
import { RepoStep } from "./steps/repo-step";
import { ComposerProvider, useComposer } from "./use-composer";

const EMPTY_STEPS = [
  { icon: GitHubIcon, title: "Paste a public repo", body: "Any GitHub URL or owner/repo." },
  { icon: TagIcon, title: "Pick a version range", body: "Two tags, or a date range." },
  { icon: SparkleIcon, title: "Review, then publish", body: "Drag, edit, copy, record." },
];

/** First-run canvas: a ghost of the board that will appear, so the empty space explains itself. */
function EmptyCanvas() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <div className="rise text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-line bg-paper text-violet shadow-card">
          <LinkChainIcon className="size-5" />
        </span>
        <h2 className="mt-5 text-[clamp(1.75rem,3vw,2.4rem)] leading-tight tracking-[-0.035em]">
          Your release notes will appear here
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-[15px] leading-relaxed text-muted">
          Load a repo on the left, pick two versions and press <strong className="font-medium text-ink">Read changes</strong>.
        </p>
      </div>

      <ol className="rise grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3" style={{ ["--i" as string]: 1 }}>
        {EMPTY_STEPS.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="flex gap-3 bg-paper p-4">
            <span className="tabular grid size-7 shrink-0 place-items-center rounded-full bg-violet-soft font-mono text-xs font-semibold text-violet">
              {i + 1}
            </span>
            <span className="text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                <Icon className="size-3.5 text-muted" /> {title}
              </span>
              <span className="mt-0.5 block text-[13px] text-muted">{body}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="rise grid gap-3 sm:grid-cols-3" aria-hidden="true" style={{ ["--i" as string]: 2 }}>
        {(["new", "improved", "fixed"] as const).map((g, i) => (
          <div key={g} className="rounded-2xl border border-dashed border-line bg-paper/70 p-4">
            <GroupBadge group={g} />
            <div className="mt-4 grid gap-2">
              {[11, 8, 10].map((w, j) => (
                <div
                  key={j}
                  className="h-2.5 animate-pulse rounded-full bg-line/80"
                  style={{ width: `${(w / 12) * 100}%`, animationDelay: `${(i * 3 + j) * 120}ms` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DraftingCanvas() {
  return (
    <div role="status" aria-label="Drafting release notes" className="mx-auto grid w-full max-w-3xl gap-3">
      <p className="flex items-center gap-2 text-sm text-muted">
        <span className="size-2 animate-pulse rounded-full bg-violet" aria-hidden="true" />
        Grouping changes and writing notes for your users…
      </p>
      <div className="h-28 animate-pulse rounded-2xl bg-paper" />
      <div className="grid gap-3 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-paper" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
    </div>
  );
}

function EditorCanvas() {
  const { state } = useComposer();
  if (state.drafting === "loading") return <DraftingCanvas />;
  if (!state.notes) return <EmptyCanvas />;

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4">
      {state.drafting === "fallback" && (
        <Notice tone="warn">
          The AI draft was unavailable, so notes come from Conventional Commit prefixes. Other commits are in the hidden
          list. Restore the ones you want.
        </Notice>
      )}
      <div className="rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted">{state.notes.repo}</p>
          <h2 className="text-2xl tracking-[-0.03em]">
            Release <span className="font-mono">{state.version || state.notes.version}</span>
          </h2>
        </div>
        <TonePicker />
      </div>
      <OverviewEditor />
      <GroupBoard />
      <HiddenTray />
    </div>
  );
}

function OutputsPane() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/90 px-5 py-3 backdrop-blur">
        <h2 className="text-[15px]">Outputs</h2>
        <span className="text-xs text-muted">Copy anywhere, publish once</span>
      </div>
      <div className="flex-1">
        <OutputTabs />
      </div>
      <div className="sticky bottom-0 bg-paper">
        <PublishStep />
      </div>
    </div>
  );
}

function Workspace() {
  const { state, actions } = useComposer();
  // The outputs pane only gets its own column when the editor can still breathe beside it.
  const desktop = useMediaQuery("(min-width: 1280px)");
  const [sheetOpen, setSheetOpen] = useState(false);
  const composing = state.phase === "compose" && state.notes;
  const hasNotes = Boolean(state.notes);

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <AppHeader />
      <div
        className={cn(
          "grid flex-1 lg:min-h-0",
          hasNotes
            ? "lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_minmax(0,420px)]"
            : "lg:grid-cols-[340px_minmax(0,1fr)]",
        )}
      >
        {/* Sidebar: repo, range, stats. On phones it gives way to the editor once notes exist. */}
        <aside
          aria-label="Repository and range"
          className={cn("border-line bg-paper lg:overflow-y-auto lg:border-r", composing && "max-lg:hidden")}
        >
          <RepoStep />
          <RangeStep />
          <ReadingStep />
        </aside>

        <main
          className={cn(
            "bg-dots min-w-0 px-4 py-8 sm:px-8 lg:overflow-y-auto lg:py-10",
            // On phones, once notes exist the editor only shows while composing (the sidebar shows otherwise).
            hasNotes && !composing && state.drafting !== "loading" && "max-lg:hidden",
            hasNotes && "max-xl:pb-28",
          )}
        >
          {composing && (
            <Button variant="ghost" size="sm" className="mb-4 lg:hidden" onClick={() => actions.backTo("range")}>
              <ArrowRightIcon className="size-3.5 rotate-180" /> Change range
            </Button>
          )}
          <EditorCanvas />
        </main>

        {desktop && hasNotes && (
          <aside aria-label="Outputs and publishing" className="min-w-0 border-l border-line bg-paper lg:overflow-y-auto">
            <OutputsPane />
          </aside>
        )}
      </div>

      {!desktop && composing && (
        <>
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 p-3 backdrop-blur">
            <Button size="lg" className="w-full" onClick={() => setSheetOpen(true)}>
              Outputs &amp; publish
            </Button>
          </div>
          <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Outputs & publish">
            {sheetOpen && (
              <div className="-m-4">
                <OutputTabs />
                <PublishStep />
              </div>
            )}
          </Sheet>
        </>
      )}
    </div>
  );
}

export function Composer() {
  return (
    <ComposerProvider>
      <Workspace />
    </ComposerProvider>
  );
}
