import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { navItems } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ menuId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { menuId } = await params;
  const items = await db
    .select()
    .from(navItems)
    .where(eq(navItems.menuId, Number(menuId)))
    .orderBy(navItems.sortOrder);
  return NextResponse.json({ data: items });
}

export async function POST(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { menuId } = await params;
  const body = await req.json();

  const [item] = await db
    .insert(navItems)
    .values({
      menuId: Number(menuId),
      label: body.label,
      url: body.url,
      target: body.target ?? "_self",
      parentId: body.parentId ?? null,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
    })
    .returning();

  return NextResponse.json({ data: item }, { status: 201 });
}
