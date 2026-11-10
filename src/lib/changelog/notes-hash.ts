import { keccak256, toBytes, type Hex } from "viem";
import { visibleItems } from "./outputs";
import type { ReleaseNotes } from "./types";

/** Deterministic JSON: object keys sorted, no whitespace. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** What actually gets published: hidden items are dropped. */
export const publishableNotes = (notes: ReleaseNotes): ReleaseNotes => ({
  ...notes,
  items: visibleItems(notes),
});

/** The exact string uploaded to IPFS — and hashed on-chain. */
export const serializeNotes = (notes: ReleaseNotes): string => canonicalJson(publishableNotes(notes));

export const hashNotesJson = (json: string): Hex => keccak256(toBytes(json));

/** First 20 bytes of a git sha-1 — it already is 20 bytes. */
export const shaToBytes20 = (sha: string): Hex => {
  if (!/^[0-9a-f]{40}$/i.test(sha)) throw new Error(`Invalid commit sha: ${sha}`);
  return `0x${sha.toLowerCase()}`;
};
