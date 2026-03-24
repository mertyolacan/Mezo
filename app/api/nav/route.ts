import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { navMenus, navItems } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const menus = await db.select().from(navMenus);
  const items = await db.select().from(navItems).orderBy(navItems.sortOrder);

  const result = menus.map((menu) => ({
    ...menu,
    items: items.filter((item) => item.menuId === menu.id),
  }));

  return NextResponse.json({ data: result });
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const { name, location } = body;

  if (!name || !location) return NextResponse.json({ error: "Ad ve konum zorunludur" }, { status: 400 });

  const [menu] = await db.insert(navMenus).values({ name, location }).returning();
  return NextResponse.json({ data: menu }, { status: 201 });
}
