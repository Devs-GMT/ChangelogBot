import { NextResponse } from "next/server";
import { fail } from "@/server/http/guard";
import { GITHUB_API, githubHeaders, readSession, sameSite } from "@/server/github/session";

// Read-only, and only repo endpoints: the proxy exists to lift the rate limit, not to reach the whole API.
const ALLOWED_PATH = /^\/repos\/[A-Za-z0-9-_.]+\/[A-Za-z0-9-_.]+(\/[A-Za-z0-9-_.~%/@+]*)?(\?[A-Za-z0-9-_.~%=&:+]*)?$/;
const FORWARDED = ["x-ratelimit-remaining", "x-ratelimit-limit", "x-ratelimit-reset"];

/** GET /api/github?path=/repos/o/r/... → the same GitHub response, made with the signed-in user's token. */
export async function GET(req: Request) {
  if (!sameSite(req)) return fail(403, "Forbidden origin.");
  const path = new URL(req.url).searchParams.get("path") ?? "";
  // `...` is legal (compare ranges); a `..` path segment is not.
  if (!ALLOWED_PATH.test(path) || /(^|\/)\.\.(\/|\?|$)/.test(path)) return fail(400, "Unsupported GitHub path.");

  const session = await readSession();
  if (!session) return fail(401, "Not signed in with GitHub.");

  const res = await fetch(GITHUB_API + path, { headers: githubHeaders(session.token), cache: "no-store" });
  const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store" });
  for (const name of FORWARDED) {
    const value = res.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  return new NextResponse(res.body, { status: res.status, headers });
}
