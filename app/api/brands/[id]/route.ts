import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const baseSlug = body.slug || (body.name ? slugify(body.name) : undefined);
  let slug = baseSlug;
  let attempt = 0;

  while (attempt < 20) {
    try {
      const [updated] = await db
        .update(brands)
        .set({ ...body, ...(slug ? { slug } : {}) })
        .where(eq(brands.id, Number(id)))
        .returning();
      return NextResponse.json({ data: updated });
    } catch (e: any) {
      if (e.code === "23505" && e.detail?.includes("slug") && baseSlug) {
        slug = `${baseSlug}-${++attempt + 1}`;
      } else {
        return NextResponse.json({ error: "Marka güncellenemedi" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ error: "Benzersiz slug oluşturulamadı" }, { status: 500 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  await db.delete(brands).where(eq(brands.id, Number(id)));
  return NextResponse.json({ message: "Silindi" });
}
