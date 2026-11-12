import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * Official BOT Chain mark (from botchain.ai) plus wordmark text.
 * Callers wrap it in a link to botchain.ai.
 */
export function BotChainLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display text-sm font-semibold", className)}>
      <Image src="/brand/botchain-mark.png" alt="" width={20} height={20} className="size-5" />
      BOT Chain
    </span>
  );
}
