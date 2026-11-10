import type { CommitInfo, Group, NoteItem, Ref } from "./types";

export interface ParsedConventional {
  type: string;
  scope: string | null;
  breaking: boolean;
  description: string;
}

const HEADER = /^(\w+)(?:\(([^)]*)\))?(!)?:\s+(.+)$/;
const BREAKING_FOOTER = /^BREAKING[ -]CHANGE:/m;

export function parseConventional(title: string, body = ""): ParsedConventional | null {
  const m = HEADER.exec(title.trim());
  if (!m) return null;
  return {
    type: m[1].toLowerCase(),
    scope: m[2] || null,
    breaking: Boolean(m[3]) || BREAKING_FOOTER.test(body),
    description: m[4].trim(),
  };
}

const TYPE_TO_GROUP: Record<string, Group> = {
  feat: "new",
  feature: "new",
  fix: "fixed",
  perf: "improved",
  refactor: "improved",
};

export function groupFor(parsed: ParsedConventional): Group | null {
  if (parsed.breaking) return "breaking";
  return TYPE_TO_GROUP[parsed.type] ?? null;
}

const upperFirst = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export function commitRefs(commit: CommitInfo, repoUrl: string): Ref[] {
  const refs: Ref[] = [];
  if (commit.prNumber) refs.push({ label: `#${commit.prNumber}`, url: `${repoUrl}/pull/${commit.prNumber}` });
  refs.push({ label: commit.sha.slice(0, 7), url: commit.url });
  return refs;
}

export interface Classified {
  items: NoteItem[];
  /** Commits Conventional Commits could not place — these go to the AI. */
  rest: CommitInfo[];
}

/** Conventional prefixes first; everything else is left for the AI. */
export function classifyCommits(commits: CommitInfo[], repoUrl: string): Classified {
  const items: NoteItem[] = [];
  const rest: CommitInfo[] = [];
  for (const commit of commits) {
    const parsed = parseConventional(commit.title, commit.body);
    const group = parsed ? groupFor(parsed) : null;
    if (parsed && group) {
      items.push({
        id: `c-${commit.sha.slice(0, 10)}`,
        group,
        text: upperFirst(parsed.description),
        refs: commitRefs(commit, repoUrl),
        hidden: false,
        source: "conventional",
      });
    } else {
      rest.push(commit);
    }
  }
  return { items, rest };
}
