"use client";

import { useState } from "react";
import { StarIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Field, inputClass, Notice } from "@/components/ui/field";
import { useComposer } from "../use-composer";

const EXAMPLES = ["vercel/next.js", "shadcn-ui/ui", "sindresorhus/got"];

export function RepoStep() {
  const { state, actions } = useComposer();
  const [value, setValue] = useState(state.input);
  const loaded = state.repo && state.phase !== "repo";

  if (loaded && state.repo) {
    const r = state.repo;
    return (
      <section aria-label="Repository" className="rise border-b border-line p-5">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={r.avatarUrl} alt="" width={40} height={40} className="size-10 rounded-lg border border-line" />
          <div className="min-w-0 flex-1">
            <a
              href={r.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate font-display text-[15px] font-semibold hover:text-violet"
            >
              {r.fullName}
            </a>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <span className="flex items-center gap-1"><StarIcon className="size-3.5" /> {r.stars.toLocaleString("en-US")}</span>
              {r.language && <Chip>{r.language}</Chip>}
              <Chip>{state.tags.length} tags</Chip>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => actions.backTo("repo")}>
            Change
          </Button>
        </div>
        {r.description && <p className="mt-3 line-clamp-2 text-[13px] text-muted">{r.description}</p>}
      </section>
    );
  }

  return (
    <section aria-label="Repository" className="rise border-b border-line p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void actions.loadRepo(value);
        }}
        className="grid gap-3"
      >
        <h2 className="flex items-center gap-2 text-[15px]">
          <span className="tabular grid size-5 place-items-center rounded-full bg-violet-soft text-[11px] text-violet">1</span>
          Start with a repo
        </h2>
        <Field label="GitHub repository" htmlFor="repo-input" hint="Public repos only. Paste a URL or owner/repo.">
          <input
            id="repo-input"
            className={inputClass}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="github.com/owner/repo"
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />
        </Field>
        {state.repoError && <Notice tone="error">{state.repoError}</Notice>}
        <Button type="submit" disabled={state.loadingRepo || !value.trim()}>
          {state.loadingRepo ? "Loading repo…" : "Load repo"}
        </Button>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
          Try
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setValue(ex);
                void actions.loadRepo(ex);
              }}
              className="rounded-full border border-line px-2 py-0.5 font-mono hover:bg-canvas hover:text-ink"
            >
              {ex}
            </button>
          ))}
        </div>
      </form>
    </section>
  );
}
