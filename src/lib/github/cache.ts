const PREFIX = "clb:v1:";
const DEFAULT_TTL_MS = 10 * 60 * 1000;

interface Entry<T> {
  at: number;
  value: T;
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readCache<T>(key: string, ttlMs = DEFAULT_TTL_MS): { value: T; fresh: boolean } | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    return { value: entry.value, fresh: Date.now() - entry.at < ttlMs };
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, value: T): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(PREFIX + key, JSON.stringify({ at: Date.now(), value } satisfies Entry<T>));
  } catch {
    // quota exceeded or storage blocked: caching is best-effort
  }
}
