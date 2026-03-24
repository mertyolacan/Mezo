import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userAddresses } from "@/lib/db/schema";
import { getUserFromRequest } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1).max(100).optional(),
  fullName: z.string().min(1).max(255).optional(),
  phone: z.string().optional(),
  street: z.string().min(1).optional(),
  district: z.string().optional(),
  city: z.string().min(1).optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  if (parsed.data.isDefault) {
    await db.update(userAddresses).set({ isDefault: false }).where(eq(userAddresses.userId, user.id));
  }

  const [updated] = await db
    .update(userAddresses)
    .set(parsed.data)
    .where(and(eq(userAddresses.id, Number(id)), eq(userAddresses.userId, user.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  await db
    .delete(userAddresses)
    .where(and(eq(userAddresses.id, Number(id)), eq(userAddresses.userId, user.id)));

  return NextResponse.json({ message: "Silindi" });
}
