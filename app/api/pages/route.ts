import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dynamicPages } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { desc } from "drizzle-orm";

export async function GET() {
  const pages = await db.select({
    id: dynamicPages.id,
    title: dynamicPages.title,
    slug: dynamicPages.slug,
    status: dynamicPages.status,
    publishedAt: dynamicPages.publishedAt,
    createdAt: dynamicPages.createdAt,
  }).from(dynamicPages).orderBy(desc(dynamicPages.createdAt));
  return NextResponse.json({ data: pages });
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: "Başlık zorunludur" }, { status: 400 });

  const [page] = await db
    .insert(dynamicPages)
    .values({
      title: body.title,
      slug: body.slug || slugify(body.title),
      sections: body.sections ?? [],
      status: body.status ?? "draft",
      publishedAt: body.status === "published" ? new Date() : null,
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
      ogImage: body.ogImage ?? null,
    })
    .returning();

  return NextResponse.json({ data: page }, { status: 201 });
}
