import type { AiDraft } from "@/lib/changelog/assemble";
import type { Tone } from "@/lib/changelog/types";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status}).`);
  return data;
}

export const requestDraft = (body: {
  repo: string;
  tone: Tone;
  commits: { id: string; title: string; body: string }[];
  knownItems: { group: string; text: string }[];
}) => post<AiDraft>("/api/changelog/draft", body);

export const requestXPost = (body: {
  repo: string;
  version: string;
  tone: Tone;
  summary: string;
  items: { group: string; text: string }[];
  url?: string;
}) => post<{ post: string; thread: string[] }>("/api/changelog/post", body);

/** Creates the GitHub Release with the signed-in user's token; returns its page URL. */
export const createGitHubRelease = (body: {
  repo: string;
  tag: string;
  body: string;
  targetCommitish: string;
  draft: boolean;
}) => post<{ url: string }>("/api/github/release", body);

/** Uploads the canonical notes JSON to IPFS and returns its CID. */
export const uploadNotes = (json: string) => post<{ cid: string }>("/api/upload", { json });
