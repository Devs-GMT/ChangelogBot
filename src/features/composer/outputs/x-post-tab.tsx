"use client";

import { useState } from "react";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Notice } from "@/components/ui/field";
import { toXPost, toXThread, X_LIMIT, xIntentUrl, xLength } from "@/lib/changelog/outputs";
import type { ReleaseNotes } from "@/lib/changelog/types";
import { cn } from "@/lib/utils/cn";
import { requestXPost } from "../api";

export function XPostTab({ notes, pageUrl }: { notes: ReleaseNotes; pageUrl: string }) {
  const [aiPost, setAiPost] = useState<{ key: string; post: string; thread: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThread, setShowThread] = useState(false);

  // An AI post is tied to the notes it was written for; edits to the notes fall back to the generated post.
  const key = `${notes.version}|${notes.summary}|${notes.items.map((i) => i.text).join("|")}`;
  const ai = aiPost?.key === key ? aiPost : null;

  const post = ai?.post ?? toXPost(notes, pageUrl);
  const thread = ai && ai.thread.length ? ai.thread : toXThread(notes, pageUrl).slice(1);
  const len = xLength(post);

  const polish = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await requestXPost({
        repo: notes.repo,
        version: notes.version,
        tone: notes.tone,
        summary: notes.summary,
        items: notes.items.map((i) => ({ group: i.group, text: i.text })).slice(0, 60),
        url: pageUrl,
      });
      setAiPost({ key, ...res });
    } catch {
      setError("AI is unavailable right now — showing the generated post.");
    } finally {
      setBusy(false);
    }
  };

  const fullThread = [post, ...thread].join("\n\n— — —\n\n");

  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-line bg-paper p-4 shadow-card">
        <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">{post}</p>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-xs">
          <span className={cn("font-mono tabular-nums", len > X_LIMIT ? "text-breaking" : "text-muted")}>
            {len}/{X_LIMIT}
          </span>
          <span className="text-muted">{ai ? "Written by AI" : "Generated from your notes"}</span>
        </div>
      </div>

      {error && <Notice>{error}</Notice>}

      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={post} />
        <ButtonLink external size="sm" variant="secondary" href={xIntentUrl(post)}>
          Open in X <ArrowUpRightIcon className="size-3.5" />
        </ButtonLink>
        <Button size="sm" variant="ghost" disabled={busy} onClick={polish}>
          {busy ? "Writing…" : "Rewrite with AI"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowThread((v) => !v)}>
          {showThread ? "Hide thread" : "Thread version"}
        </Button>
      </div>

      {showThread && (
        <div className="grid gap-2">
          {thread.map((t, i) => (
            <p key={i} className="whitespace-pre-wrap rounded-lg border border-line bg-canvas px-3 py-2 text-[13px]">
              {t}
            </p>
          ))}
          <div>
            <CopyButton text={fullThread} label="Copy whole thread" />
          </div>
        </div>
      )}
    </div>
  );
}
