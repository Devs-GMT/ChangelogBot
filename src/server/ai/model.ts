import "server-only";
import { google } from "@ai-sdk/google";

/** Free-tier Gemini by default; override with AI_MODEL. Key: GOOGLE_GENERATIVE_AI_API_KEY. */
export const getModel = () => google(process.env.AI_MODEL ?? "gemini-flash-latest");

export const aiConfigured = () => Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
