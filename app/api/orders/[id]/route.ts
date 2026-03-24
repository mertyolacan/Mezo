import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { getAdminFromRequest, getUserFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sendOrderStatusUpdate } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const [order] = await db.select().from(orders).where(eq(orders.id, Number(id))).limit(1);
  if (!order) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  // Admin veya siparişin sahibi görebilir
  if (user.role !== "admin" && order.userId !== user.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  return NextResponse.json({ data: order });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const [existing] = await db.select().from(orders).where(eq(orders.id, Number(id))).limit(1);
  if (!existing) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const [updated] = await db
    .update(orders)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(orders.id, Number(id)))
    .returning();

  // Status değiştiyse e-posta gönder
  if (body.status && body.status !== existing.status && updated.userId) {
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, updated.userId)).limit(1);
    if (user?.email) {
      sendOrderStatusUpdate(user.email, updated.orderNumber, updated.status).catch(() => {});
    }
  }

  return NextResponse.json({ data: updated });
}
