import type { Group, ReleaseNotes } from "@/lib/changelog/types";

/** Sample commits used by the landing page demo — clearly illustrative, not customer data. */
export const DEMO_COMMITS: { raw: string; friendly: string; group: Group }[] = [
  {
    raw: "feat: add testnet switch to wallet menu",
    friendly: "You can now switch to BOT Chain testnet with one click",
    group: "new",
  },
  {
    raw: "feat(export): md + x post outputs",
    friendly: "Copy your notes as GitHub Markdown or an X post",
    group: "new",
  },
  {
    raw: "perf: cache tag list in localStorage",
    friendly: "Repos load instantly the second time you open them",
    group: "improved",
  },
  {
    raw: "refactor: drag handles on note cards",
    friendly: "Reordering notes feels smoother, on mobile too",
    group: "improved",
  },
  {
    raw: "fix: crash when repo has no tags",
    friendly: "Repos without tags no longer break the range picker",
    group: "fixed",
  },
  {
    raw: "fix(compare): handle >250 commits",
    friendly: "Huge ranges now tell you exactly how to split them",
    group: "fixed",
  },
];

export const DEMO_NOTES: ReleaseNotes = {
  repo: "acme/widgets",
  version: "v1.4.0",
  date: "2026-11-10",
  fromCommit: "a".repeat(40),
  toCommit: "b".repeat(40),
  tone: "friendly",
  summary: "Switching networks takes one click, repos load faster, and big ranges no longer get in your way.",
  highlights: [],
  items: DEMO_COMMITS.map((c, i) => ({
    id: `demo-${i}`,
    group: c.group,
    text: c.friendly,
    refs: [{ label: `#${120 + i}`, url: "https://github.com/acme/widgets/pull/" + (120 + i) }],
    hidden: false,
    source: "ai" as const,
  })),
};

/** Commit messages for the scrolling columns in "Write less, ship more". */
export const MARQUEE_COLUMNS: string[][] = [
  [
    "feat: add dark mode toggle",
    "fix: avatar flicker on first paint",
    "perf: lazy-load the settings page",
    "feat(api): cursor pagination for /events",
    "fix: wrong timezone in weekly digest",
    "refactor: split billing module",
    "feat: keyboard shortcuts for the editor",
    "fix(auth): refresh token race on slow networks",
  ],
  [
    "Add CSV export to the reports table",
    "fix: upload stalls at 99%",
    "feat!: drop support for Node 18",
    "perf: halve the dashboard bundle size",
    "feat(search): fuzzy matching on titles",
    "fix: duplicate emails on invite resend",
    "Improve empty states across the app",
    "feat: invite teammates by link",
  ],
  [
    "fix: webhook retries stop after 3 attempts",
    "feat: scheduled exports every Monday",
    "perf: index the audit log by actor",
    "feat(ui): compact table density option",
    "fix: tooltip hidden behind modals",
    "refactor: replace moment with date-fns",
    "feat: SSO for team workspaces",
    "fix: broken link in welcome email",
  ],
];
