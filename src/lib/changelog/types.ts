export type Group = "new" | "improved" | "fixed" | "breaking";
export type Tone = "friendly" | "professional" | "playful";

/** Display order and labels — single source of truth for UI and outputs. */
export const GROUPS: readonly { id: Group; emoji: string; label: string }[] = [
  { id: "new", emoji: "✨", label: "New" },
  { id: "improved", emoji: "🛠", label: "Improved" },
  { id: "fixed", emoji: "🐛", label: "Fixed" },
  { id: "breaking", emoji: "⚠️", label: "Breaking" },
];

export interface CommitInfo {
  sha: string;
  /** First line of the commit message. */
  title: string;
  /** Everything after the first line. */
  body: string;
  authorLogin: string | null;
  isBot: boolean;
  /** Merge commit ("Merge pull request …" / "Merge branch …"). */
  isMerge: boolean;
  prNumber: number | null;
  url: string;
}

export interface Ref {
  label: string;
  url: string;
}

export interface NoteItem {
  id: string;
  group: Group;
  text: string;
  refs: Ref[];
  hidden: boolean;
  source: "conventional" | "ai" | "manual";
}

export interface Highlight {
  title: string;
  text: string;
  imageUrl?: string;
}

export interface ReleaseNotes {
  repo: string; // "owner/repo"
  version: string;
  date: string; // YYYY-MM-DD
  fromCommit: string; // 40-char sha
  toCommit: string; // 40-char sha
  tone: Tone;
  summary: string;
  highlights: Highlight[];
  items: NoteItem[];
}

export interface RangeStats {
  commits: number;
  pullRequests: number;
  contributors: number;
}
