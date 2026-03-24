import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts, users } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const adminReq = getAdminFromRequest(req);
  const onlyPublished = !adminReq;

  const conditions = onlyPublished ? [eq(blogPosts.status, "published")] : [];

  const rows = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      image: blogPosts.image,
      tags: blogPosts.tags,
      status: blogPosts.status,
      publishedAt: blogPosts.publishedAt,
      createdAt: blogPosts.createdAt,
      author: { name: users.name },
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(blogPosts.publishedAt));

  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  if (!body.title || !body.content) return NextResponse.json({ error: "Başlık ve içerik gerekli" }, { status: 400 });

  const [post] = await db
    .insert(blogPosts)
    .values({
      ...body,
      slug: body.slug || slugify(body.title),
      authorId: admin.id,
      publishedAt: body.status === "published" ? new Date() : null,
    })
    .returning();

  return NextResponse.json({ data: post }, { status: 201 });
}
