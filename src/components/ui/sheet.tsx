"use client";

import { useEffect, useRef } from "react";

/** Bottom sheet built on the native <dialog>: focus trap, Esc and backdrop come for free. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className="m-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-y-auto rounded-t-2xl bg-paper p-0 text-ink shadow-float backdrop:bg-ink/40"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper px-4 py-3">
        <span className="mx-auto absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-line" aria-hidden="true" />
        <h2 className="pt-1 text-base">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-sm text-muted hover:bg-canvas hover:text-ink"
        >
          Close
        </button>
      </div>
      <div className="p-4">{children}</div>
    </dialog>
  );
}
