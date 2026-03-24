import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq, lte, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const lowStockProducts = await db
    .select({
      id: products.id,
      name: products.name,
      stock: products.stock,
      lowStockThreshold: products.lowStockThreshold,
      slug: products.slug,
    })
    .from(products)
    .where(
      eq(products.isActive, true)
    )
    .then((rows) => rows.filter((p) => p.stock <= (p.lowStockThreshold ?? 5)));

  return NextResponse.json({ data: lowStockProducts });
}
