import { NextResponse } from "next/server";
import {
  GITHUB_API,
  githubAuthConfigured,
  githubHeaders,
  takeOAuthState,
  writeSession,
} from "@/server/github/session";

/** Back to the app, with `?github=` telling it how sign-in went. */
const back = (req: Request, result: "ok" | "error") =>
  NextResponse.redirect(new URL(`/app?github=${result}`, req.url));

export async function GET(req: Request) {
  if (!githubAuthConfigured()) return back(req, "error");

  const params = new URL(req.url).searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const expected = await takeOAuthState();
  if (!code || !state || !expected || state !== expected) return back(req, "error");

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: new URL("/api/auth/github/callback", req.url).toString(),
      }),
      cache: "no-store",
    });
    const { access_token: token } = (await tokenRes.json()) as { access_token?: string };
    if (!token) return back(req, "error");

    const userRes = await fetch(`${GITHUB_API}/user`, { headers: githubHeaders(token), cache: "no-store" });
    if (!userRes.ok) return back(req, "error");
    const user = (await userRes.json()) as { login: string; avatar_url: string };

    await writeSession({ token, login: user.login, avatarUrl: user.avatar_url });
    return back(req, "ok");
  } catch {
    return back(req, "error");
  }
}
