export interface RepoRef {
  owner: string;
  repo: string;
}

export interface RepoInfo {
  fullName: string;
  owner: string;
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
  defaultBranch: string;
  createdAt: string;
  htmlUrl: string;
  avatarUrl: string;
}

export interface TagInfo {
  name: string;
  sha: string;
}

export interface ReleaseInfo {
  tagName: string;
  name: string | null;
  publishedAt: string | null;
}

export type RangeEdge =
  | { kind: "ref"; ref: string }
  | { kind: "date"; date: string }; // YYYY-MM-DD

export type RangeEnd = RangeEdge | { kind: "latest" };

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetAt: number; // epoch ms
}
