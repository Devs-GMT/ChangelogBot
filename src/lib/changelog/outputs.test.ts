import { describe, expect, it } from "vitest";
import { newGitHubReleaseUrl, toEmailText, toGitHubMarkdown, toXPost, toXThread, X_LIMIT, xLength } from "./outputs";
import type { ReleaseNotes } from "./types";

const notes: ReleaseNotes = {
  repo: "acme/widgets",
  version: "v1.4.0",
  date: "2026-11-10",
  fromCommit: "a".repeat(40),
  toCommit: "b".repeat(40),
  tone: "friendly",
  summary: "Widgets got faster and friendlier.",
  highlights: [{ title: "One-click testnet", text: "Switch networks instantly.", imageUrl: "https://x.test/a.gif" }],
  items: [
    {
      id: "1",
      group: "new",
      text: "Switch to testnet with one click",
      refs: [{ label: "#12", url: "https://g/pr/12" }],
      hidden: false,
      source: "ai",
    },
    { id: "2", group: "fixed", text: "Fixed a crash on empty repos", refs: [], hidden: false, source: "conventional" },
    { id: "3", group: "improved", text: "Internal detail", refs: [], hidden: true, source: "manual" },
  ],
};

describe("toGitHubMarkdown", () => {
  const md = toGitHubMarkdown(notes);
  it("has heading, summary, highlight with image and grouped items", () => {
    expect(md).toContain("## v1.4.0 — 2026-11-10");
    expect(md).toContain("Widgets got faster");
    expect(md).toContain("![One-click testnet](https://x.test/a.gif)");
    expect(md).toContain("### ✨ New\n\n- Switch to testnet with one click ([#12](https://g/pr/12))");
    expect(md).toContain("### 🐛 Fixed");
  });
  it("omits hidden items and empty groups", () => {
    expect(md).not.toContain("Internal detail");
    expect(md).not.toContain("Improved");
    expect(md).not.toContain("Breaking");
  });
});

describe("X output", () => {
  it("fits in 280 characters even with a long summary", () => {
    const long = { ...notes, summary: "Very long summary. ".repeat(40) };
    const post = toXPost(long, "https://changelogbot.vercel.app/c/acme/widgets");
    expect(xLength(post)).toBeLessThanOrEqual(X_LIMIT);
    expect(post).toContain("v1.4.0");
  });
  it("counts URLs as 23 and emoji as 2", () => {
    expect(xLength("https://example.com/very/long/path/that/goes/on")).toBe(23);
    expect(xLength("🚀")).toBe(2);
  });
  it("splits the thread into tweets that all fit", () => {
    const many: ReleaseNotes = {
      ...notes,
      items: Array.from({ length: 40 }, (_, i) => ({
        id: String(i),
        group: "new" as const,
        text: `Feature number ${i} with a reasonably descriptive title`,
        refs: [],
        hidden: false,
        source: "ai" as const,
      })),
    };
    const thread = toXThread(many, "https://x.test/c");
    expect(thread.length).toBeGreaterThan(2);
    for (const t of thread) expect(xLength(t)).toBeLessThanOrEqual(X_LIMIT);
  });
});

describe("email and links", () => {
  it("renders plain text", () => {
    const text = toEmailText(notes, "https://x.test/c");
    expect(text).toContain("widgets v1.4.0");
    expect(text).toContain("✨ NEW\n  - Switch to testnet with one click");
    expect(text).toContain("Full changelog: https://x.test/c");
  });
  it("builds the GitHub new-release URL", () => {
    expect(newGitHubReleaseUrl("acme/widgets", "v1.4.0")).toBe(
      "https://github.com/acme/widgets/releases/new?tag=v1.4.0",
    );
  });
});
