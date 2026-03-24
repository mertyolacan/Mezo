import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { faqs } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  category: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const [updated] = await db
    .update(faqs)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(faqs.id, Number(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  await db.delete(faqs).where(eq(faqs.id, Number(id)));
  return NextResponse.json({ message: "Silindi" });
}
