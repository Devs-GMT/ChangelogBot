"use client";

import { useEffect, useState } from "react";
import { Button, buttonClass } from "@/components/ui/button";
import { GitHubIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { githubSignInUrl, useGitHubSession } from "./use-github-session";

/**
 * "Sign in with GitHub", or the signed-in user (click to sign out).
 * `compact` is for the app header: icon/avatar only on phones, and the failure note floats
 * under the button instead of making the header taller.
 */
export function GitHubButton({ size = "sm", compact = false }: { size?: "sm" | "md"; compact?: boolean }) {
  const { configured, user, signOut, signingOut } = useGitHubSession();
  // The OAuth callback lands on /app?github=ok|error. Nothing renders before the session query
  // resolves on the client, so reading the URL here can't cause a hydration mismatch.
  const [failed] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("github") === "error",
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("github")) return;
    url.searchParams.delete("github");
    window.history.replaceState(null, "", url);
  }, []);

  if (!configured) return null;

  if (user) {
    return (
      <Button
        variant="secondary"
        size={size}
        onClick={signOut}
        disabled={signingOut}
        title={`Signed in as @${user.login}. Click to sign out.`}
        aria-label={`Signed in as ${user.login}. Sign out`}
        className={cn(compact && "max-sm:size-8 max-sm:px-0")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {user.avatarUrl ? <img src={user.avatarUrl} alt="" width={16} height={16} className="size-4 rounded-full" /> : <GitHubIcon className="size-4" />}
        <span className={cn("max-w-28 truncate", compact && "max-sm:hidden")}>{user.login}</span>
      </Button>
    );
  }

  return (
    <div className={cn("flex flex-col items-end gap-1", compact && "relative")}>
      {/* A full page navigation, not <Link>: the OAuth redirect must leave the app. */}
      <a
        href={githubSignInUrl}
        className={buttonClass("secondary", size, compact ? "max-sm:size-8 max-sm:px-0" : undefined)}
        aria-label="Sign in with GitHub"
      >
        <GitHubIcon className="size-4" />
        <span className={cn(compact && "max-sm:hidden")}>Sign in with GitHub</span>
      </a>
      {failed && (
        <span
          role="alert"
          className={cn(
            "text-xs text-muted",
            compact && "absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-lg border border-line bg-paper px-2.5 py-1.5 shadow-card",
          )}
        >
          GitHub sign-in failed. Try again.
        </span>
      )}
    </div>
  );
}
