import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validations/auth";
import { signToken, getAuthCookieOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { eq, or } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { identifier, password, rememberMe } = parsed.data;

    const limitKey = `login:${ip}:${identifier}`;
    const rl = await rateLimit(limitKey, { limit: 5, window: 5 * 60_000 });
    if (!rl.ok) {
      return NextResponse.json({ error: "Çok fazla deneme. 5 dakika sonra tekrar deneyin." }, { status: 429 });
    }

    // E-posta veya telefon ile eşleştir
    const isPhone = /^[0-9+\s\-()]{7,}$/.test(identifier);
    const [user] = await db
      .select()
      .from(users)
      .where(
        isPhone
          ? eq(users.phone, identifier)
          : or(eq(users.email, identifier), eq(users.phone, identifier))
      )
      .limit(1);

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Bilgiler hatalı veya hesap bulunamadı" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Bilgiler hatalı veya hesap bulunamadı" },
        { status: 401 }
      );
    }

    const expiresInStr = rememberMe ? "30d" : "1d";
    const maxAgeSec = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    
    const token = signToken({ id: user.id, email: user.email, role: user.role }, expiresInStr);

    const response = NextResponse.json({
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    response.cookies.set("mesopro_token", token, getAuthCookieOptions(maxAgeSec));
    return response;
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
