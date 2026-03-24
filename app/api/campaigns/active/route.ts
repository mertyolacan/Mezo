import { NextResponse } from "next/server";
import { getActiveCampaigns } from "@/lib/cache";

export const runtime = "edge";
export const revalidate = 60;

function badge(type: string, name: string) {
  const map: Record<string, string> = {
    coupon: "🏷️ " + name,
    cart_total: "🛒 " + name,
    product: "📦 " + name,
    category: "🗂️ " + name,
    bogo: "🎁 " + name,
    volume: "📊 " + name,
  };
  return map[type] ?? name;
}

export async function GET() {
  const rows = await getActiveCampaigns();

  const data = rows
    .filter((c) => !c.maxUsage || c.currentUsage < c.maxUsage)
    .map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      discountType: c.discountType,
      discountValue: Number(c.discountValue),
      hasCoupon: !!c.couponCode, // kod kendisi gönderilmez, sadece "kupon kampanyası var" bilgisi
      minAmount: c.minAmount ? Number(c.minAmount) : null,
      minQuantity: c.minQuantity ?? null,
      buyQuantity: c.buyQuantity ?? null,
      getQuantity: c.getQuantity ?? null,
      productId: c.productId ?? null,
      categoryId: c.categoryId ?? null,
      isStackable: c.isStackable,
      badge: badge(c.type, c.name),
    }));

  return NextResponse.json({ data });
}
