import "server-only";
import { NextResponse } from "next/server";
import type { ZodType } from "zod";

interface Bucket {
  count: number;
  resetAt: number;
}

// Best-effort limiter: state lives per serverless instance. Enough to blunt abuse of a free-tier key.
const buckets = new Map<string, Bucket>();

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  b.count += 1;
  return b.count > limit;
}

/** Browsers always send Origin on cross-site and POST requests; only our own site may call the API. */
function originAllowed(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    const host = new URL(origin).host;
    const allowed = (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    return host === req.headers.get("host") || allowed.includes(origin);
  } catch {
    return false;
  }
}

export const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

interface GuardOptions {
  /** Route name, so each endpoint has its own bucket. */
  name: string;
  limit: number;
  windowMs?: number;
  maxBytes?: number;
}

/** Origin check, rate limit, size cap and zod validation. Nothing from the body is ever logged. */
export async function guardJson<T>(
  req: Request,
  schema: ZodType<T>,
  { name, limit, windowMs = 60_000, maxBytes = 200_000 }: GuardOptions,
): Promise<{ data: T } | { response: NextResponse }> {
  if (!originAllowed(req)) return { response: fail(403, "Forbidden origin.") };
  if (rateLimited(`${name}:${clientIp(req)}`, limit, windowMs)) {
    return { response: fail(429, "Too many requests. Please wait a minute.") };
  }
  const text = await req.text();
  if (text.length > maxBytes) return { response: fail(413, "Request too large.") };
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return { response: fail(400, "Invalid JSON.") };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { response: fail(400, "Invalid request.") };
  return { data: parsed.data };
}
