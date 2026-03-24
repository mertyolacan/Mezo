import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, supportTickets, productReviews, products, contactMessages, users } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const userId = Number(id);
  const section = req.nextUrl.searchParams.get("section");

  if (section === "orders") {
    const data = await db
      .select({ id: orders.id, orderNumber: orders.orderNumber, total: orders.total, status: orders.status, createdAt: orders.createdAt })
      .from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    return NextResponse.json({ data });
  }

  if (section === "reviews") {
    const data = await db
      .select({ id: productReviews.id, rating: productReviews.rating, title: productReviews.title, comment: productReviews.comment, isApproved: productReviews.isApproved, createdAt: productReviews.createdAt, productName: products.name, productSlug: products.slug })
      .from(productReviews)
      .leftJoin(products, eq(productReviews.productId, products.id))
      .where(eq(productReviews.userId, userId))
      .orderBy(desc(productReviews.createdAt));
    return NextResponse.json({ data });
  }

  if (section === "tickets") {
    const data = await db
      .select({ id: supportTickets.id, ticketNumber: supportTickets.ticketNumber, subject: supportTickets.subject, status: supportTickets.status, createdAt: supportTickets.createdAt })
      .from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt));
    return NextResponse.json({ data });
  }

  if (section === "messages") {
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return NextResponse.json({ data: [] });
    const data = await db
      .select({ id: contactMessages.id, subject: contactMessages.subject, message: contactMessages.message, phone: contactMessages.phone, isRead: contactMessages.isRead, createdAt: contactMessages.createdAt, email: contactMessages.email })
      .from(contactMessages).where(eq(contactMessages.email, user.email)).orderBy(desc(contactMessages.createdAt));
    return NextResponse.json({ data });
  }

  return NextResponse.json({ error: "Geçersiz section" }, { status: 400 });
}
