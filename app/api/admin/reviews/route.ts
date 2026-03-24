import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productReviews, products, users } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const reviews = await db
    .select({
      id: productReviews.id,
      rating: productReviews.rating,
      title: productReviews.title,
      comment: productReviews.comment,
      isApproved: productReviews.isApproved,
      createdAt: productReviews.createdAt,
      productName: products.name,
      productSlug: products.slug,
      userName: users.name,
      userEmail: users.email,
    })
    .from(productReviews)
    .leftJoin(products, eq(productReviews.productId, products.id))
    .leftJoin(users, eq(productReviews.userId, users.id))
    .orderBy(desc(productReviews.createdAt));

  return NextResponse.json({ data: reviews });
}

export async function PUT(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });
  if (typeof body.isApproved !== "boolean") return NextResponse.json({ error: "isApproved boolean olmalı" }, { status: 400 });

  await db.update(productReviews).set({ isApproved: body.isApproved }).where(eq(productReviews.id, id));
  return NextResponse.json({ message: "Güncellendi" });
}

export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "Geçersiz ID" }, { status: 400 });

  await db.delete(productReviews).where(eq(productReviews.id, id));
  return NextResponse.json({ message: "Silindi" });
}
