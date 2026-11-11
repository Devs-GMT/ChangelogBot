"use client";

import { useState } from "react";
import { Notice } from "@/components/ui/field";
import { ArrowRightIcon, GitHubIcon } from "@/components/ui/icons";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils/cn";
import { useComposer } from "../use-composer";

const EXAMPLES = [
  { repo: "vercel/next.js", note: "The React framework" },
  { repo: "shadcn-ui/ui", note: "Components you own" },
  { repo: "sindresorhus/got", note: "HTTP for Node.js" },
];

/** Step one, on its own: a single focused input (like an "import repository" screen), nothing else competing. */
export function RepoLauncher() {
  const { state, actions } = useComposer();
  const [value, setValue] = useState(state.input);
  const [pending, setPending] = useState<string | null>(null);
  const busy = state.loadingRepo;

  const load = (input: string) => {
    setPending(input);
    void actions.loadRepo(input);
  };

  return (
    <div className="relative isolate flex flex-1 justify-center overflow-hidden px-4 pb-16 pt-12 sm:pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-[46rem] max-w-[140%] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,rgb(110_86_207/0.14),transparent)]"
      />

      <div className="w-full max-w-xl">
        <div className="rise text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-line bg-paper shadow-card">
            <LogoMark className="size-8" />
          </span>
          <h1 className="mt-6 text-[clamp(1.9rem,5vw,2.6rem)] leading-[1.05] tracking-[-0.04em]">Write a changelog</h1>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
            Start with a public GitHub repository. You pick the versions next.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) load(value);
          }}
          className="rise mt-9"
          style={{ ["--i" as string]: 1 }}
        >
          <label htmlFor="repo-input" className="sr-only">
            GitHub repository
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-paper p-1.5 shadow-card transition focus-within:border-violet focus-within:ring-4 focus-within:ring-violet/10">
            <GitHubIcon className="ml-2.5 size-[18px] shrink-0 text-muted" />
            <input
              id="repo-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="owner/repo or GitHub URL"
              autoComplete="off"
              spellCheck={false}
              autoFocus
              className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-muted/70 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !value.trim()}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-medium text-white transition hover:bg-ink/85 disabled:bg-ink/25"
            >
              <span className="max-sm:sr-only">{busy && pending === value ? "Loading…" : "Continue"}</span>
              <ArrowRightIcon className="size-4" />
            </button>
          </div>
          {state.repoError && (
            <Notice tone="error" className="mt-3">
              {state.repoError}
            </Notice>
          )}
        </form>

        <div className="rise mt-10" style={{ ["--i" as string]: 2 }}>
          <p className="px-1 text-xs font-medium uppercase tracking-[0.08em] text-muted">Or try a popular repo</p>
          <ul className="mt-3 overflow-hidden rounded-2xl border border-line bg-paper shadow-card">
            {EXAMPLES.map(({ repo, note }) => {
              const loading = busy && pending === repo;
              return (
                <li key={repo} className="border-line [&:not(:first-child)]:border-t">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setValue(repo);
                      load(repo);
                    }}
                    className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas disabled:cursor-wait"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://github.com/${repo.split("/")[0]}.png?size=64`}
                      alt=""
                      width={32}
                      height={32}
                      className="size-8 shrink-0 rounded-lg border border-line bg-canvas"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[13px] text-ink">{repo}</span>
                      <span className="block truncate text-xs text-muted">{note}</span>
                    </span>
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full text-muted transition",
                        loading ? "animate-pulse bg-violet-soft text-violet" : "group-hover:bg-paper group-hover:text-ink",
                      )}
                    >
                      <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
