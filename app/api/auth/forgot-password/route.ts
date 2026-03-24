import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sendPasswordReset } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = await rateLimit(`forgot-pw:${ip}`, { limit: 3, window: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "Çok fazla deneme. Lütfen bekleyin." }, { status: 429 });

  const body = await req.json();
  const identifier: string = body.email ?? body.identifier ?? "";
  if (!identifier || typeof identifier !== "string") {
    return NextResponse.json({ error: "E-posta veya telefon numarası girin" }, { status: 400 });
  }

  const val = identifier.toLowerCase().trim();
  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(or(eq(users.email, val), eq(users.phone, identifier.trim())))
    .limit(1);

  // Kullanıcı yoksa bile başarılı döndür (enumeration önleme)
  if (!user) {
    return NextResponse.json({ message: "E-posta gönderildi" });
  }

  const token = randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt,
  });

  sendPasswordReset(user.email, token).catch(() => {});

  return NextResponse.json({ message: "E-posta gönderildi" });
}
