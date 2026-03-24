import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { favorites, products } from "@/lib/db/schema";
import { getUserFromRequest } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const rows = await db
    .select({
      id: favorites.id,
      product: {
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        images: products.images,
        stock: products.stock,
      },
    })
    .from(favorites)
    .innerJoin(products, eq(favorites.productId, products.id))
    .where(eq(favorites.userId, user.id));

  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { productId } = await req.json();

  const existing = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.productId, productId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(favorites).where(eq(favorites.id, existing[0].id));
    return NextResponse.json({ data: { favorited: false } });
  }

  await db.insert(favorites).values({ userId: user.id, productId });
  return NextResponse.json({ data: { favorited: true } }, { status: 201 });
}
