import { db } from "@/lib/db";
import { campaigns as campaignsTable, campaignUsage } from "@/lib/db/schema";
import { eq, count, inArray } from "drizzle-orm";

/**
 * Batch-insert campaign usage records and update each campaign's currentUsage counter.
 * Uses a single INSERT for all records and a single SELECT COUNT grouped by campaignId.
 */
export async function recordCampaignUsage(
  appliedCampaigns: { id: number }[],
  userId: number | null,
  orderId: number
): Promise<void> {
  if (appliedCampaigns.length === 0) return;

  await db.insert(campaignUsage).values(
    appliedCampaigns.map((ac) => ({ campaignId: ac.id, userId, orderId }))
  );

  const campaignIds = appliedCampaigns.map((ac) => ac.id);
  const usageCounts = await db
    .select({ campaignId: campaignUsage.campaignId, total: count() })
    .from(campaignUsage)
    .where(inArray(campaignUsage.campaignId, campaignIds))
    .groupBy(campaignUsage.campaignId);

  const countMap = new Map(usageCounts.map((u) => [u.campaignId, u.total]));

  for (const id of campaignIds) {
    await db
      .update(campaignsTable)
      .set({ currentUsage: countMap.get(id) ?? 0 })
      .where(eq(campaignsTable.id, id));
  }
}
