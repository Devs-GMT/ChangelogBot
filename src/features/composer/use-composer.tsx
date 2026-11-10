"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { assembleItems, fallbackSummary, moveItem, type AiDraft } from "@/lib/changelog/assemble";
import { classifyCommits } from "@/lib/changelog/conventional";
import { splitNoise } from "@/lib/changelog/noise";
import { suggestNextVersion } from "@/lib/changelog/semver";
import { rangeStats } from "@/lib/changelog/stats";
import type { Group, Highlight, NoteItem, RangeStats, ReleaseNotes, Tone } from "@/lib/changelog/types";
import {
  EmptyRangeError,
  getReleases,
  getRepo,
  getTags,
  loadRange,
  parseRepoInput,
  RangeTooLargeError,
  RateLimitError,
  RepoNotFoundError,
  type RangeData,
} from "@/lib/github/client";
import type { RangeEdge, RangeEnd, ReleaseInfo, RepoInfo, RepoRef, TagInfo } from "@/lib/github/types";
import { requestDraft } from "./api";

export type Phase = "repo" | "range" | "compose";
export type DraftState = "idle" | "loading" | "done" | "fallback";

export interface ComposerState {
  phase: Phase;
  input: string;
  repoRef: RepoRef | null;
  repo: RepoInfo | null;
  tags: TagInfo[];
  releases: ReleaseInfo[];
  loadingRepo: boolean;
  repoError: string | null;

  from: RangeEdge | null;
  to: RangeEnd;
  version: string;
  versionTouched: boolean;
  includeNoise: boolean;
  tone: Tone;

  reading: "idle" | "loading" | "ready" | "error";
  readError: string | null;
  rangeData: RangeData | null;
  stats: RangeStats | null;
  noiseCount: number;
  allNoise: boolean;

  drafting: DraftState;
  notes: ReleaseNotes | null;
}

const initialState: ComposerState = {
  phase: "repo",
  input: "",
  repoRef: null,
  repo: null,
  tags: [],
  releases: [],
  loadingRepo: false,
  repoError: null,
  from: null,
  to: { kind: "latest" },
  version: "",
  versionTouched: false,
  includeNoise: false,
  tone: "friendly",
  reading: "idle",
  readError: null,
  rangeData: null,
  stats: null,
  noiseCount: 0,
  allNoise: false,
  drafting: "idle",
  notes: null,
};

type Action =
  | { type: "patch"; patch: Partial<ComposerState> }
  | { type: "notes"; fn: (n: ReleaseNotes) => ReleaseNotes };

function reducer(state: ComposerState, action: Action): ComposerState {
  if (action.type === "patch") return { ...state, ...action.patch };
  return state.notes ? { ...state, notes: action.fn(state.notes) } : state;
}

function errorMessage(e: unknown): string {
  if (e instanceof RateLimitError) {
    const at = new Date(e.resetAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `GitHub rate limit reached (60 requests/hour). Try again after ${at}. Repos you already loaded still work.`;
  }
  if (e instanceof RepoNotFoundError || e instanceof RangeTooLargeError || e instanceof EmptyRangeError) {
    return e.message;
  }
  return "Something went wrong while talking to GitHub. Please try again.";
}

export interface ComposerActions {
  patch: (patch: Partial<ComposerState>) => void;
  loadRepo: (input: string) => Promise<void>;
  readChanges: (opts?: { includeNoise?: boolean }) => Promise<void>;
  rewrite: (tone: Tone) => Promise<void>;
  backTo: (phase: Phase) => void;
  setVersion: (v: string) => void;
  moveItem: (id: string, group: Group, beforeId?: string | null) => void;
  editItem: (id: string, text: string) => void;
  toggleHidden: (id: string) => void;
  addItem: (group: Group) => void;
  setSummary: (s: string) => void;
  editHighlight: (index: number, patch: Partial<Highlight>) => void;
  addHighlight: () => void;
  removeHighlight: (index: number) => void;
}

const Ctx = createContext<{ state: ComposerState; actions: ComposerActions } | null>(null);

export function useComposer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useComposer must be used inside <ComposerProvider>");
  return ctx;
}

const today = () => new Date().toISOString().slice(0, 10);

