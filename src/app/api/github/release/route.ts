import { NextResponse } from "next/server";
import { z } from "zod";
import { fail, guardJson } from "@/server/http/guard";
import { clearSession, GITHUB_API, githubHeaders, readSession } from "@/server/github/session";

const bodySchema = z.object({
  repo: z.string().regex(/^[A-Za-z0-9-_.]+\/[A-Za-z0-9-_.]+$/),
  tag: z.string().min(1).max(40),
  body: z.string().max(125_000),
  /** Where GitHub creates the tag when it doesn't exist yet: the last commit of the range. */
  targetCommitish: z.string().regex(/^[0-9a-f]{40}$/i),
  draft: z.boolean(),
});

/** Creates the GitHub Release with the signed-in user's token. GitHub itself checks write access. */
export async function POST(req: Request) {
  const guarded = await guardJson(req, bodySchema, { name: "github-release", limit: 5, maxBytes: 140_000 });
  if ("response" in guarded) return guarded.response;
  const { repo, tag, body, targetCommitish, draft } = guarded.data;

  const session = await readSession();
  if (!session) return fail(401, "Sign in with GitHub first.");

  let res: Response;
  try {
    res = await fetch(`${GITHUB_API}/repos/${repo}/releases`, {
      method: "POST",
      headers: { ...githubHeaders(session.token), "Content-Type": "application/json" },
      body: JSON.stringify({ tag_name: tag, name: tag, body, target_commitish: targetCommitish, draft }),
      cache: "no-store",
    });
  } catch {
    return fail(502, "Could not reach GitHub. Please retry.");
  }

  if (res.ok) {
    const release = (await res.json()) as { html_url: string };
    return NextResponse.json({ url: release.html_url });
  }
  if (res.status === 401) {
    await clearSession();
    return fail(401, "Your GitHub sign-in expired. Sign in again.");
  }
  if (res.status === 403 || res.status === 404) {
    return fail(403, `@${session.login} doesn't have write access to ${repo}.`);
  }
  if (res.status === 422) {
    const data = (await res.json().catch(() => ({}))) as { errors?: { code?: string }[] };
    if (data.errors?.some((e) => e.code === "already_exists")) {
      return fail(409, `A GitHub release for ${tag} already exists.`);
    }
    return fail(422, "GitHub rejected this release. Check the version name.");
  }
  return fail(502, `GitHub returned an error (${res.status}). Please retry.`);
}
