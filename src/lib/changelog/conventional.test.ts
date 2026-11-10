import { describe, expect, it } from "vitest";
import { classifyCommits, groupFor, parseConventional } from "./conventional";
import { commit } from "./fixtures";

describe("parseConventional", () => {
  it("parses type, scope, breaking bang and description", () => {
    expect(parseConventional("feat(ui)!: add dark mode")).toEqual({
      type: "feat",
      scope: "ui",
      breaking: true,
      description: "add dark mode",
    });
  });
  it("detects BREAKING CHANGE footers", () => {
    expect(parseConventional("fix: x", "BREAKING CHANGE: api removed")?.breaking).toBe(true);
  });
  it("returns null for free-form messages", () => {
    expect(parseConventional("Update readme")).toBeNull();
    expect(parseConventional("feat add thing")).toBeNull();
  });
});

describe("groupFor", () => {
  it.each([
    ["feat: a", "new"],
    ["fix: a", "fixed"],
    ["perf: a", "improved"],
    ["refactor: a", "improved"],
    ["feat!: a", "breaking"],
    ["docs: a", null],
  ])("%s -> %s", (title, group) => {
    expect(groupFor(parseConventional(title)!)).toBe(group);
  });
});

describe("classifyCommits", () => {
  it("groups conventional commits and leaves the rest for the AI", () => {
    const commits = [
      commit("feat: switch to testnet with one click", { prNumber: 12, sha: "a".repeat(40) }),
      commit("fix(api): handle empty repo"),
      commit("tweak the footer spacing"),
    ];
    const { items, rest } = classifyCommits(commits, "https://github.com/o/r");
    expect(items.map((i) => i.group)).toEqual(["new", "fixed"]);
    expect(items[0].text).toBe("Switch to testnet with one click");
    expect(items[0].refs[0]).toEqual({ label: "#12", url: "https://github.com/o/r/pull/12" });
    expect(rest.map((c) => c.title)).toEqual(["tweak the footer spacing"]);
  });
});
