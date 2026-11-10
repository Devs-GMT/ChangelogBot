import { commitRefs } from "./conventional";
import { GROUPS, type CommitInfo, type Group, type Highlight, type NoteItem } from "./types";

export interface AiDraft {
  items: { group: Group; text: string; commitIds: string[] }[];
  summary: string;
  highlights: { title: string; text: string }[];
}

/**
 * Combines Conventional-Commit items with the AI draft for the remaining commits.
 * - AI entries link to the commits they were based on (ids are the first 10 chars of the sha).
 * - Commits the AI did not use (or all of them, if the AI failed) become hidden items,
 *   so nothing is lost and the maintainer can restore them from the "Hidden" tray.
 */
export function assembleItems(args: {
  classified: NoteItem[];
  rest: CommitInfo[];
  ai: AiDraft | null;
  repoUrl: string;
}): NoteItem[] {
  const { classified, rest, ai, repoUrl } = args;
  const byId = new Map(rest.map((c) => [c.sha.slice(0, 10), c]));
  const used = new Set<string>();
  const items: NoteItem[] = [...classified];

  ai?.items.forEach((entry, index) => {
    const commits = entry.commitIds.map((id) => byId.get(id)).filter((c): c is CommitInfo => Boolean(c));
    if (!commits.length) return;
    commits.forEach((c) => used.add(c.sha));
    const refs = dedupeRefs(commits.flatMap((c) => commitRefs(c, repoUrl)));
    items.push({
      id: `a-${index}-${commits[0].sha.slice(0, 8)}`,
      group: entry.group,
      text: entry.text,
      refs,
      hidden: false,
      source: "ai",
    });
  });

  for (const c of rest) {
    if (used.has(c.sha)) continue;
    items.push({
      id: `r-${c.sha.slice(0, 10)}`,
      group: "improved",
      text: c.title,
      refs: commitRefs(c, repoUrl),
      hidden: true,
      source: "manual",
    });
  }
  return items;
}

function dedupeRefs(refs: { label: string; url: string }[]) {
  const seen = new Set<string>();
  return refs.filter((r) => (seen.has(r.url) ? false : (seen.add(r.url), true)));
}

/** Used when the AI is unavailable: simple counts, and the first new items as highlights. */
export function fallbackSummary(items: NoteItem[]): { summary: string; highlights: Highlight[] } {
  const visible = items.filter((i) => !i.hidden);
  const parts = GROUPS.map((g) => ({ g, n: visible.filter((i) => i.group === g.id).length }))
    .filter((x) => x.n > 0)
    .map(({ g, n }) => `${n} ${g.label.toLowerCase()}`);
  const summary = parts.length ? `This release includes ${parts.join(", ")}.` : "";
  const highlights = visible
    .filter((i) => i.group === "new" || i.group === "breaking")
    .slice(0, 3)
    .map((i) => ({ title: i.text.slice(0, 80), text: "" }));
  return { summary, highlights };
}

/**
 * Moves an item to `group`, placed before the item `beforeId` (end of the group when omitted).
 * Returns a new array; unknown ids leave the list untouched.
 */
export function moveItem(items: NoteItem[], id: string, group: Group, beforeId?: string | null): NoteItem[] {
  const moving = items.find((i) => i.id === id);
  if (!moving) return items;
  const rest = items.filter((i) => i.id !== id);
  const updated = { ...moving, group };

  const anchor = beforeId ? rest.findIndex((i) => i.id === beforeId) : -1;
  if (anchor !== -1) return [...rest.slice(0, anchor), updated, ...rest.slice(anchor)];

  const lastInGroup = rest.map((i) => i.group).lastIndexOf(group);
  const at = lastInGroup === -1 ? rest.length : lastInGroup + 1;
  return [...rest.slice(0, at), updated, ...rest.slice(at)];
}
