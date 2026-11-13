const PHASES = ["Reading commits", "Grouping changes", "Writing notes"];
const COMMITS = ["feat: add export", "fix: empty repo", "perf: cache tags", "feat: dark mode", "fix: drag handle"];

/** The forge: commits fall into a release block while the three phases light up in turn. */
export function DraftingCanvas() {
  return (
    <div className="flex min-h-full items-center justify-center py-4">
      <div role="status" aria-label="Drafting release notes" className="grid w-full max-w-2xl gap-5">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-paper px-5 pb-8 pt-6 shadow-card sm:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/3 h-56 w-[30rem] max-w-full -translate-x-1/2 rounded-full bg-violet/[0.14] blur-[70px]"
          />
          <div aria-hidden="true" className="relative mx-auto h-56 w-full max-w-sm">
            {COMMITS.map((c, i) => (
              <span
                key={c}
                className="forge-drop absolute left-1/2 top-0 -ml-[4.2rem] w-[8.4rem] truncate rounded-lg border border-line bg-paper px-2.5 py-1.5 text-center font-mono text-[11px] text-muted shadow-card motion-reduce:hidden"
                style={{ ["--i" as string]: i, ["--fx" as string]: `${(i - 2) * 26}px` }}
              >
                {c}
              </span>
            ))}
            <svg
              viewBox="0 0 80 100"
              className="float-y absolute bottom-0 left-1/2 w-28 -translate-x-1/2 drop-shadow-[0_20px_30px_rgb(110_86_207/0.4)]"
            >
              <path d="M40 0L80 22L40 44L0 22Z" fill="#d9cfff" />
              <path d="M0 22L40 44V88L0 66Z" fill="#8b74ff" />
              <path d="M80 22L40 44V88L80 66Z" fill="#6e56cf" />
              <g stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.9">
                <path d="M9 36.5L27 46.4" />
                <path d="M9 46L31 58.1" />
                <path d="M9 55.5L21 62.1" />
              </g>
              <path d="M40 9l1.8 4.4 4.4 1.8-4.4 1.8L40 21.4l-1.8-4.4-4.4-1.8 4.4-1.8L40 9Z" fill="#6e56cf" />
            </svg>
          </div>

          <ol className="relative mx-auto mt-2 grid max-w-xl gap-2 @3xl:grid-cols-3">
            {PHASES.map((p, i) => (
              <li
                key={p}
                className="step-glow flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-violet/20 bg-violet-soft px-3 py-1.5 text-[13px] font-medium text-violet"
                style={{ animationDelay: `${i * 0.5}s` }}
              >
                <span className="tabular grid size-5 shrink-0 place-items-center rounded-full bg-violet text-[11px] text-white">
                  {i + 1}
                </span>
                {p}
              </li>
            ))}
          </ol>
          <p className="relative mt-4 text-center text-sm text-muted">Grouping changes and writing notes for your users…</p>
        </div>
      </div>
    </div>
  );
}
