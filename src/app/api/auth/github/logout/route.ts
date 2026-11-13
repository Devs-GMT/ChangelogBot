import { NextResponse } from "next/server";
import { fail } from "@/server/http/guard";
import { clearSession, sameSite } from "@/server/github/session";

export async function POST(req: Request) {
  if (!sameSite(req)) return fail(403, "Forbidden origin.");
  await clearSession();
  return NextResponse.json({ ok: true });
}
