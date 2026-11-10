import type { Group } from "./types";

const SEMVER = /^(v?)(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/;

/** breaking → major, any New → minor, otherwise patch. */
export function suggestNextVersion(current: string | null | undefined, groups: Iterable<Group>): string {
  const present = new Set(groups);
  const m = current ? SEMVER.exec(current.trim()) : null;
  if (!m) return "v1.0.0";
  const [, prefix, ma, mi, pa] = m;
  let major = Number(ma);
  let minor = Number(mi);
  let patch = Number(pa);
  if (present.has("breaking")) {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (present.has("new")) {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${prefix}${major}.${minor}.${patch}`;
}
