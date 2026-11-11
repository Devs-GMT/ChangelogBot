import "server-only";
import { cacheLife } from "next/cache";
import { getRecentRepos, getReleasesFor, getTotals } from "@/web3/contract";

// Reads from BOT Chain, cached on the server. Release lists throw on failure (and so are never cached);
// the landing page's totals and repo strip degrade to "nothing yet" instead, because an error escaping a
// cache fill during prerender fails the whole build (e.g. an address with no contract on this network).

export async function getCachedReleasesFor(repo: string) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  return getReleasesFor(repo);
}

export async function getCachedTotals() {
  "use cache";
  cacheLife({ stale: 60, revalidate: 120, expire: 3600 });
  try {
    return await getTotals();
  } catch {
    return null;
  }
}

export async function getCachedRecentRepos(limit: number) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 120, expire: 3600 });
  try {
    return await getRecentRepos(limit);
  } catch {
    return [];
  }
}
