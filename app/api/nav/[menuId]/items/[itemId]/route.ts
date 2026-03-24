import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { navItems } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ menuId: string; itemId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { itemId } = await params;
  const body = await req.json();

  const [updated] = await db
    .update(navItems)
    .set({
      label: body.label,
      url: body.url,
      target: body.target,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    })
    .where(eq(navItems.id, Number(itemId)))
    .returning();

  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { itemId } = await params;
  await db.delete(navItems).where(eq(navItems.id, Number(itemId)));
  return NextResponse.json({ message: "Silindi" });
}
