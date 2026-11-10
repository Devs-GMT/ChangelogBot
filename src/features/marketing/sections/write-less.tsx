import { GroupBadge } from "@/components/ui/group-badge";
import { FileBox } from "@/components/ui/file-box";
import { toGitHubMarkdown } from "@/lib/changelog/outputs";
import { Marquee } from "../animations/marquee";
import { Reveal } from "../animations/reveal";
import { DEMO_NOTES, MARQUEE_COLUMNS } from "../hero-demo/demo-data";
import { Cell, Cells, Pad, Section, SectionHeading } from "./section-shell";
import { GitHubIcon, LinkChainIcon, SparkleIcon, TrendIcon } from "@/components/ui/icons";
import { TimelineMockup } from "./timeline-mockup";

const SPEEDS = [46, 34, 58];
const MARKDOWN = toGitHubMarkdown({ ...DEMO_NOTES, items: DEMO_NOTES.items.map((i) => ({ ...i, refs: [] })) });

function ChatPanel() {
  return (
    <div className="grid gap-3">
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-violet px-3.5 py-2 text-sm text-white">
        What changed since v1.3?
      </div>
      <div className="rounded-2xl rounded-bl-sm border border-line bg-canvas px-3.5 py-3 text-sm">
        <p className="tabular mb-2.5 font-mono text-[11px] text-muted">Read 42 commits · 7 PRs · 3 contributors</p>
        <p className="font-medium">Three things matter to users:</p>
        <ul className="mt-2.5 grid gap-2 text-[13.5px] leading-snug">
          <li className="flex items-start gap-2">
            <GroupBadge group="new" className="shrink-0" /> One-click switch to BOT Chain testnet
          </li>
          <li className="flex items-start gap-2">
            <GroupBadge group="improved" className="shrink-0" /> Repos load instantly on repeat visits
          </li>
          <li className="flex items-start gap-2">
            <GroupBadge group="fixed" className="shrink-0" /> Repos without tags work again
          </li>
        </ul>
      </div>
    </div>
  );
}

export function WriteLess() {
  return (
    <Section id="examples" blocks="pair">
      <Reveal>
        <Pad className="py-20 sm:py-24">
          <SectionHeading
            align="center"
            title="**Write less,** ship more"
            description="Your commit messages are already the first draft. ChangelogBot turns them into notes users actually read."
          />
        </Pad>

        <Cells className="lg:grid-cols-2">
          <Cell
            icon={SparkleIcon}
            title="Start from what you have."
            body="Terse commit titles, scopes and PR numbers. Nothing new to write or maintain."
            visualClassName="-mx-6 sm:-mx-8"
          >
            <div className="grid grid-cols-2 gap-3 px-6 sm:grid-cols-3 sm:px-8">
              {MARQUEE_COLUMNS.map((items, i) => (
                <div key={i} className={i === 2 ? "hidden sm:block" : undefined}>
                  <Marquee items={items} duration={SPEEDS[i]} />
                </div>
              ))}
            </div>
          </Cell>

          <Cell
            icon={TrendIcon}
            title="Ask what changed."
            body="Every range gets a two-line summary and up to three highlights, written for the people who use your product."
          >
            <ChatPanel />
          </Cell>

          <Cell
            icon={GitHubIcon}
            title="Ready for GitHub."
            body="Markdown for the release page, with groups, highlights and links to every pull request."
          >
            <FileBox
              name="release-v1.4.0.md"
              className="shadow-none"
              bodyClassName="max-h-64 overflow-hidden whitespace-pre-wrap text-[12px] [mask-image:linear-gradient(to_bottom,#000_65%,transparent)]"
            >
              {MARKDOWN}
            </FileBox>
          </Cell>

          <Cell
            icon={LinkChainIcon}
            title="A public changelog."
            body="One page per repo with every recorded release, newest first, verified maintainers on top."
          >
            <TimelineMockup />
          </Cell>
        </Cells>
      </Reveal>
    </Section>
  );
}
