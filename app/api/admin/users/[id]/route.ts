import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, orders, supportTickets } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const userId = Number(id);

  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name, phone: users.phone, role: users.role, isActive: users.isActive, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const [userOrders, userTickets] = await Promise.all([
    db.select({ id: orders.id, orderNumber: orders.orderNumber, total: orders.total, status: orders.status, createdAt: orders.createdAt })
      .from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)).limit(10),
    db.select({ id: supportTickets.id, ticketNumber: supportTickets.ticketNumber, subject: supportTickets.subject, status: supportTickets.status, createdAt: supportTickets.createdAt })
      .from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt)).limit(5),
  ]);

  return NextResponse.json({ data: { ...user, orders: userOrders, tickets: userTickets } });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const userId = Number(id);
  const { isActive, role } = await req.json();

  const update: Partial<{ isActive: boolean; role: "admin" | "user"; updatedAt: Date }> = { updatedAt: new Date() };
  if (typeof isActive === "boolean") update.isActive = isActive;
  if (role === "admin" || role === "user") update.role = role;

  await db.update(users).set(update).where(eq(users.id, userId));
  return NextResponse.json({ message: "Güncellendi" });
}
