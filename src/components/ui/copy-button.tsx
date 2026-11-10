"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./button";

export function CopyButton({
  text,
  label = "Copy",
  size = "sm",
  variant = "secondary",
}: {
  text: string;
  label?: string;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "ghost";
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1600);
  };

  return (
    <Button variant={variant} size={size} onClick={copy} aria-live="polite">
      {state === "copied" ? "Copied ✓" : state === "failed" ? "Copy failed" : label}
    </Button>
  );
}
