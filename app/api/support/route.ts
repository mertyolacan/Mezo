import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supportTickets } from "@/lib/db/schema";
import { getUserFromRequest, getAdminFromRequest } from "@/lib/auth";
import { generateTicketNumber } from "@/lib/utils";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  const user = getUserFromRequest(req);

  if (!user && !admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const rows = admin
    ? await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt))
    : await db.select().from(supportTickets).where(eq(supportTickets.userId, user!.id)).orderBy(desc(supportTickets.createdAt));

  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  const body = await req.json();

  if (!body.subject || !body.message) {
    return NextResponse.json({ error: "Konu ve mesaj gerekli" }, { status: 400 });
  }

  const [ticket] = await db
    .insert(supportTickets)
    .values({
      ticketNumber: generateTicketNumber(),
      userId: user?.id ?? null,
      name: body.name ?? user?.email ?? "Misafir",
      email: body.email ?? user?.email ?? "",
      subject: body.subject,
      message: body.message,
      category: body.category ?? null,
      priority: body.priority ?? "medium",
    })
    .returning();

  return NextResponse.json({ data: ticket }, { status: 201 });
}
