import "server-only";
import { hashNotesJson } from "@/lib/changelog/notes-hash";
import { releaseNotesSchema } from "@/lib/changelog/schema";
import type { ReleaseNotes } from "@/lib/changelog/types";

const CID_PATTERN = /^[A-Za-z0-9]{40,120}$/;

const gateways = () =>
  [
    process.env.PINATA_GATEWAY ? `https://${process.env.PINATA_GATEWAY}/ipfs/` : null,
    "https://gateway.pinata.cloud/ipfs/",
    "https://ipfs.io/ipfs/",
  ].filter((g): g is string => Boolean(g));

/**
 * Loads release notes by CID and checks them against the hash recorded on-chain.
 * Returns null when the file is unreachable, malformed, or does not match (never trust unverified notes).
 */
export async function fetchNotes(cid: string, expectedHash: string): Promise<ReleaseNotes | null> {
  if (!CID_PATTERN.test(cid)) return null;
  for (const base of gateways()) {
    try {
      // A CID is content-addressed, so the response can be cached for a long time.
      const res = await fetch(base + cid, { signal: AbortSignal.timeout(6000), next: { revalidate: 86_400 } });
      if (!res.ok) continue;
      const text = await res.text();
      if (text.length > 200_000) return null;
      if (hashNotesJson(text).toLowerCase() !== expectedHash.toLowerCase()) return null;
      const parsed = releaseNotesSchema.safeParse(JSON.parse(text));
      return parsed.success ? parsed.data : null;
    } catch {
      continue;
    }
  }
  return null;
}
