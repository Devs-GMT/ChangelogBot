import { describe, expect, it } from "vitest";
import { assembleItems, fallbackSummary, moveItem } from "./assemble";
import { commit } from "./fixtures";
import type { NoteItem } from "./types";

const repoUrl = "https://github.com/o/r";
const item = (id: string, group: NoteItem["group"], hidden = false): NoteItem => ({
  id,
  group,
  text: id,
  refs: [],
  hidden,
  source: "manual",
});

describe("assembleItems", () => {
  const a = commit("tweak footer");
  const b = commit("polish onboarding");
  const c = commit("wip");

  it("links AI entries to their commits and hides unused commits", () => {
    const items = assembleItems({
      classified: [item("c1", "fixed")],
      rest: [a, b, c],
      ai: {
        items: [{ group: "improved", text: "Smoother onboarding", commitIds: [b.sha.slice(0, 10), "unknown"] }],
        summary: "",
        highlights: [],
      },
      repoUrl,
    });
    const ai = items.find((i) => i.source === "ai")!;
    expect(ai.text).toBe("Smoother onboarding");
    expect(ai.refs.map((r) => r.label)).toContain(b.sha.slice(0, 7));
    const hidden = items.filter((i) => i.hidden).map((i) => i.text);
    expect(hidden).toEqual(["tweak footer", "wip"]);
    expect(items.find((i) => i.id === "c1")).toBeDefined();
  });

  it("keeps every commit as a hidden item when the AI failed", () => {
    const items = assembleItems({ classified: [], rest: [a, b], ai: null, repoUrl });
    expect(items).toHaveLength(2);
    expect(items.every((i) => i.hidden)).toBe(true);
  });

  it("uses the PR link when a commit has a PR number", () => {
    const pr = commit("improve search", { prNumber: 9 });
    const [only] = assembleItems({
      classified: [],
      rest: [pr],
      ai: { items: [{ group: "improved", text: "Better search", commitIds: [pr.sha.slice(0, 10)] }], summary: "", highlights: [] },
      repoUrl,
    });
    expect(only.refs[0]).toEqual({ label: "#9", url: `${repoUrl}/pull/9` });
  });
});

describe("fallbackSummary", () => {
  it("counts visible items per group and picks highlights", () => {
    const { summary, highlights } = fallbackSummary([
      item("n1", "new"),
      item("n2", "new"),
      item("f1", "fixed"),
      item("h", "fixed", true),
    ]);
    expect(summary).toBe("This release includes 2 new, 1 fixed.");
    expect(highlights.map((h) => h.title)).toEqual(["n1", "n2"]);
  });
  it("is empty without visible items", () => {
    expect(fallbackSummary([])).toEqual({ summary: "", highlights: [] });
  });
});

describe("moveItem", () => {
  const base = [item("a", "new"), item("b", "new"), item("c", "fixed")];
  it("moves to another group at the end", () => {
    const out = moveItem(base, "a", "fixed");
    expect(out.map((i) => `${i.id}:${i.group}`)).toEqual(["b:new", "c:fixed", "a:fixed"]);
  });
  it("moves before a given item", () => {
    const out = moveItem(base, "c", "new", "b");
    expect(out.filter((i) => i.group === "new").map((i) => i.id)).toEqual(["a", "c", "b"]);
  });
  it("reorders inside the same group", () => {
    expect(moveItem(base, "b", "new", "a").map((i) => i.id)).toEqual(["b", "a", "c"]);
    expect(moveItem(base, "a", "new", null).map((i) => i.id)).toEqual(["b", "a", "c"]);
  });
  it("moves into an empty group", () => {
    expect(moveItem(base, "a", "breaking").find((i) => i.id === "a")!.group).toBe("breaking");
  });
  it("ignores unknown ids", () => expect(moveItem(base, "zzz", "new")).toBe(base));
});
