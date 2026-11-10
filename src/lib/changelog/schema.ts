import { z } from "zod";

/** Only http(s) links may end up in published notes (they are rendered on a public page). */
export const httpUrl = z
  .string()
  .max(2048)
  .refine((v) => /^https?:\/\//i.test(v) && URL.canParse(v), "Must be an http(s) URL");

export const groupSchema = z.enum(["new", "improved", "fixed", "breaking"]);
export const toneSchema = z.enum(["friendly", "professional", "playful"]);

const sha = z.string().regex(/^[0-9a-f]{40}$/i);

export const noteItemSchema = z
  .object({
    id: z.string().max(64),
    group: groupSchema,
    text: z.string().min(1).max(400),
    refs: z.array(z.object({ label: z.string().max(40), url: httpUrl }).strict()).max(10),
    hidden: z.boolean(),
    source: z.enum(["conventional", "ai", "manual"]),
  })
  .strict();

export const highlightSchema = z
  .object({
    title: z.string().min(1).max(80),
    text: z.string().max(300),
    imageUrl: httpUrl.optional(),
  })
  .strict();

export const releaseNotesSchema = z
  .object({
    repo: z.string().regex(/^[A-Za-z0-9-_.]+\/[A-Za-z0-9-_.]+$/).max(140),
    version: z.string().min(1).max(20),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    fromCommit: sha,
    toCommit: sha,
    tone: toneSchema,
    summary: z.string().max(600),
    highlights: z.array(highlightSchema).max(3),
    items: z.array(noteItemSchema).max(400),
  })
  .strict();
