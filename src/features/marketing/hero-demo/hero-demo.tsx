"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { FileBox } from "@/components/ui/file-box";
import { GroupBadge } from "@/components/ui/group-badge";
import { CheckIcon, GitHubIcon, LinkChainIcon, SparkleIcon } from "@/components/ui/icons";
import type { TabItem } from "@/components/ui/tabs";
import { NotesBody } from "@/features/changelog-page/notes-body";
import { RecordedChip } from "@/features/changelog-page/recorded-chip";
import { toGitHubMarkdown } from "@/lib/changelog/outputs";
import type { Group } from "@/lib/changelog/types";
import { cn } from "@/lib/utils/cn";
import { FULL_MOTION, Flip, gsap, REDUCED_MOTION, ScrollTrigger, useGSAP } from "../animations/gsap";
import { DEMO_COMMITS, DEMO_NOTES } from "./demo-data";

type TabId = "draft" | "page" | "github";
const TABS: readonly TabItem<TabId>[] = [
  { id: "draft", label: "Draft" },
  { id: "page", label: "Changelog page" },
  { id: "github", label: "GitHub Release" },
];

const TAB_ICONS: Record<TabId, (p: { className?: string }) => React.ReactElement> = {
  draft: SparkleIcon,
  page: LinkChainIcon,
  github: GitHubIcon,
};

const DEMO_GROUPS: Group[] = ["new", "improved", "fixed"];
const DOT: Record<Group, string> = {
  new: "bg-new",
  improved: "bg-improved",
  fixed: "bg-fixed",
  breaking: "bg-breaking",
};

/** Notes without PR links: the long URLs wrap badly inside a small demo window. */
const DEMO_PLAIN = { ...DEMO_NOTES, items: DEMO_NOTES.items.map((i) => ({ ...i, refs: [] })) };
const DEMO_MARKDOWN = toGitHubMarkdown(DEMO_PLAIN);

