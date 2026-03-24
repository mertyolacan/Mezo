import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productReviews, orders, users } from "@/lib/db/schema";
import { getUserFromRequest } from "@/lib/auth";
import { eq, and, desc, avg, count } from "drizzle-orm";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(255).optional(),
  comment: z.string().max(2000).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);

  const rows = await db
    .select({
      id: productReviews.id,
      rating: productReviews.rating,
      title: productReviews.title,
      comment: productReviews.comment,
      createdAt: productReviews.createdAt,
      userName: users.name,
    })
    .from(productReviews)
    .leftJoin(users, eq(productReviews.userId, users.id))
    .where(and(eq(productReviews.productId, productId), eq(productReviews.isApproved, true)))
    .orderBy(desc(productReviews.createdAt));

  const [statsRow] = await db
    .select({ avg: avg(productReviews.rating), total: count() })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.isApproved, true)));

  // Yıldız dağılımı
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of rows) distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;

  const reviewList = rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    createdAt: r.createdAt,
    user: { name: r.userName ?? "Kullanıcı" },
  }));

  return NextResponse.json({
    data: {
      reviews: reviewList,
      stats: {
        avgRating: statsRow.avg ? Number(Number(statsRow.avg).toFixed(1)) : 0,
        totalCount: statsRow.total,
        distribution,
      },
    },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });

  const { id } = await params;
  const productId = Number(id);

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  // Kullanıcının bu ürünü satın alıp almadığını kontrol et
  const userOrders = await db.select({ items: orders.items }).from(orders).where(eq(orders.userId, user.id));
  const hasPurchased = userOrders.some((o) => {
    const items = o.items as { productId: number }[];
    return items.some((i) => i.productId === productId);
  });

  if (!hasPurchased) {
    return NextResponse.json({ error: "Bu ürünü satın almış müşteriler değerlendirme yapabilir" }, { status: 403 });
  }

  // Daha önce değerlendirme yapmış mı?
  const [existing] = await db
    .select({ id: productReviews.id })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.userId, user.id)))
    .limit(1);

  if (existing) return NextResponse.json({ error: "Bu ürün için zaten değerlendirme yapmışsınız" }, { status: 409 });

  const [review] = await db
    .insert(productReviews)
    .values({
      productId,
      userId: user.id,
      rating: parsed.data.rating,
      title: parsed.data.title,
      comment: parsed.data.comment,
      isApproved: false,
    })
    .returning();

  return NextResponse.json({ data: review, message: "Değerlendirmeniz incelendikten sonra yayınlanacak" }, { status: 201 });
}
