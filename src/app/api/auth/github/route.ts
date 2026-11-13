import { NextResponse } from "next/server";
import { fail } from "@/server/http/guard";
import { githubAuthConfigured, writeOAuthState } from "@/server/github/session";

/**
 * Starts GitHub sign-in. `public_repo` is the narrowest scope that can create releases;
 * it gives no access to private repos.
 */
export async function GET(req: Request) {
  if (!githubAuthConfigured()) return fail(503, "GitHub sign-in is not configured.");

  const state = crypto.randomUUID();
  await writeOAuthState(state);

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!);
  url.searchParams.set("redirect_uri", new URL("/api/auth/github/callback", req.url).toString());
  url.searchParams.set("scope", "public_repo");
  url.searchParams.set("state", state);
  url.searchParams.set("allow_signup", "false");
  return NextResponse.redirect(url);
}
