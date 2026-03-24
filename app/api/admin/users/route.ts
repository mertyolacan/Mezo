import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, orders } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq, count, ilike, or, desc, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = searchParams.get("q") ?? "";

  const whereClause = search
    ? or(ilike(users.email, `%${search}%`), ilike(users.name, `%${search}%`))
    : undefined;

  const [total] = await db
    .select({ count: count() })
    .from(users)
    .where(whereClause);

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  // Her kullanıcı için sipariş sayısı
  const userIds = rows.map((u) => u.id);
  const orderCounts =
    userIds.length > 0
      ? await db
          .select({ userId: orders.userId, count: count() })
          .from(orders)
          .where(inArray(orders.userId, userIds))
          .groupBy(orders.userId)
      : [];

  const orderCountMap: Record<number, number> = {};
  for (const oc of orderCounts) {
    if (oc.userId != null) orderCountMap[oc.userId] = oc.count;
  }

  const data = rows.map((u) => ({ ...u, orderCount: orderCountMap[u.id] ?? 0 }));

  return NextResponse.json({
    data,
    pagination: { page, limit, total: total.count, totalPages: Math.ceil(total.count / limit) },
  });
}
