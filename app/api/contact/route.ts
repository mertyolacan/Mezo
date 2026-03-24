import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { sendContactAutoReply } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const messages = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  return NextResponse.json({ data: messages });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = await rateLimit(`contact:${ip}`, { limit: 3, window: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "Çok fazla deneme. Lütfen bekleyin." }, { status: 429 });

  const body = await req.json();
  const { name, email, phone, subject, message } = body;

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Ad, e-posta, konu ve mesaj zorunludur" }, { status: 400 });
  }

  const [msg] = await db
    .insert(contactMessages)
    .values({ name, email, phone: phone || null, subject, message })
    .returning();

  // Fire-and-forget auto-reply
  sendContactAutoReply(email, name).catch(() => {});

  return NextResponse.json({ data: msg }, { status: 201 });
}
