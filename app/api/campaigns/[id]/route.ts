import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { invalidateCampaigns } from "@/lib/cache";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(["coupon", "cart_total", "product", "category", "bogo", "volume"]).optional(),
  discountType: z.enum(["percentage", "fixed"]).optional(),
  discountValue: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  isStackable: z.boolean().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  minAmount: z.number().nullable().optional(),
  minQuantity: z.number().int().nullable().optional(),
  buyQuantity: z.number().int().nullable().optional(),
  getQuantity: z.number().int().nullable().optional(),
  couponCode: z.string().max(50).nullable().optional(),
  productId: z.number().int().nullable().optional(),
  categoryId: z.number().int().nullable().optional(),
  maxUsage: z.number().int().nullable().optional(),
  perUserLimit: z.number().int().nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const d = parsed.data;
  const [updated] = await db
    .update(campaigns)
    .set({
      ...d,
      discountValue: d.discountValue ? String(d.discountValue) : undefined,
      minAmount: d.minAmount !== undefined ? (d.minAmount ? String(d.minAmount) : null) : undefined,
      startDate: d.startDate !== undefined ? (d.startDate ? new Date(d.startDate) : null) : undefined,
      endDate: d.endDate !== undefined ? (d.endDate ? new Date(d.endDate) : null) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, Number(id)))
    .returning();

  invalidateCampaigns();
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  await db.delete(campaigns).where(eq(campaigns.id, Number(id)));
  invalidateCampaigns();
  return NextResponse.json({ message: "Silindi" });
}
