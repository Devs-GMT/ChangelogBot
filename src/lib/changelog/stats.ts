import type { CommitInfo, RangeStats } from "./types";

export function rangeStats(commits: CommitInfo[]): RangeStats {
  const prs = new Set<number>();
  const people = new Set<string>();
  for (const c of commits) {
    if (c.prNumber) prs.add(c.prNumber);
    if (c.authorLogin && !c.isBot) people.add(c.authorLogin.toLowerCase());
  }
  return { commits: commits.length, pullRequests: prs.size, contributors: people.size };
}
