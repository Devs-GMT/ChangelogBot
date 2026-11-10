import type { CommitInfo } from "./types";

let counter = 0;

/** Test helper: builds a CommitInfo with a unique 40-char sha. */
export const commit = (title: string, over: Partial<CommitInfo> = {}): CommitInfo => ({
  sha: (counter++).toString(16).padEnd(40, "a"),
  title,
  body: "",
  authorLogin: "alice",
  isBot: false,
  isMerge: false,
  prNumber: null,
  url: "https://github.com/o/r/commit/abc",
  ...over,
});
