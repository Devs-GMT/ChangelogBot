import "server-only";
import { cacheLife } from "next/cache";
import { getRecentRepos, getReleasesFor, getTotals } from "@/web3/contract";

// Reads from BOT Chain, cached on the server. A failed read throws and is therefore never cached.

export async function getCachedReleasesFor(repo: string) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  return getReleasesFor(repo);
}

export async function getCachedTotals() {
  "use cache";
  cacheLife({ stale: 60, revalidate: 120, expire: 3600 });
  return getTotals();
}

export async function getCachedRecentRepos(limit: number) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 120, expire: 3600 });
  return getRecentRepos(limit);
}
