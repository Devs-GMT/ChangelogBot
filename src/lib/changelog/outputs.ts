import { GROUPS, type Group, type NoteItem, type ReleaseNotes } from "./types";

export const X_LIMIT = 280;
const X_URL_LENGTH = 23;

export const visibleItems = (notes: ReleaseNotes): NoteItem[] => notes.items.filter((i) => !i.hidden);

export function itemsByGroup(notes: ReleaseNotes): Record<Group, NoteItem[]> {
  const out: Record<Group, NoteItem[]> = { new: [], improved: [], fixed: [], breaking: [] };
  for (const item of visibleItems(notes)) out[item.group].push(item);
  return out;
}

const repoName = (repo: string) => repo.split("/")[1] ?? repo;

/** Approximates how X counts characters: links are 23, emoji are 2. */
export function xLength(text: string): number {
  const withoutUrls = text.replace(/https?:\/\/\S+/g, "");
  const urls = (text.match(/https?:\/\/\S+/g) ?? []).length;
  let n = urls * X_URL_LENGTH;
  for (const ch of withoutUrls) n += /\p{Extended_Pictographic}/u.test(ch) ? 2 : 1;
  return n;
}

function clip(text: string, room: number): string {
  if (xLength(text) <= room) return text;
  let out = text;
  while (out.length > 0 && xLength(out + "…") > room) out = out.slice(0, -1);
  return out.trimEnd() + "…";
}

// ----------------------------------------------------------- GitHub Markdown

export function toGitHubMarkdown(notes: ReleaseNotes): string {
  const lines: string[] = [`## ${notes.version} — ${notes.date}`, ""];
  if (notes.summary) lines.push(notes.summary, "");

  if (notes.highlights.length) {
    lines.push("### Highlights", "");
    for (const h of notes.highlights) {
      lines.push(`- **${h.title}** — ${h.text}`);
      if (h.imageUrl) lines.push("", `  ![${h.title}](${h.imageUrl})`, "");
    }
    lines.push("");
  }

  const grouped = itemsByGroup(notes);
  for (const g of GROUPS) {
    if (!grouped[g.id].length) continue;
    lines.push(`### ${g.emoji} ${g.label}`, "");
    for (const item of grouped[g.id]) {
      const refs = item.refs.map((r) => `[${r.label}](${r.url})`).join(", ");
      lines.push(`- ${item.text}${refs ? ` (${refs})` : ""}`);
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

// -------------------------------------------------------------------- X post

function countsLine(notes: ReleaseNotes): string {
  const g = itemsByGroup(notes);
  const parts: string[] = [];
  if (g.new.length) parts.push(`✨ ${g.new.length} new`);
  if (g.improved.length) parts.push(`🛠 ${g.improved.length} improved`);
  if (g.fixed.length) parts.push(`🐛 ${g.fixed.length} fixed`);
  if (g.breaking.length) parts.push(`⚠️ ${g.breaking.length} breaking`);
  return parts.join(" · ");
}

export function toXPost(notes: ReleaseNotes, url?: string): string {
  const head = `🚀 ${repoName(notes.repo)} ${notes.version} is out!`;
  const counts = countsLine(notes);
  const tail = [counts, url].filter(Boolean).join("\n");
  const fixed = [head, "", "", "", tail].join("\n"); // same layout as below, with an empty summary
  const room = X_LIMIT - xLength(fixed);
  const summary = clip(notes.summary.replace(/\s+/g, " ").trim(), Math.max(room, 0));
  return summary ? [head, "", summary, "", tail].join("\n") : [head, "", tail].join("\n");
}

export function toXThread(notes: ReleaseNotes, url?: string): string[] {
  const tweets = [toXPost(notes, url)];
  const grouped = itemsByGroup(notes);
  for (const g of GROUPS) {
    const items = grouped[g.id];
    if (!items.length) continue;
    let current = `${g.emoji} ${g.label}`;
    for (const item of items) {
      const line = `\n• ${item.text}`;
      if (xLength(current + line) > X_LIMIT) {
        tweets.push(current);
        current = `${g.emoji} ${g.label} (cont.)`;
      }
      current += xLength(current + line) > X_LIMIT ? `\n• ${clip(item.text, X_LIMIT - xLength(current) - 3)}` : line;
    }
    tweets.push(current);
  }
  return tweets;
}

// -------------------------------------------------------------- Email summary

export function toEmailText(notes: ReleaseNotes, url?: string): string {
  const lines: string[] = [`${repoName(notes.repo)} ${notes.version} — what's new`, ""];
  if (notes.summary) lines.push(notes.summary, "");
  const grouped = itemsByGroup(notes);
  for (const g of GROUPS) {
    if (!grouped[g.id].length) continue;
    lines.push(`${g.emoji} ${g.label.toUpperCase()}`);
    for (const item of grouped[g.id]) lines.push(`  - ${item.text}`);
    lines.push("");
  }
  if (url) lines.push(`Full changelog: ${url}`);
  return lines.join("\n").trimEnd() + "\n";
}

// -------------------------------------------------------------------- Links

export const newGitHubReleaseUrl = (repo: string, version: string) =>
  `https://github.com/${repo}/releases/new?tag=${encodeURIComponent(version)}`;

export const xIntentUrl = (text: string) => `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