export function ComposerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const ref = useRef(state);
  useEffect(() => {
    ref.current = state;
  });

  const patch = useCallback((p: Partial<ComposerState>) => dispatch({ type: "patch", patch: p }), []);
  const updateNotes = useCallback((fn: (n: ReleaseNotes) => ReleaseNotes) => dispatch({ type: "notes", fn }), []);

  const loadRepo = useCallback(
    async (input: string) => {
      const parsed = parseRepoInput(input);
      patch({ input });
      if (!parsed) {
        patch({ repoError: "Enter a public repo like github.com/owner/repo." });
        return;
      }
      patch({ loadingRepo: true, repoError: null });
      try {
        const [repo, tags, releases] = await Promise.all([getRepo(parsed), getTags(parsed), getReleases(parsed)]);
        patch({
          repoRef: { owner: repo.owner, repo: repo.name },
          repo,
          tags,
          releases,
          loadingRepo: false,
          phase: "range",
          from: tags[0] ? { kind: "ref", ref: tags[0].name } : { kind: "date", date: repo.createdAt.slice(0, 10) },
          to: { kind: "latest" },
          version: "",
          versionTouched: false,
          reading: "idle",
          rangeData: null,
          stats: null,
          notes: null,
          drafting: "idle",
          allNoise: false,
        });
      } catch (e) {
        patch({ loadingRepo: false, repoError: errorMessage(e) });
      }
    },
    [patch],
  );

  const buildDraft = useCallback(
    async (data: RangeData, includeNoise: boolean, tone: Tone) => {
      const s = ref.current;
      if (!s.repo) return;
      const { signal, noise } = splitNoise(data.commits);
      const commits = includeNoise ? data.commits : signal;
      patch({ noiseCount: noise.length, stats: rangeStats(data.commits) });

      if (commits.length === 0) {
        patch({ allNoise: true, notes: null, drafting: "idle" });
        return;
      }
      patch({ allNoise: false, drafting: "loading", phase: "compose" });

      const repoUrl = s.repo.htmlUrl;
      const { items: classified, rest } = classifyCommits(commits, repoUrl);

      let ai: AiDraft | null = null;
      try {
        ai = await requestDraft({
          repo: s.repo.fullName,
          tone,
          commits: rest.map((c) => ({ id: c.sha.slice(0, 10), title: c.title, body: c.body.slice(0, 600) })),
          knownItems: classified.map((i) => ({ group: i.group, text: i.text })),
        });
      } catch {
        ai = null; // fall back to Conventional Commits + the raw list
      }

      const items = assembleItems({ classified, rest, ai, repoUrl });
      const fb = fallbackSummary(items);
      const baseTag = s.from?.kind === "ref" ? s.from.ref : s.tags[0]?.name;
      const groups = items.filter((i) => !i.hidden).map((i) => i.group);
      const version = s.versionTouched && s.version ? s.version : suggestNextVersion(baseTag, groups);

      patch({
        version,
        drafting: ai ? "done" : "fallback",
        notes: {
          repo: s.repo.fullName,
          version,
          date: today(),
          fromCommit: data.fromSha,
          toCommit: data.toSha,
          tone,
          summary: ai?.summary || fb.summary,
          highlights: ai?.highlights.length ? ai.highlights.slice(0, 3) : fb.highlights,
          items,
        },
      });
    },
    [patch],
  );

  const readChanges = useCallback(
    async (opts?: { includeNoise?: boolean }) => {
      const s = ref.current;
      if (!s.repoRef || !s.repo || !s.from) return;
      const includeNoise = opts?.includeNoise ?? s.includeNoise;
      patch({ includeNoise, reading: "loading", readError: null, notes: null, drafting: "idle", allNoise: false });
      try {
        const data = await loadRange(s.repoRef, s.from, s.to, s.repo.defaultBranch);
        patch({ rangeData: data, reading: "ready" });
        await buildDraft(data, includeNoise, s.tone);
      } catch (e) {
        patch({ reading: "error", readError: errorMessage(e) });
      }
    },
    [buildDraft, patch],
  );

  const rewrite = useCallback(
    async (tone: Tone) => {
      patch({ tone });
      const s = ref.current;
      if (s.rangeData) await buildDraft(s.rangeData, s.includeNoise, tone);
    },
    [buildDraft, patch],
  );

  const actions = useMemo<ComposerActions>(
    () => ({
      patch,
      loadRepo,
      readChanges,
      rewrite,
      backTo: (phase) => patch({ phase }),
      setVersion: (version) => {
        patch({ version, versionTouched: true });
        updateNotes((n) => ({ ...n, version }));
      },
      moveItem: (id, group, beforeId) => updateNotes((n) => ({ ...n, items: moveItem(n.items, id, group, beforeId) })),
      editItem: (id, text) =>
        updateNotes((n) => ({ ...n, items: n.items.map((i) => (i.id === id ? { ...i, text } : i)) })),
      toggleHidden: (id) =>
        updateNotes((n) => ({ ...n, items: n.items.map((i) => (i.id === id ? { ...i, hidden: !i.hidden } : i)) })),
      addItem: (group) =>
        updateNotes((n) => {
          const item: NoteItem = {
            id: `m-${Date.now().toString(36)}`,
            group,
            text: "",
            refs: [],
            hidden: false,
            source: "manual",
          };
          return { ...n, items: moveItem([...n.items, item], item.id, group) };
        }),
      setSummary: (summary) => updateNotes((n) => ({ ...n, summary })),
      editHighlight: (index, p) =>
        updateNotes((n) => ({
          ...n,
          highlights: n.highlights.map((h, i) => {
            if (i !== index) return h;
            const next = { ...h, ...p };
            if (!next.imageUrl) delete next.imageUrl;
            return next;
          }),
        })),
      addHighlight: () =>
        updateNotes((n) =>
          n.highlights.length >= 3 ? n : { ...n, highlights: [...n.highlights, { title: "New highlight", text: "" }] },
        ),
      removeHighlight: (index) =>
        updateNotes((n) => ({ ...n, highlights: n.highlights.filter((_, i) => i !== index) })),
    }),
    [loadRepo, patch, readChanges, rewrite, updateNotes],
  );

  return <Ctx.Provider value={{ state, actions }}>{children}</Ctx.Provider>;
}
