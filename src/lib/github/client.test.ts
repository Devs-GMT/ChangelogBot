import { describe, expect, it } from "vitest";
import { attachPrNumbers, parseRepoInput, toCommitInfo, verifyFileContent, type ApiCommit } from "./client";

describe("parseRepoInput", () => {
  it.each([
    ["github.com/vercel/next.js", { owner: "vercel", repo: "next.js" }],
    ["https://github.com/vercel/next.js/", { owner: "vercel", repo: "next.js" }],
    ["https://github.com/o/r.git", { owner: "o", repo: "r" }],
    ["https://github.com/o/r/releases/tag/v1?x=1", { owner: "o", repo: "r" }],
    ["o/r", { owner: "o", repo: "r" }],
  ])("%s", (input, expected) => expect(parseRepoInput(input)).toEqual(expected));

  it.each(["", "nope", "a b/c"])("rejects %j", (input) => expect(parseRepoInput(input)).toBeNull());
});

const api = (sha: string, message: string, over: Partial<ApiCommit> = {}): ApiCommit => ({
  sha,
  html_url: `https://github.com/o/r/commit/${sha}`,
  parents: [{ sha: "p" }],
  author: { login: "alice", type: "User" },
  commit: { message, author: { name: "Alice", date: "2026-01-01T00:00:00Z" } },
  ...over,
});

describe("toCommitInfo", () => {
  it("splits title/body and reads squash PR numbers", () => {
    const c = toCommitInfo(api("a", "feat: x (#42)\n\nlong body"));
    expect(c).toMatchObject({ title: "feat: x (#42)", body: "long body", prNumber: 42, isMerge: false, isBot: false });
  });
  it("flags merge commits and PR merges", () => {
    const c = toCommitInfo(
      api("m", "Merge pull request #7 from a/b\n\nAdd thing", { parents: [{ sha: "p1" }, { sha: "p2" }] }),
    );
    expect(c).toMatchObject({ isMerge: true, prNumber: 7 });
  });
  it("flags bots and tolerates a missing author", () => {
    expect(toCommitInfo(api("b", "bump", { author: { login: "dependabot[bot]", type: "Bot" } })).isBot).toBe(true);
    expect(toCommitInfo(api("c", "x", { author: null })).authorLogin).toBeNull();
  });
});

describe("attachPrNumbers", () => {
  it("copies the PR number from a merge commit onto its branch tip", () => {
    const raw = [
      api("tip", "feat: add thing"),
      api("merge", "Merge pull request #7 from a/b", { parents: [{ sha: "base" }, { sha: "tip" }] }),
    ];
    const out = attachPrNumbers(raw, raw.map(toCommitInfo));
    expect(out[0].prNumber).toBe(7);
    expect(out[1].prNumber).toBe(7);
  });
});

describe("verifyFileContent", () => {
  const wallet = "0xAbC0000000000000000000000000000000000001";
  it("matches case-insensitively among other text", () => {
    expect(verifyFileContent(`# owner\n${wallet.toLowerCase()}\n`, wallet)).toBe(true);
  });
  it("rejects other wallets and partial matches", () => {
    expect(verifyFileContent("0xdead", wallet)).toBe(false);
    expect(verifyFileContent(wallet + "ff", wallet)).toBe(false);
    expect(verifyFileContent("", wallet)).toBe(false);
  });
});
