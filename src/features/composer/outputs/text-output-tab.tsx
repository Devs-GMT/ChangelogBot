"use client";

import { CopyButton } from "@/components/ui/copy-button";
import { FileBox } from "@/components/ui/file-box";

export function TextOutputTab({
  fileName,
  text,
  hint,
  extra,
}: {
  fileName: string;
  text: string;
  hint?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="grid gap-2.5">
      <FileBox
        name={fileName}
        action={<CopyButton text={text} />}
        bodyClassName="max-h-[420px] overflow-auto whitespace-pre-wrap break-words"
      >
        {text}
      </FileBox>
      <div className="flex flex-wrap items-center gap-2">
        {extra}
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
    </div>
  );
}
