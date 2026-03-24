import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password || typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const now = new Date();
  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, now),
        isNull(passwordResetTokens.usedAt)
      )
    )
    .limit(1);

  if (!resetToken) {
    return NextResponse.json({ error: "Bağlantı geçersiz veya süresi dolmuş" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  await Promise.all([
    db.update(users).set({ password: hashed, updatedAt: now }).where(eq(users.id, resetToken.userId)),
    db.update(passwordResetTokens).set({ usedAt: now }).where(eq(passwordResetTokens.id, resetToken.id)),
  ]);

  return NextResponse.json({ message: "Şifre güncellendi" });
}
