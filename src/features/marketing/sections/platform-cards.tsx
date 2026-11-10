import { Chip } from "@/components/ui/chip";
import { GroupBadge } from "@/components/ui/group-badge";
import { CheckIcon, FilterIcon, MailIcon, ShieldCheckIcon, SparkleIcon, TagIcon, TrendIcon, XLogoIcon } from "@/components/ui/icons";
import { Reveal } from "../animations/reveal";
import { Cell, Cells, Pad, Section, SectionHeading } from "./section-shell";

const TONES = [
  { name: "Friendly", line: "You can now switch to testnet in one click." },
  { name: "Professional", line: "Added one-click switching to the BOT Chain testnet." },
  { name: "Playful", line: "Testnet is one click away now. Go break things." },
];

export function PlatformCards() {
  return (
    <Section tone="canvas">
      <Reveal>
        <Pad className="py-20 sm:py-24">
          <SectionHeading
            title="Built for teams that **ship seriously**"
            description="Sensible defaults for the details that make a changelog trustworthy."
          />
        </Pad>

        <Cells className="md:grid-cols-2 lg:grid-cols-3">
          <Cell icon={TagIcon} title="Conventional Commits." body="feat:, fix:, perf: and ! are grouped instantly, without waiting for AI.">
            <div className="grid gap-2 rounded-xl border border-line bg-canvas/70 p-3.5 font-mono text-xs sm:grid-cols-2">
              <ul className="grid content-start gap-2 text-muted">
                <li><span className="text-new">feat:</span> add export panel</li>
                <li><span className="text-improved">perf:</span> cache the tag list</li>
                <li><span className="text-fixed">fix:</span> empty repo crash</li>
                <li><span className="text-breaking">feat!:</span> drop the v1 API</li>
              </ul>
              <ul className="grid content-start gap-2 font-sans">
                <li><GroupBadge group="new" /></li>
                <li><GroupBadge group="improved" /></li>
                <li><GroupBadge group="fixed" /></li>
                <li><GroupBadge group="breaking" /></li>
              </ul>
            </div>
          </Cell>
          <Cell icon={TrendIcon} title="Semver suggestion." body="Breaking bumps major, new bumps minor, fixes bump patch.">
            <div className="grid h-full min-h-28 content-center gap-2 rounded-xl border border-line bg-canvas/70 p-3.5 font-mono text-sm">
              <div className="flex items-center justify-between text-muted"><span>v1.3.0</span><span aria-hidden="true">→</span></div>
              <div className="flex gap-2">
                <Chip tone="breaking">v2.0.0</Chip>
                <Chip tone="violet" className="ring-1 ring-violet/30">v1.4.0</Chip>
                <Chip tone="neutral">v1.3.1</Chip>
              </div>
            </div>
          </Cell>
          <Cell icon={FilterIcon} title="Noise filter." body="Merges, chore:, ci:, dependency bumps and bots stay out until you want them in.">
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-line bg-canvas/70 p-3.5">
              {["Merge pull request", "chore: release", "ci: cache", "bump lodash", "dependabot[bot]"].map((t) => (
                <Chip key={t} className="font-mono line-through decoration-muted/50">{t}</Chip>
              ))}
            </div>
          </Cell>
          <Cell icon={ShieldCheckIcon} title="Verified maintainer." body="Put your wallet in a .changelogbot file and releases carry a Verified badge.">
            <div className="grid gap-2 rounded-xl border border-line bg-canvas/70 p-3.5">
              <p className="font-mono text-[11px] text-muted">.changelogbot</p>
              <p className="truncate rounded-md bg-paper px-2 py-1.5 font-mono text-xs">0x12ab…9f3c</p>
              <Chip tone="new" className="w-fit"><CheckIcon className="size-3.5" /> Verified maintainer</Chip>
            </div>
          </Cell>
          <Cell icon={XLogoIcon} title="X post and email." body="Under 280 characters, an optional thread, and a newsletter blurb.">
            <div className="grid gap-2 rounded-xl border border-line bg-canvas/70 p-3.5">
              <p className="rounded-lg border border-line bg-paper p-2.5 text-[13px] leading-snug">
                widgets v1.4.0 is out! One-click testnet switch, faster repos.
                <span className="tabular mt-1.5 block font-mono text-[11px] text-muted">128 / 280</span>
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted"><MailIcon className="size-3.5" /> plus a plain-text email</p>
            </div>
          </Cell>
          <Cell icon={SparkleIcon} title="Your tone of voice." body="Friendly, professional or playful. Rewrite the whole draft in one click.">
            <ul className="grid gap-2">
              {TONES.map((t, i) => (
                <li
                  key={t.name}
                  className={`rounded-xl border px-3 py-2.5 text-[13px] leading-snug ${
                    i === 0 ? "border-violet/30 bg-violet-soft/60" : "border-line bg-paper"
                  }`}
                >
                  <span className={`mb-0.5 block text-[11px] font-medium ${i === 0 ? "text-violet" : "text-muted"}`}>{t.name}</span>
                  {t.line}
                </li>
              ))}
            </ul>
          </Cell>
        </Cells>
      </Reveal>
    </Section>
  );
}
