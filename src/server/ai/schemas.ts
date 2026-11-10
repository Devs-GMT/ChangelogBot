import "server-only";
import { z } from "zod";
import { groupSchema, toneSchema } from "@/lib/changelog/schema";

// ------------------------------------------------------------------- draft

export const draftRequestSchema = z.object({
  repo: z.string().max(140),
  tone: toneSchema,
  /** Commits Conventional Commits could not place. `id` is echoed back by the model. */
  commits: z
    .array(
      z.object({
        id: z.string().max(40),
        title: z.string().max(300),
        body: z.string().max(600).default(""),
      }),
    )
    .max(250),
  /** Already-grouped items (from Conventional Commits) — used for the summary and highlights. */
  knownItems: z.array(z.object({ group: groupSchema, text: z.string().max(300) })).max(250),
});
export type DraftRequest = z.infer<typeof draftRequestSchema>;

export const draftOutputSchema = z.object({
  items: z.array(
    z.object({
      commitIds: z.array(z.string()).min(1).describe("Ids of the commits this entry is based on"),
      group: groupSchema,
      text: z.string().describe("One user-facing sentence about what changed"),
    }),
  ),
  summary: z.string().describe("Two short sentences summarising the release"),
  highlights: z
    .array(z.object({ title: z.string(), text: z.string() }))
    .describe("The three most important user-facing changes"),
});

// -------------------------------------------------------------------- post

export const postRequestSchema = z.object({
  repo: z.string().max(140),
  version: z.string().max(20),
  tone: toneSchema,
  summary: z.string().max(600),
  items: z.array(z.object({ group: groupSchema, text: z.string().max(300) })).max(60),
  url: z.string().max(300).optional(),
});
export type PostRequest = z.infer<typeof postRequestSchema>;

export const postOutputSchema = z.object({
  post: z.string().describe("A single X post, at most 250 characters, without any link"),
  thread: z.array(z.string()).describe("Up to 4 follow-up posts, each at most 250 characters"),
});