export function HeroDemo() {
  const root = useRef<HTMLDivElement>(null);
  const replay = useRef<(() => void) | null>(null);
  const [tab, setTab] = useState<TabId>("draft");

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-item]", el);
      const rawList = el.querySelector<HTMLElement>("[data-raw]")!;
      const dropzone = (g: string) => el.querySelector<HTMLElement>(`[data-drop="${g}"]`)!;
      const chip = el.querySelector<HTMLElement>("[data-chip]")!;
      const status = el.querySelector<HTMLElement>("[data-status]")!;
      const textOf = (item: HTMLElement) => item.querySelector<HTMLElement>("[data-text]")!;

      /** Puts every item back in the raw list with its commit-message text. */
      const reset = () => {
        items.forEach((item, i) => {
          rawList.appendChild(item);
          textOf(item).textContent = DEMO_COMMITS[i].raw;
          item.classList.add("font-mono");
          gsap.set(item, { clearProps: "transform,opacity" });
        });
        gsap.set(chip, { opacity: 0, scale: 0.85 });
        status.textContent = "Reading 42 commits…";
      };

      /**
       * End state for reduced motion: the raw log stays on the left and a clone of each row
       * (with its friendly sentence) sits in its group on the right, so both columns stay populated.
       */
      const showFinal = () => {
        // Idempotent: effects run twice in React StrictMode, so clear the groups before cloning.
        DEMO_GROUPS.forEach((g) => dropzone(g).replaceChildren());
        items.forEach((item, i) => {
          const copy = item.cloneNode(true) as HTMLElement;
          copy.removeAttribute("data-item");
          copy.classList.remove("font-mono");
          copy.querySelector<HTMLElement>("[data-text]")!.textContent = DEMO_COMMITS[i].friendly;
          dropzone(DEMO_COMMITS[i].group).appendChild(copy);
        });
        gsap.set(chip, { opacity: 1, scale: 1 });
        status.textContent = "42 commits · 7 pull requests · 3 contributors";
      };

      const mm = gsap.matchMedia();
      let tl: gsap.core.Timeline | null = null;

      mm.add(REDUCED_MOTION, showFinal);

      mm.add(FULL_MOTION, () => {
        const run = () => {
          tl?.kill();
          reset();
          tl = gsap.timeline();
          tl.from(items, { opacity: 0, y: 14, duration: 0.4, stagger: 0.13, ease: "power2.out" });
          tl.add(() => {
            status.textContent = "42 commits · 7 pull requests · 3 contributors";
          }, "+=0.2");
          // Sort themselves into New / Improved / Fixed.
          tl.add(() => {
            const state = Flip.getState(items);
            items.forEach((item, i) => dropzone(DEMO_COMMITS[i].group).appendChild(item));
            Flip.from(state, { duration: 0.9, ease: "power2.inOut", stagger: 0.07 });
          }, "+=0.7");
          // Messy titles become friendly sentences.
          items.forEach((item, i) => {
            tl!.add(() => item.classList.remove("font-mono"), i === 0 ? "+=1.5" : "<0.12");
            tl!.to(textOf(item), { duration: 0.9, text: { value: DEMO_COMMITS[i].friendly }, ease: "none" }, "<");
          });
          tl.to(chip, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.2)" }, "+=0.25");
        };

        replay.current = run;
        reset();
        // The window rises out of the dotted stage as the page scrolls.
        const win = el.querySelector<HTMLElement>("[data-window]")!;
        const settle = gsap.fromTo(
          win,
          { scale: 0.955, y: 28 },
          { scale: 1, y: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "top 30%", scrub: 0.6 } },
        );
        const trigger = ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: run });
        return () => {
          trigger.kill();
          settle.scrollTrigger?.kill();
          settle.kill();
          tl?.kill();
          replay.current = null;
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div id="demo" ref={root} className="scroll-mt-24">
      {/* Big tabs that run rail to rail */}
      <div role="tablist" aria-label="Demo views" className="grid grid-cols-3 border-t border-line">
        {TABS.map((t, i) => {
          const Icon = TAB_ICONS[t.id];
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex h-12 items-center justify-center gap-2 text-[13px] transition-colors sm:h-14 sm:text-sm",
                i > 0 && "border-l border-line",
                active ? "bg-paper font-medium text-ink" : "bg-canvas/60 text-muted hover:bg-paper hover:text-ink",
              )}
            >
              <Icon className={cn("size-4 max-sm:hidden", active && "text-violet")} />
              {t.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 bottom-0 h-0.5 origin-center bg-ink transition-transform duration-300",
                  active ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          );
        })}
      </div>

      <div data-stage className="border-t bg-canvas border-line px-3 py-6 sm:px-10 sm:py-12">
      <div data-window className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-line bg-paper shadow-float">
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-line bg-canvas px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <i className="size-2.5 rounded-full bg-[#ff5f57]/80" />
            <i className="size-2.5 rounded-full bg-[#febc2e]/80" />
            <i className="size-2.5 rounded-full bg-[#28c840]/80" />
          </span>
          <span className="mx-auto truncate rounded-md border border-line bg-paper px-3 py-1 font-mono text-[11px] text-muted">
            {tab === "draft" ? "changelogbot.app/app" : tab === "page" ? "changelogbot.app/c/acme/widgets" : "github.com/acme/widgets/releases/new"}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => replay.current?.()}
            className={cn(tab !== "draft" && "invisible")}
          >
            Replay
          </Button>
        </div>

        <div className="grid p-3 sm:p-4 [&>*]:col-start-1 [&>*]:row-start-1">
          {/* Draft: commits sort themselves into groups */}
          <div
            aria-hidden={tab !== "draft"}
            className={cn(
              "grid gap-3 transition-opacity duration-300 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
              tab !== "draft" && "invisible opacity-0",
            )}
          >
            <FileBox name="git log v1.3.0..HEAD" className="shadow-none" bodyClassName="grid content-start gap-3 md:min-h-[19rem]">
              <p data-status className="tabular text-xs text-muted" aria-live="polite" />
              <div data-raw className="grid content-start gap-1.5">
                {DEMO_COMMITS.map((c) => (
                  <div
                    key={c.raw}
                    data-item
                    className="flex items-center gap-2 rounded-md border border-line bg-paper px-2.5 py-1.5 font-mono text-[12px] leading-snug"
                  >
                    <i className={cn("size-1.5 shrink-0 rounded-full", DOT[c.group])} aria-hidden="true" />
                    <span data-text>{c.raw}</span>
                  </div>
                ))}
              </div>
            </FileBox>

            <div className="grid content-start gap-3 rounded-xl border border-line bg-canvas p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-semibold">Release notes</span>
                <span data-chip className="opacity-0">
                  <Chip tone="violet">
                    <CheckIcon className="size-3.5" /> v1.4.0 · Recorded on BOT Chain
                  </Chip>
                </span>
              </div>
              {DEMO_GROUPS.map((g) => (
                <div key={g} className="grid gap-1.5">
                  <GroupBadge group={g} className="w-fit" />
                  <div data-drop={g} className="grid min-h-8 content-start gap-1.5" />
                </div>
              ))}
            </div>
          </div>

          <div
            aria-hidden={tab !== "page"}
            className={cn(
              "rounded-xl border border-line bg-paper p-4 transition-opacity duration-300 sm:p-6",
              tab !== "page" && "invisible opacity-0",
            )}
          >
            <div className="grid gap-4 md:grid-cols-[140px_minmax(0,1fr)] md:gap-8">
              <div>
                <p className="font-mono text-lg font-semibold">{DEMO_NOTES.version}</p>
                <p className="text-sm text-muted">Nov 10, 2026</p>
              </div>
              <div className="grid gap-4">
                <RecordedChip
                  recorded={{
                    verified: true,
                    publisher: "0x12ab00000000000000000000000000000000f3c1",
                    explorerUrl: "https://scan.botchain.ai",
                  }}
                />
                <NotesBody notes={DEMO_PLAIN} />
              </div>
            </div>
          </div>

          <div
            aria-hidden={tab !== "github"}
            className={cn("transition-opacity duration-300", tab !== "github" && "invisible opacity-0")}
          >
            <FileBox name="release-v1.4.0.md" className="shadow-none" bodyClassName="whitespace-pre-wrap">
              {DEMO_MARKDOWN}
            </FileBox>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
