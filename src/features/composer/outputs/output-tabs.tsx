"use client";

import { useState } from "react";
import { ArrowUpRightIcon, GitHubIcon, LinkChainIcon, MailIcon, XLogoIcon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/button";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { publishableNotes } from "@/lib/changelog/notes-hash";
import { newGitHubReleaseUrl, toEmailText, toGitHubMarkdown } from "@/lib/changelog/outputs";
import { useOrigin } from "@/lib/hooks/use-origin";
import { useComposer } from "../use-composer";
import { TextOutputTab } from "./text-output-tab";
import { PagePreviewTab } from "./page-preview-tab";
import { XPostTab } from "./x-post-tab";

type TabId = "page" | "github" | "x" | "email";
const TABS: readonly TabItem<TabId>[] = [
  { id: "page", label: "Page", icon: LinkChainIcon },
  { id: "github", label: "GitHub", icon: GitHubIcon },
  { id: "x", label: "X", icon: XLogoIcon },
  { id: "email", label: "Email", icon: MailIcon },
];

export function OutputTabs() {
  const { state } = useComposer();
  const origin = useOrigin();
  const [tab, setTab] = useState<TabId>("page");
  const notes = state.notes;
  if (!notes) return null;

  const published = publishableNotes(notes);
  const pageUrl = `${origin}/c/${notes.repo}`;

  return (
    <section aria-label="Outputs" className="grid gap-3 p-5">
      <Tabs label="Output format" tabs={TABS} value={tab} onChange={setTab} stretch />

      {tab === "page" && <PagePreviewTab notes={published} />}
      {tab === "github" && (
        <TextOutputTab
          fileName={`release-${notes.version}.md`}
          text={toGitHubMarkdown(published)}
          extra={
            <ButtonLink external size="sm" variant="secondary" href={newGitHubReleaseUrl(notes.repo, notes.version)}>
              Open new release on GitHub <ArrowUpRightIcon className="size-3.5" />
            </ButtonLink>
          }
          hint="Paste this into the release description on GitHub."
        />
      )}
      {tab === "x" && <XPostTab notes={published} pageUrl={pageUrl} />}
      {tab === "email" && (
        <TextOutputTab
          fileName="newsletter.txt"
          text={toEmailText(published, pageUrl)}
          hint="Plain text, ready for your newsletter tool."
        />
      )}
    </section>
  );
}
