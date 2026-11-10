import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { X_LIMIT, xLength } from "@/lib/changelog/outputs";
import { getModel, aiConfigured } from "@/server/ai/model";
import { postPrompt, postSystem } from "@/server/ai/prompts";
import { postOutputSchema, postRequestSchema } from "@/server/ai/schemas";
import { fail, guardJson } from "@/server/http/guard";

export const maxDuration = 30;

export async function POST(req: Request) {
  const guarded = await guardJson(req, postRequestSchema, { name: "post", limit: 8 });
  if ("response" in guarded) return guarded.response;
  const { data } = guarded;

  if (!aiConfigured()) return fail(503, "AI is not configured.");

  try {
    const { output } = await generateText({
      model: getModel(),
      system: postSystem(data.tone),
      prompt: postPrompt(data),
      output: Output.object({ schema: postOutputSchema }),
      temperature: 0.7,
    });

    const withLink = (text: string) => (data.url ? `${text.trim()}\n\n${data.url}` : text.trim());
    const post = withLink(output.post);
    if (xLength(post) > X_LIMIT) return fail(502, "The AI post was too long.");

    const thread = output.thread
      .slice(0, 4)
      .map((t) => t.trim())
      .filter((t) => t && xLength(t) <= X_LIMIT);

    return NextResponse.json({ post, thread });
  } catch {
    return fail(502, "The AI post failed.");
  }
}
