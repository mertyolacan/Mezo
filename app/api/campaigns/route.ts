import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { getAdminFromRequest } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { invalidateCampaigns } from "@/lib/cache";
import { z } from "zod";

const campaignSchema = z.object({
  name: z.string().min(1, "Kampanya adı gerekli").max(255),
  type: z.enum(["coupon", "cart_total", "product", "category", "bogo", "volume"]),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive("İndirim değeri pozitif olmalı"),
  isActive: z.boolean().default(true),
  isStackable: z.boolean().default(false),
  badgeImage: z.string().nullable().optional(),
  showBadge: z.boolean().default(false),
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

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const rows = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const d = parsed.data;
  const [campaign] = await db
    .insert(campaigns)
    .values({
      ...d,
      discountValue: String(d.discountValue),
      minAmount: d.minAmount ? String(d.minAmount) : null,
      startDate: d.startDate ? new Date(d.startDate) : null,
      endDate: d.endDate ? new Date(d.endDate) : null,
    })
    .returning();

  invalidateCampaigns();
  return NextResponse.json({ data: campaign }, { status: 201 });
}
