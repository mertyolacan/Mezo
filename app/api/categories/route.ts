import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { eq, asc } from "drizzle-orm";

export const runtime = "edge";
export const revalidate = 300;

export async function GET() {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "İsim gerekli" }, { status: 400 });

  const baseSlug = body.slug || slugify(body.name);
  let slug = baseSlug;
  let attempt = 0;

  while (attempt < 20) {
    try {
      const [category] = await db
        .insert(categories)
        .values({ ...body, slug })
        .returning();
      return NextResponse.json({ data: category }, { status: 201 });
    } catch (e: unknown) {
      if ((e as { code?: string; detail?: string }).code === "23505" && (e as { detail?: string }).detail?.includes("slug")) {
        slug = `${baseSlug}-${++attempt + 1}`;
      } else {
        return NextResponse.json({ error: "Kategori oluşturulamadı" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ error: "Benzersiz slug oluşturulamadı" }, { status: 500 });
}
