import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { getModel, aiConfigured } from "@/server/ai/model";
import { draftPrompt, draftSystem } from "@/server/ai/prompts";
import { draftOutputSchema, draftRequestSchema } from "@/server/ai/schemas";
import { fail, guardJson } from "@/server/http/guard";

export const maxDuration = 30;

export async function POST(req: Request) {
  const guarded = await guardJson(req, draftRequestSchema, { name: "draft", limit: 8 });
  if ("response" in guarded) return guarded.response;
  const { data } = guarded;

  if (!aiConfigured()) return fail(503, "AI drafting is not configured.");
  if (data.commits.length === 0 && data.knownItems.length === 0) return fail(400, "Nothing to draft.");

  try {
    const { output } = await generateText({
      model: getModel(),
      system: draftSystem(data.tone),
      prompt: draftPrompt(data),
      output: Output.object({ schema: draftOutputSchema }),
      temperature: 0.3,
    });

    // Never trust model-provided ids: keep only entries tied to commits we actually sent.
    const known = new Set(data.commits.map((c) => c.id));
    const items = output.items
      .map((i) => ({ group: i.group, text: i.text.trim(), commitIds: i.commitIds.filter((id) => known.has(id)) }))
      .filter((i) => i.text && i.commitIds.length > 0);

    return NextResponse.json({
      items,
      summary: output.summary.trim(),
      highlights: output.highlights.slice(0, 3).map((h) => ({ title: h.title.trim(), text: h.text.trim() })),
    });
  } catch {
    return fail(502, "The AI draft failed. You can still use the grouped commits.");
  }
}
