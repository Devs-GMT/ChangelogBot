import { describe, expect, it } from "vitest";
import { canonicalJson, hashNotesJson, serializeNotes, shaToBytes20 } from "./notes-hash";
import type { ReleaseNotes } from "./types";

describe("canonicalJson", () => {
  it("sorts keys and drops undefined", () => {
    expect(canonicalJson({ b: 1, a: { d: undefined, c: [2, { z: 1, y: 2 }] } })).toBe(
      '{"a":{"c":[2,{"y":2,"z":1}]},"b":1}',
    );
  });
  it("is independent of key order", () => {
    expect(canonicalJson({ a: 1, b: 2 })).toBe(canonicalJson({ b: 2, a: 1 }));
  });
});

describe("serializeNotes", () => {
  const base: ReleaseNotes = {
    repo: "o/r",
    version: "v1",
    date: "2026-01-01",
    fromCommit: "a".repeat(40),
    toCommit: "b".repeat(40),
    tone: "friendly",
    summary: "",
    highlights: [],
    items: [
      { id: "1", group: "new", text: "A", refs: [], hidden: false, source: "ai" },
      { id: "2", group: "new", text: "B", refs: [], hidden: true, source: "ai" },
    ],
  };
  it("drops hidden items before hashing", () => {
    const json = serializeNotes(base);
    expect(json).toContain('"text":"A"');
    expect(json).not.toContain('"text":"B"');
  });
  it("hash is stable and 32 bytes", () => {
    const h = hashNotesJson(serializeNotes(base));
    expect(h).toMatch(/^0x[0-9a-f]{64}$/);
    expect(h).toBe(hashNotesJson(serializeNotes(base)));
  });
});

describe("shaToBytes20", () => {
  it("accepts 40-hex shas", () => expect(shaToBytes20("A".repeat(40))).toBe(`0x${"a".repeat(40)}`));
  it("rejects anything else", () => expect(() => shaToBytes20("abc")).toThrow());
});
