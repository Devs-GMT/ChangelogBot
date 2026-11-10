import { describe, expect, it } from "vitest";
import { commit } from "./fixtures";
import { isNoise, splitNoise } from "./noise";

describe("isNoise", () => {
  it.each([
    commit("Merge pull request #4 from a/b", { isMerge: true }),
    commit("chore: release"),
    commit("ci: cache npm"),
    commit("docs: typo"),
    commit("Bump lodash from 4.17.20 to 4.17.21"),
    commit("build(deps): bump next from 15 to 16"),
    commit("update deps", { isBot: true }),
  ])("flags %# as noise", (c) => expect(isNoise(c)).toBe(true));

  it.each([commit("feat: add export"), commit("fix: crash on empty repo"), commit("Improve onboarding copy")])(
    "keeps %# as signal",
    (c) => expect(isNoise(c)).toBe(false),
  );

  it("keeps breaking chores", () => {
    expect(isNoise(commit("chore!: drop node 18"))).toBe(false);
  });

  it("splits a list", () => {
    const { signal, noise } = splitNoise([commit("feat: a"), commit("chore: b")]);
    expect([signal.length, noise.length]).toEqual([1, 1]);
  });
});
