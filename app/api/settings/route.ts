import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";

/**
 * GET /api/settings
 * Singleton (id=1) ayar satırını döner.
 */
export async function GET() {
  const row = await db.select().from(siteSettings).limit(1).then((r) => r[0] ?? null);
  return NextResponse.json({ data: row });
}
