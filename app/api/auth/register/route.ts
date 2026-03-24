import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, userAddresses } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validations/auth";
import { signToken, getAuthCookieOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { sendWelcome } from "@/lib/email";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
    const rl = await rateLimit(`register:${ip}`, { limit: 5, window: 60_000 }); // 5 req/min per IP
    if (!rl.ok) {
      return NextResponse.json({ error: "Çok fazla deneme. Lütfen bekleyin." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, phone, address } = parsed.data;

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(users)
      .values({ name, email, password: hashed, phone, role: "user" })
      .returning({ id: users.id, email: users.email, role: users.role });

    if (address?.street) {
      await db.insert(userAddresses).values({
        userId: user.id,
        title: "Varsayılan",
        fullName: name ?? email,
        phone: phone ?? null,
        street: address.street,
        district: address.district ?? "",
        city: address.city,
        postalCode: address.postalCode ?? "",
        country: "Türkiye",
        isDefault: true,
      });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    sendWelcome(user.email, name ?? email).catch(() => {});

    const response = NextResponse.json({ message: "Kayıt başarılı" }, { status: 201 });
    response.cookies.set("mesopro_token", token, getAuthCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
