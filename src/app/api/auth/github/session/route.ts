import { connection, NextResponse } from "next/server";
import { githubAuthConfigured, readSession } from "@/server/github/session";

/** Who is signed in (never the token). `configured: false` hides the sign-in button. */
export async function GET() {
  // Per-request: without this, a build without GitHub env vars would prerender "not configured" forever.
  await connection();
  const session = await readSession();
  return NextResponse.json(
    {
      configured: githubAuthConfigured(),
      user: session ? { login: session.login, avatarUrl: session.avatarUrl } : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
