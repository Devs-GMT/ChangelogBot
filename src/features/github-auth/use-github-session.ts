"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setGitHubProxy } from "@/lib/github/client";

export interface GitHubUser {
  login: string;
  avatarUrl: string;
}

interface SessionResponse {
  configured: boolean;
  user: GitHubUser | null;
}

const KEY = ["github-session"];

export const githubSignInUrl = "/api/auth/github";

/** Who is signed in with GitHub. While signed in, repo reads use the user's rate limit. */
export function useGitHubSession() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<SessionResponse> => {
      const res = await fetch("/api/auth/github/session", { cache: "no-store" });
      if (!res.ok) return { configured: false, user: null };
      return res.json();
    },
    staleTime: 5 * 60_000,
  });

  const user = query.data?.user ?? null;
  useEffect(() => setGitHubProxy(Boolean(user)), [user]);

  const signOut = useMutation({
    mutationFn: () => fetch("/api/auth/github/logout", { method: "POST" }),
    onSuccess: () => {
      setGitHubProxy(false);
      queryClient.setQueryData<SessionResponse>(KEY, (old) => ({ configured: old?.configured ?? true, user: null }));
    },
  });

  return {
    loading: query.isPending,
    configured: query.data?.configured ?? false,
    user,
    signOut: () => signOut.mutate(),
    signingOut: signOut.isPending,
    /** Call after a GitHub 401 so the UI shows "Sign in" again. */
    refresh: () => queryClient.invalidateQueries({ queryKey: KEY }),
  };
}
