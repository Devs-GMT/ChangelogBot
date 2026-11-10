import { GroupBadge } from "@/components/ui/group-badge";
import { CheckIcon, GitHubIcon, LinkChainIcon, MailIcon, SparkleIcon, TagIcon, UsersIcon, XLogoIcon } from "@/components/ui/icons";
import { LogoMark } from "@/components/ui/logo";
import { siteConfig } from "@/config/site";
import { Reveal } from "../animations/reveal";
import { PixelBlocks } from "../illustrations/pixel-blocks";
import { Cell, Cells, Pad, Section, SectionHeading } from "./section-shell";

const ORBIT = [
  { icon: GitHubIcon, label: "Repo" },
  { icon: TagIcon, label: "Tags" },
  { icon: LinkChainIcon, label: "Pull requests" },
  { icon: UsersIcon, label: "Contributors" },
  { icon: CheckIcon, label: "Releases" },
  { icon: SparkleIcon, label: "Commits" },
];

/** What gets read from GitHub, orbiting the product mark. */
function ConnectMock() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[15rem]">
      <div className="absolute inset-[14%] rounded-full border border-dashed border-line" aria-hidden="true" />
      <div className="orbit absolute inset-0" style={{ ["--orbit-duration" as string]: "48s" }}>
        {ORBIT.map(({ icon: Icon, label }, i) => {
          const angle = (360 / ORBIT.length) * i;
          return (
            <div key={label} className="absolute inset-0" style={{ rotate: `${angle}deg` }}>
              <div className="absolute left-1/2 top-[14%] -translate-x-1/2 -translate-y-1/2" style={{ rotate: `${-angle}deg` }}>
                <span
                  className="orbit-counter grid size-10 place-items-center rounded-xl border border-line bg-paper shadow-card"
                  style={{ ["--orbit-duration" as string]: "48s" }}
                  title={label}
                >
                  <Icon className="size-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="grid size-16 place-items-center rounded-2xl border border-line bg-paper shadow-[0_14px_34px_-12px_rgb(110_86_207/0.55)]">
          <LogoMark className="size-10" />
        </span>
      </div>
    </div>
  );
}

function GroupMock() {
  const rows = [
    { raw: "feat: add testnet switch", group: "new" as const },
    { raw: "perf: cache tag list", group: "improved" as const },
    { raw: "fix: crash on empty repo", group: "fixed" as const },
    { raw: "feat!: drop v1 endpoints", group: "breaking" as const },
  ];
  return (
    <ul className="grid gap-1.5">
      {rows.map((r) => (
        <li key={r.raw} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-paper px-2.5 py-1.5">
          <span className="truncate font-mono text-xs text-muted">{r.raw}</span>
          <GroupBadge group={r.group} />
        </li>
      ))}
    </ul>
  );
}

function PublishMock() {
  const outputs = [
    { icon: LinkChainIcon, label: "Changelog page", note: "/c/acme/widgets" },
    { icon: GitHubIcon, label: "GitHub Release", note: "release-v1.4.0.md" },
    { icon: XLogoIcon, label: "X post", note: "128 / 280" },
    { icon: MailIcon, label: "Email summary", note: "plain text" },
  ];
  return (
    <ul className="grid gap-1.5">
      {outputs.map(({ icon: Icon, label, note }) => (
        <li key={label} className="flex items-center gap-2.5 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-[13px]">
          <Icon className="size-4 text-violet" />
          <span className="font-medium">{label}</span>
          <span className="ml-auto font-mono text-[11px] text-muted">{note}</span>
          <CheckIcon className="size-3.5 text-new" />
        </li>
      ))}
    </ul>
  );
}

export function ConnectCards() {
  return (
    <Section id="product">
      <Reveal>
        <Pad className="py-20 sm:py-24">
          <SectionHeading
            title="ChangelogBot **connects** your repo, **writes** the notes and **records** every release"
            description="From git history to a changelog your users enjoy, in three moves. No login, no install."
          />
        </Pad>

        <Cells className="lg:grid-cols-3">
          <Cell
            icon={GitHubIcon}
            title="Connect your repo."
            body="Paste a GitHub URL. Tags, releases, pull requests and contributors load right in your browser."
          >
            <ConnectMock />
          </Cell>
          <Cell
            icon={TagIcon}
            title="Group what changed."
            body="Conventional Commit prefixes are used first. AI handles the rest, and only describes what the commits say."
          >
            <GroupMock />
          </Cell>
          <Cell
            icon={LinkChainIcon}
            title="Publish everywhere."
            body="A public changelog page, GitHub Release Markdown, an X post and an email summary, from one set of notes."
          >
            <PublishMock />
          </Cell>
        </Cells>

        <figure className="relative overflow-hidden border-t border-line px-5 py-28 text-center sm:py-36">
          <PixelBlocks corner="tl" />
          <PixelBlocks corner="br" />
          <blockquote
            data-reveal
            className="relative mx-auto max-w-2xl font-display text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.15] tracking-[-0.03em]"
          >
            &ldquo;{siteConfig.maker.quote}&rdquo;
          </blockquote>
          <figcaption data-reveal className="relative mt-6 flex items-center justify-center gap-2.5 text-sm text-muted">
            <LogoMark className="size-6" />
            {siteConfig.maker.name}
          </figcaption>
        </figure>
      </Reveal>
    </Section>
  );
}
