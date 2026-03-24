import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(siteSettings);
  const settings: Record<string, string | null> = {};
  rows.forEach((row) => { settings[row.key] = row.value; });
  return NextResponse.json({ data: settings });
}

export async function PUT(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json() as Record<string, string>;

  for (const [key, value] of Object.entries(body)) {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
    if (existing.length > 0) {
      await db.update(siteSettings).set({ value, updatedAt: new Date() }).where(eq(siteSettings.key, key));
    } else {
      await db.insert(siteSettings).values({ key, value });
    }
  }

  return NextResponse.json({ message: "Kaydedildi" });
}
