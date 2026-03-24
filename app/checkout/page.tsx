import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, userAddresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getActiveCampaigns } from "@/lib/cache";
import CheckoutForm from "./CheckoutForm";
import type { ClientCampaign } from "@/lib/campaign-engine-client";

const badgeMap: Record<string, string> = {
  coupon: "🏷️ ",
  cart_total: "🛒 ",
  product: "📦 ",
  category: "🗂️ ",
  bogo: "🎁 ",
  volume: "📊 ",
};

export default async function CheckoutPage() {
  const authUser = await getAuthUser();

  const [fullUser, addresses, rawCampaigns] = await Promise.all([
    authUser
      ? db.select({ name: users.name, email: users.email, phone: users.phone })
          .from(users).where(eq(users.id, authUser.id)).limit(1).then((r) => r[0] ?? null)
      : Promise.resolve(null),
    authUser
      ? db.select().from(userAddresses).where(eq(userAddresses.userId, authUser.id))
      : Promise.resolve([]),
    getActiveCampaigns(),
  ]);

  const initialCampaigns: ClientCampaign[] = rawCampaigns
    .filter((c) => !c.maxUsage || c.currentUsage < c.maxUsage)
    .map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      discountType: c.discountType,
      discountValue: Number(c.discountValue),
      hasCoupon: !!c.couponCode,
      validatedCoupon: false,
      minAmount: c.minAmount ? Number(c.minAmount) : null,
      minQuantity: c.minQuantity ?? null,
      buyQuantity: c.buyQuantity ?? null,
      getQuantity: c.getQuantity ?? null,
      productId: c.productId ?? null,
      categoryId: c.categoryId ?? null,
      isStackable: c.isStackable,
      badge: (badgeMap[c.type] ?? "") + c.name,
    }));

  return (
    <CheckoutForm
      initialUser={
        fullUser
          ? { name: fullUser.name ?? "", email: fullUser.email, phone: fullUser.phone ?? "" }
          : null
      }
      initialAddresses={addresses}
      initialCampaigns={initialCampaigns}
    />
  );
}
