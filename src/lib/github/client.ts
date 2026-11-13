import type { CommitInfo } from "@/lib/changelog/types";
import { readCache, writeCache } from "./cache";
import type {
  BranchInfo,
  RangeEdge,
  RangeEnd,
  RateLimitInfo,
  ReleaseInfo,
  RepoInfo,
  RepoRef,
  TagInfo,
} from "./types";

const API = "https://api.github.com";
export const MAX_RANGE_COMMITS = 250;

// ------------------------------------------------------------------- errors

export class RepoNotFoundError extends Error {
  constructor() {
    super("Repository not found, or it is private. ChangelogBot only reads public repos.");
  }
}
export class RateLimitError extends Error {
  constructor(
    public resetAt: number,
    public limit = 60,
  ) {
    super(`GitHub rate limit reached (${limit} requests/hour).`);
  }
}
export class RangeTooLargeError extends Error {
  constructor(public total: number) {
    super(`This range has ${total} commits (max ${MAX_RANGE_COMMITS}). Split it into smaller ranges.`);
  }
}
export class EmptyRangeError extends Error {
  constructor() {
    super("No commits found in this range.");
  }
}

// --------------------------------------------------------------- rate limit

let lastRate: RateLimitInfo | null = null;
const listeners = new Set<(r: RateLimitInfo) => void>();

