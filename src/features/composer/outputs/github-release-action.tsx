"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/field";
import { ArrowUpRightIcon, CheckIcon } from "@/components/ui/icons";
import { GitHubButton } from "@/features/github-auth/github-button";
import { useGitHubSession } from "@/features/github-auth/use-github-session";
import { newGitHubReleaseUrl } from "@/lib/changelog/outputs";
import type { ReleaseNotes } from "@/lib/changelog/types";
import { createGitHubRelease } from "../api";

type Result = { version: string; url: string } | null;

/** Signed in: create the GitHub Release in one click. Otherwise: open GitHub's form to paste into. */
export function GitHubReleaseAction({ notes, markdown }: { notes: ReleaseNotes; markdown: string }) {
  const github = useGitHubSession();
  const [draft, setDraft] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Result>(null);

  const openForm = (
    <ButtonLink external size="sm" variant="secondary" href={newGitHubReleaseUrl(notes.repo, notes.version)}>
      Open new release on GitHub <ArrowUpRightIcon className="size-3.5" />
    </ButtonLink>
  );

  if (!github.user) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {openForm}
        {github.configured && (
          <>
            <span className="text-xs text-muted">or create it directly:</span>
            <GitHubButton />
          </>
        )}
      </div>
    );
  }

  const done = created?.version === notes.version ? created : null;
  if (done) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <span className="inline-flex items-center gap-1.5 font-medium text-new">
          <CheckIcon className="size-4" /> GitHub release created
        </span>
        <ButtonLink external size="sm" variant="secondary" href={done.url}>
          View on GitHub <ArrowUpRightIcon className="size-3.5" />
        </ButtonLink>
      </div>
    );
  }

  const tooLong = notes.version.length > 40;
  const create = async () => {
    setError(null);
    setCreating(true);
    try {
      const { url } = await createGitHubRelease({
        repo: notes.repo,
        tag: notes.version,
        body: markdown,
        targetCommitish: notes.toCommit,
        draft,
      });
      setCreated({ version: notes.version, url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the release.");
      void github.refresh(); // a 401 clears the session; show "Sign in" again
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="grid w-full gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => void create()} disabled={creating || !notes.version || tooLong}>
          {creating ? "Creating…" : `Create release ${notes.version}`}
        </Button>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted">
          <input
            type="checkbox"
            checked={draft}
            onChange={(e) => setDraft(e.target.checked)}
            className="size-3.5 accent-violet"
          />
          Save as draft
        </label>
      </div>
      <p className="text-xs text-muted">
        As <span className="font-medium text-ink">@{github.user.login}</span>. If the tag doesn’t exist yet, GitHub creates it on{" "}
        <code className="font-mono">{notes.toCommit.slice(0, 7)}</code>.
      </p>
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  );
}
