"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/field";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/sheet";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils/cn";
import { AppHeader } from "./app-header";
import { DraftingCanvas } from "./canvas/drafting-canvas";
import { ReadyCanvas } from "./canvas/ready-canvas";
import { RepoLauncher } from "./canvas/repo-launcher";
import { GroupBoard } from "./editor/group-board";
import { HiddenTray } from "./editor/hidden-tray";
import { OverviewEditor } from "./editor/overview-editor";
import { ReleaseHeader } from "./editor/release-header";
import { OutputTabs } from "./outputs/output-tabs";
import { PublishStep } from "./steps/publish-step";
import { RangeStep } from "./steps/range-step";
import { ReadingStep } from "./steps/reading-step";
import { RepoStep } from "./steps/repo-step";
import { ComposerProvider, useComposer } from "./use-composer";

function EditorCanvas() {
  const { state } = useComposer();
  if (state.reading === "loading" || state.drafting === "loading") return <DraftingCanvas />;
  if (!state.notes) return <ReadyCanvas />;

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4">
      {state.drafting === "fallback" && (
        <Notice tone="warn">
          The AI draft was unavailable, so notes come from Conventional Commit prefixes. Other commits are in the hidden
          list. Restore the ones you want.
        </Notice>
      )}
      <ReleaseHeader />
      <OverviewEditor />
      <GroupBoard />
      <HiddenTray />
    </div>
  );
}

function OutputsPane() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 flex h-12 items-center justify-between gap-3 border-b border-line bg-paper/90 px-5 backdrop-blur">
        <h2 className="text-sm">Outputs</h2>
        <span className="truncate text-xs text-muted">Copy anywhere, publish once</span>
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
  const working = state.reading === "loading" || state.drafting === "loading";

  if (state.phase === "repo") {
    return (
      <div className="flex min-h-dvh flex-col bg-canvas">
        <AppHeader />
        <RepoLauncher />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas lg:h-dvh">
      <AppHeader />
      <div
        className={cn(
          "grid flex-1 lg:min-h-0",
          hasNotes
            ? "lg:grid-cols-[288px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_minmax(0,400px)] 2xl:grid-cols-[320px_minmax(0,1fr)_minmax(0,460px)]"
            : "lg:grid-cols-[320px_minmax(0,1fr)]",
        )}
      >
        {/* Sidebar: repo, range, stats. On phones it gives way to the editor once notes exist. */}
        <aside
          aria-label="Repository and range"
          className={cn("min-w-0 border-line bg-paper max-lg:border-b lg:overflow-y-auto lg:border-r", composing && "max-lg:hidden")}
        >
          <RepoStep />
          <RangeStep />
          <ReadingStep />
        </aside>

        <main
          className={cn(
            "@container min-w-0 px-4 py-6 sm:px-6 lg:overflow-y-auto lg:px-8 lg:py-8",
            // Phones: the sidebar already holds the range form, so the main column only shows real work.
            !hasNotes && !working && "max-lg:hidden",
            hasNotes && !composing && !working && "max-lg:hidden",
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
