import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { and, eq, gte, lte, or, isNull } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rl = await rateLimit(`coupon:${ip}`, { limit: 10, window: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "Çok fazla deneme. Bekleyin." }, { status: 429 });

  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const now = new Date();
  const [campaign] = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.couponCode, code.toUpperCase()),
        eq(campaigns.isActive, true),
        eq(campaigns.type, "coupon"),
        or(isNull(campaigns.startDate), lte(campaigns.startDate, now)),
        or(isNull(campaigns.endDate), gte(campaigns.endDate, now))
      )
    )
    .limit(1);

  if (!campaign) {
    return NextResponse.json({ valid: false, error: "Kupon kodu geçersiz veya süresi dolmuş" }, { status: 400 });
  }

  return NextResponse.json({ valid: true, campaignId: campaign.id });
}
