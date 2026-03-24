import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dynamicPages } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const [page] = await db.select().from(dynamicPages).where(eq(dynamicPages.id, Number(id))).limit(1);
  if (!page) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json({ data: page });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const [updated] = await db
    .update(dynamicPages)
    .set({
      ...body,
      slug: body.slug || slugify(body.title),
      publishedAt: body.status === "published" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(dynamicPages.id, Number(id)))
    .returning();

  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  await db.delete(dynamicPages).where(eq(dynamicPages.id, Number(id)));
  return NextResponse.json({ message: "Silindi" });
}
