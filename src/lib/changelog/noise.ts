import { parseConventional } from "./conventional";
import type { CommitInfo } from "./types";

const NOISE_TYPES = new Set(["chore", "ci", "build", "style", "test", "docs"]);
const DEP_BUMP = /^(bump|update|upgrade|chore\(deps[^)]*\))\b.*\b(dependenc|deps|from \S+ to \S+)/i;
const DEP_TITLE = /^(build|chore|fix)\(deps(-dev)?\)|^bump \S+ from \S+ to \S+/i;

export function isNoise(commit: CommitInfo): boolean {
  if (commit.isMerge || commit.isBot) return true;
  if (DEP_TITLE.test(commit.title) || DEP_BUMP.test(commit.title)) return true;
  const parsed = parseConventional(commit.title, commit.body);
  if (parsed && NOISE_TYPES.has(parsed.type) && !parsed.breaking) return true;
  return false;
}

export function splitNoise(commits: CommitInfo[]): { signal: CommitInfo[]; noise: CommitInfo[] } {
  const signal: CommitInfo[] = [];
  const noise: CommitInfo[] = [];
  for (const c of commits) (isNoise(c) ? noise : signal).push(c);
  return { signal, noise };
}
