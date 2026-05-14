import { NextResponse } from "next/server";

/** Liveness probe: no DB, no Prisma — isolates app/proxy vs data layer. */
export function GET() {
  return NextResponse.json({ ok: true });
}
