import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, products } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { desc, gte, sql, sum, count, and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const period = req.nextUrl.searchParams.get("period") ?? "30d";
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [dailyRows, topProducts] = await Promise.all([
    db
      .select({
        date: sql<string>`DATE(${orders.createdAt})`,
        revenue: sum(orders.total),
        orderCount: count(),
      })
      .from(orders)
      .where(gte(orders.createdAt, since))
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`),
    db
      .select({
        name: products.name,
        slug: products.slug,
        images: products.images,
        orderCount: sql<number>`count(*)`,
      })
      .from(orders)
      .leftJoin(
        products,
        sql`${orders.items}::jsonb @> jsonb_build_array(jsonb_build_object('productId', ${products.id}))`
      )
      .where(and(gte(orders.createdAt, since), eq(products.isActive, true)))
      .groupBy(products.id, products.name, products.slug, products.images)
      .orderBy(desc(sql`count(*)`))
      .limit(5),
  ]);

  // Fill missing days with 0
  const dateMap = new Map(dailyRows.map((r) => [r.date, r]));
  const series: { date: string; revenue: number; orderCount: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const row = dateMap.get(key);
    series.push({ date: key, revenue: Number(row?.revenue ?? 0), orderCount: Number(row?.orderCount ?? 0) });
  }

  return NextResponse.json({ data: { series, topProducts } });
}
