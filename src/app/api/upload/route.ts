import { NextResponse } from "next/server";
import { z } from "zod";
import { canonicalJson } from "@/lib/changelog/notes-hash";
import { releaseNotesSchema } from "@/lib/changelog/schema";
import { fail, guardJson } from "@/server/http/guard";
import { ipfsConfigured, uploadJson } from "@/server/ipfs/pinata";

export const maxDuration = 30;

const bodySchema = z.object({ json: z.string().min(2).max(150_000) });

/**
 * Receives the canonical notes JSON string (the same bytes the client hashes for the contract),
 * validates it, and pins it to IPFS unchanged.
 */
export async function POST(req: Request) {
  const guarded = await guardJson(req, bodySchema, { name: "upload", limit: 6, maxBytes: 160_000 });
  if ("response" in guarded) return guarded.response;
  const { json } = guarded.data;

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return fail(400, "Invalid notes JSON.");
  }
  const notes = releaseNotesSchema.safeParse(parsed);
  if (!notes.success) return fail(400, "The notes do not match the expected format.");
  // The hash recorded on-chain is computed from this exact string: refuse anything non-canonical.
  if (canonicalJson(notes.data) !== json) return fail(400, "Notes must be canonical JSON.");

  if (!ipfsConfigured()) return fail(503, "IPFS upload is not configured.");

  try {
    const cid = await uploadJson(json, `${notes.data.repo.replace("/", "-")}-${notes.data.version}`);
    return NextResponse.json({ cid });
  } catch {
    return fail(502, "IPFS upload failed. Please retry.");
  }
}
