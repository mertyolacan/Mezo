import { NextRequest, NextResponse } from "next/server";
import { evaluateCampaigns } from "@/lib/campaign-engine";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { items, subtotal, couponCode } = body;
  const user = getUserFromRequest(req);

  const result = await evaluateCampaigns(
    items ?? [],
    subtotal ?? 0,
    couponCode,
    user?.id
  );

  return NextResponse.json({ data: result });
}
