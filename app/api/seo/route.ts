import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { seoPages } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(seoPages);
  return NextResponse.json({ data: rows });
}

export async function PUT(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const { page, ...fields } = body;

  if (!page) return NextResponse.json({ error: "page zorunludur" }, { status: 400 });

  const existing = await db.select().from(seoPages).where(eq(seoPages.page, page)).limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(seoPages)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(seoPages.page, page))
      .returning();
    return NextResponse.json({ data: updated });
  } else {
    const [created] = await db
      .insert(seoPages)
      .values({ page, ...fields })
      .returning();
    return NextResponse.json({ data: created }, { status: 201 });
  }
}
