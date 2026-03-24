import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userAddresses } from "@/lib/db/schema";
import { getUserFromRequest } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1).max(100),
  fullName: z.string().min(1).max(255),
  phone: z.string().optional(),
  street: z.string().min(1),
  district: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().optional(),
  country: z.string().default("Türkiye"),
  isDefault: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const rows = await db
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.userId, user.id))
    .orderBy(asc(userAddresses.createdAt));

  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  // Eğer isDefault ise diğerlerini false yap
  if (parsed.data.isDefault) {
    await db.update(userAddresses).set({ isDefault: false }).where(eq(userAddresses.userId, user.id));
  }

  const [address] = await db
    .insert(userAddresses)
    .values({ ...parsed.data, userId: user.id })
    .returning();

  return NextResponse.json({ data: address }, { status: 201 });
}
