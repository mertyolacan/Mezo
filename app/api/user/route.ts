import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getUserFromRequest } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).max(100).optional(),
});

export async function PUT(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const raw = await req.json();
  const parsed = updateUserSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const body = parsed.data;
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.name) updates.name = body.name;
  if (body.phone) updates.phone = body.phone;

  if (body.newPassword) {
    if (!body.currentPassword) {
      return NextResponse.json({ error: "Mevcut şifre gerekli" }, { status: 400 });
    }
    const [u] = await db.select({ password: users.password }).from(users).where(eq(users.id, user.id)).limit(1);
    const valid = await bcrypt.compare(body.currentPassword, u.password);
    if (!valid) return NextResponse.json({ error: "Mevcut şifre yanlış" }, { status: 400 });
    updates.password = await bcrypt.hash(body.newPassword, 12);
  }

  await db.update(users).set(updates).where(eq(users.id, user.id));
  return NextResponse.json({ message: "Güncellendi" });
}
