import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supportTickets } from "@/lib/db/schema";
import { getUserFromRequest, getAdminFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = getUserFromRequest(req);
  const admin = getAdminFromRequest(req);
  if (!user && !admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, Number(id))).limit(1);
  if (!ticket) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (!admin && ticket.userId !== user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  return NextResponse.json({ data: ticket });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const [updated] = await db
    .update(supportTickets)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(supportTickets.id, Number(id)))
    .returning();

  return NextResponse.json({ data: updated });
}
