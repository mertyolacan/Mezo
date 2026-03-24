import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ticketReplies, supportTickets } from "@/lib/db/schema";
import { getUserFromRequest, getAdminFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const rows = await db
    .select()
    .from(ticketReplies)
    .where(eq(ticketReplies.ticketId, Number(id)))
    .orderBy(ticketReplies.createdAt);

  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = getUserFromRequest(req);
  const admin = getAdminFromRequest(req);
  if (!user && !admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: "Mesaj gerekli" }, { status: 400 });

  const [reply] = await db
    .insert(ticketReplies)
    .values({
      ticketId: Number(id),
      message,
      isAdmin: !!admin,
      authorName: admin ? "Destek Ekibi" : (user?.email ?? "Kullanıcı"),
    })
    .returning();

  // Admin yanıtladıysa ticket'i in_progress yap
  if (admin) {
    await db
      .update(supportTickets)
      .set({ status: "in_progress", updatedAt: new Date() })
      .where(eq(supportTickets.id, Number(id)));
  }

  return NextResponse.json({ data: reply }, { status: 201 });
}
