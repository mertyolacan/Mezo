import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const [updated] = await db
    .update(blogPosts)
    .set({
      ...body,
      slug: body.slug || slugify(body.title),
      publishedAt: body.status === "published" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, Number(id)))
    .returning();

  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  await db.delete(blogPosts).where(eq(blogPosts.id, Number(id)));
  return NextResponse.json({ message: "Silindi" });
}
