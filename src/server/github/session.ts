import "server-only";
import { cookies } from "next/headers";

/**
 * GitHub sign-in without a database: the OAuth token lives in an AES-GCM encrypted, httpOnly cookie.
 * The browser never sees the token; every GitHub call that needs it goes through our API routes.
 */

export const SESSION_COOKIE = "cb_gh";
export const STATE_COOKIE = "cb_gh_state";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // a week

export interface GitHubSession {
  token: string;
  login: string;
  avatarUrl: string;
}

export const githubAuthConfigured = () =>
  Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_SESSION_SECRET);

const enc = new TextEncoder();

async function key(): Promise<CryptoKey> {
  const secret = process.env.GITHUB_SESSION_SECRET ?? "";
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

const toB64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64url");
const fromB64 = (text: string) => new Uint8Array(Buffer.from(text, "base64url"));

async function seal(session: GitHubSession): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(), enc.encode(JSON.stringify(session)));
  return `${toB64(iv)}.${toB64(new Uint8Array(data))}`;
}

async function unseal(value: string): Promise<GitHubSession | null> {
  const [iv, data] = value.split(".");
  if (!iv || !data) return null;
  try {
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(iv) }, await key(), fromB64(data));
    const parsed = JSON.parse(new TextDecoder().decode(plain)) as Partial<GitHubSession>;
    return parsed.token && parsed.login ? { token: parsed.token, login: parsed.login, avatarUrl: parsed.avatarUrl ?? "" } : null;
  } catch {
    return null; // tampered, or the secret changed
  }
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function readSession(): Promise<GitHubSession | null> {
  if (!githubAuthConfigured()) return null;
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value ? unseal(value) : null;
}

export async function writeSession(session: GitHubSession) {
  (await cookies()).set(SESSION_COOKIE, await seal(session), { ...cookieOptions, maxAge: SESSION_MAX_AGE });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** One-time OAuth `state`, kept for ten minutes to tie the callback to this browser. */
export async function writeOAuthState(state: string) {
  (await cookies()).set(STATE_COOKIE, state, { ...cookieOptions, maxAge: 600 });
}

export async function takeOAuthState(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(STATE_COOKIE)?.value ?? null;
  store.delete(STATE_COOKIE);
  return value;
}

/** Same-site requests only: blocks other sites from driving GitHub calls with the visitor's cookie. */
export function sameSite(req: Request): boolean {
  const site = req.headers.get("sec-fetch-site");
  return site === null ? process.env.NODE_ENV !== "production" : site === "same-origin" || site === "none";
}

export const GITHUB_API = "https://api.github.com";

export const githubHeaders = (token: string) => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "ChangelogBot",
});