export const getRateLimit = () => lastRate;
export function subscribeRateLimit(fn: (r: RateLimitInfo) => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

function trackRate(res: Response) {
  const remaining = res.headers.get("x-ratelimit-remaining");
  const limit = res.headers.get("x-ratelimit-limit");
  const reset = res.headers.get("x-ratelimit-reset");
  if (remaining === null || limit === null || reset === null) return;
  const info: RateLimitInfo = { remaining: Number(remaining), limit: Number(limit), resetAt: Number(reset) * 1000 };
  lastRate = info;
  listeners.forEach((fn) => fn(info));
}

// -------------------------------------------------------------------- fetch

/** Signed in with GitHub: reads go through `/api/github` with the user's token (5,000 requests/hour). */
let viaProxy = false;
export function setGitHubProxy(on: boolean) {
  viaProxy = on;
}

const proxyUrl = (path: string) => `/api/github?path=${encodeURIComponent(path)}`;

async function request(path: string): Promise<Response> {
  if (viaProxy) {
    const res = await fetch(proxyUrl(path), { cache: "no-store" });
    if (res.status !== 401) return res;
    viaProxy = false; // session expired: carry on anonymously
  }
  return fetch(API + path, { headers: { Accept: "application/vnd.github+json" } });
}

/** GET JSON with a browser cache; falls back to a stale cache entry when rate limited. */
async function gh<T>(path: string): Promise<T> {
  const cached = readCache<T>(path);
  if (cached?.fresh) return cached.value;

  const res = await request(path);
  trackRate(res);

  if (res.status === 404) throw new RepoNotFoundError();
  if (res.status === 403 || res.status === 429) {
    if (cached) return cached.value;
    throw new RateLimitError(lastRate?.resetAt ?? Date.now() + 60 * 60 * 1000, lastRate?.limit);
  }
  if (!res.ok) throw new Error(`GitHub request failed (${res.status}).`);

  const json = (await res.json()) as T;
  writeCache(path, json);
  return json;
}

// -------------------------------------------------------------------- input

/** Accepts `owner/repo`, `github.com/owner/repo` and full URLs (with .git or trailing paths). */
export function parseRepoInput(input: string): RepoRef | null {
  const cleaned = input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?github\.com\//i, "")
    .replace(/[?#].*$/, "")
    .replace(/\.git$/i, "");
  const [owner, repo] = cleaned.split("/").filter(Boolean);
  if (!owner || !repo) return null;
  if (!/^[A-Za-z0-9-_.]+$/.test(owner) || !/^[A-Za-z0-9-_.]+$/.test(repo)) return null;
  return { owner, repo };
}

// ------------------------------------------------------------------ raw API

interface ApiRepo {
  full_name: string;
  name: string;
  owner: { login: string; avatar_url: string };
  description: string | null;
  stargazers_count: number;
  language: string | null;
  default_branch: string;
  created_at: string;
  html_url: string;
}
export interface ApiCommit {
  sha: string;
  html_url: string;
  parents?: { sha: string }[];
  author: { login: string; type?: string } | null;
  commit: { message: string; author: { name: string; date: string } };
}

export async function getRepo({ owner, repo }: RepoRef): Promise<RepoInfo> {
  const r = await gh<ApiRepo>(`/repos/${owner}/${repo}`);
  return {
    fullName: r.full_name,
    owner: r.owner.login,
    name: r.name,
    description: r.description,
    stars: r.stargazers_count,
    language: r.language,
    defaultBranch: r.default_branch,
    createdAt: r.created_at,
    htmlUrl: r.html_url,
    avatarUrl: r.owner.avatar_url,
  };
}

export async function getTags({ owner, repo }: RepoRef): Promise<TagInfo[]> {
  const tags = await gh<{ name: string; commit: { sha: string } }[]>(`/repos/${owner}/${repo}/tags?per_page=100`);
  return tags.map((t) => ({ name: t.name, sha: t.commit.sha }));
}

export async function getBranches({ owner, repo }: RepoRef): Promise<BranchInfo[]> {
  const branches = await gh<{ name: string; commit: { sha: string } }[]>(`/repos/${owner}/${repo}/branches?per_page=100`);
  return branches.map((b) => ({ name: b.name, sha: b.commit.sha }));
}

export async function getReleases({ owner, repo }: RepoRef): Promise<ReleaseInfo[]> {
  const rels = await gh<{ tag_name: string; name: string | null; published_at: string | null }[]>(
    `/repos/${owner}/${repo}/releases?per_page=30`,
  );
  return rels.map((r) => ({ tagName: r.tag_name, name: r.name, publishedAt: r.published_at }));
}

// ----------------------------------------------------------------- commits

const PR_MERGE = /^Merge pull request #(\d+)\b/;
const SQUASH_PR = /\(#(\d+)\)\s*$/;

export function toCommitInfo(c: ApiCommit): CommitInfo {
  const [title, ...rest] = c.commit.message.split("\n");
  const login = c.author?.login ?? null;
  const isBot =
    c.author?.type === "Bot" || /\[bot\]$/i.test(login ?? "") || /^(dependabot|renovate)/i.test(login ?? "");
  const mergePr = PR_MERGE.exec(title);
  const squashPr = SQUASH_PR.exec(title);
  return {
    sha: c.sha,
    title: title.trim(),
    body: rest.join("\n").trim(),
    authorLogin: login,
    isBot,
    isMerge: (c.parents?.length ?? 0) > 1 || /^Merge (branch|pull request|remote-tracking)/.test(title),
    prNumber: mergePr ? Number(mergePr[1]) : squashPr ? Number(squashPr[1]) : null,
    url: c.html_url,
  };
}

/**
 * Merge commits are noise as entries, but they tell us which PR a branch belongs to.
 * Attach that PR number to the branch tip (second parent) so refs can link to the PR.
 */
export function attachPrNumbers(raw: ApiCommit[], commits: CommitInfo[]): CommitInfo[] {
  const tipToPr = new Map<string, number>();
  raw.forEach((c, i) => {
    const pr = commits[i].isMerge ? commits[i].prNumber : null;
    const tip = c.parents?.[1]?.sha;
    if (pr && tip) tipToPr.set(tip, pr);
  });
  return commits.map((c) => (c.prNumber || !tipToPr.has(c.sha) ? c : { ...c, prNumber: tipToPr.get(c.sha)! }));
}

export interface RangeData {
  commits: CommitInfo[]; // newest first
  totalCommits: number;
  fromSha: string; // 40-char sha, recorded on-chain
  toSha: string;
  compareUrl: string | null;
}

async function resolveDate(repo: RepoRef, ref: string): Promise<string> {
  const c = await gh<ApiCommit>(`/repos/${repo.owner}/${repo.repo}/commits/${encodeURIComponent(ref)}`);
  return c.commit.author.date;
}

async function listCommits(repo: RepoRef, query: string): Promise<ApiCommit[]> {
  const all: ApiCommit[] = [];
  for (let page = 1; page <= 3; page++) {
    const batch = await gh<ApiCommit[]>(`/repos/${repo.owner}/${repo.repo}/commits?${query}&per_page=100&page=${page}`);
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

async function loadCompare(repo: RepoRef, base: string, head: string): Promise<RangeData> {
  const path = `/repos/${repo.owner}/${repo.repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`;
  const cmp = await gh<{
    total_commits: number;
    commits: ApiCommit[];
    base_commit: { sha: string };
    html_url: string;
  }>(`${path}?per_page=100`);
  if (cmp.total_commits > MAX_RANGE_COMMITS) throw new RangeTooLargeError(cmp.total_commits);
  if (cmp.total_commits === 0) throw new EmptyRangeError();

  let raw = cmp.commits;
  for (let page = 2; raw.length < cmp.total_commits && page <= 3; page++) {
    const next = await gh<{ commits: ApiCommit[] }>(`${path}?per_page=100&page=${page}`);
    raw = raw.concat(next.commits);
  }
  const infos = attachPrNumbers(raw, raw.map(toCommitInfo));
  return {
    commits: infos.reverse(), // compare is oldest-first
    totalCommits: cmp.total_commits,
    fromSha: cmp.base_commit.sha,
    toSha: raw[raw.length - 1].sha,
    compareUrl: cmp.html_url,
  };
}

async function loadByDate(repo: RepoRef, from: RangeEdge, to: RangeEnd, branch: string): Promise<RangeData> {
  const since = from.kind === "date" ? `${from.date}T00:00:00Z` : await resolveDate(repo, from.ref);
  const until =
    to.kind === "date" ? `${to.date}T23:59:59Z` : to.kind === "ref" ? await resolveDate(repo, to.ref) : null;
  const sha = to.kind === "ref" ? to.ref : branch;
  const query = [
    `sha=${encodeURIComponent(sha)}`,
    `since=${encodeURIComponent(since)}`,
    until ? `until=${encodeURIComponent(until)}` : "",
  ]
    .filter(Boolean)
    .join("&");

  const raw = await listCommits(repo, query);
  if (raw.length === 0) throw new EmptyRangeError();
  if (raw.length > MAX_RANGE_COMMITS) throw new RangeTooLargeError(raw.length);
  return {
    commits: attachPrNumbers(raw, raw.map(toCommitInfo)), // already newest-first
    totalCommits: raw.length,
    fromSha: raw[raw.length - 1].sha,
    toSha: raw[0].sha,
    compareUrl: null,
  };
}

/** `branch` is where "latest" points and which history date ranges walk. */
export function loadRange(repo: RepoRef, from: RangeEdge, to: RangeEnd, branch: string): Promise<RangeData> {
  if (from.kind === "ref" && to.kind !== "date") {
    return loadCompare(repo, from.ref, to.kind === "ref" ? to.ref : branch);
  }
  return loadByDate(repo, from, to, branch);
}

// ------------------------------------------------------------ maintainer file

export type VerifyResult =
  | { verified: true; method: "file" | "github" }
  | { verified: false; reason: "missing" | "wrong-wallet" | "error" };

/** Signed-in GitHub user can push to the repo (never cached: access can change). */
export async function checkPushAccess({ owner, repo }: RepoRef): Promise<boolean> {
  if (!viaProxy) return false;
  try {
    const res = await fetch(proxyUrl(`/repos/${owner}/${repo}`), { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { permissions?: { push?: boolean } };
    return data.permissions?.push === true;
  } catch {
    return false;
  }
}

/** True when any whitespace-separated token equals the wallet (case-insensitive). */
export function verifyFileContent(content: string, wallet: string): boolean {
  const target = wallet.trim().toLowerCase();
  return content.split(/\s+/).some((token) => token.toLowerCase() === target);
}

/** Reads the raw `.changelogbot` file (never cached: it must reflect the repo right now). */
export async function checkMaintainerFile(
  { owner, repo }: RepoRef,
  branch: string,
  wallet: string,
): Promise<VerifyResult> {
  try {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/.changelogbot`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return { verified: false, reason: "missing" };
    if (!res.ok) return { verified: false, reason: "error" };
    return verifyFileContent(await res.text(), wallet)
      ? { verified: true, method: "file" }
      : { verified: false, reason: "wrong-wallet" };
  } catch {
    return { verified: false, reason: "error" };
  }
}
