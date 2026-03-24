import { db } from "@/lib/db";
import { campaigns, campaignUsage } from "@/lib/db/schema";
import { eq, and, gte, lte, or, isNull } from "drizzle-orm";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  categoryId?: number | null;
};

export type AppliedCampaign = {
  id: number;
  name: string;
  type: string;
  discount: number;
  badge: string;
};

export type CampaignCheckResult = {
  applied: AppliedCampaign[];
  totalDiscount: number;
  qualifiable: QualifiableCampaign[];
};

export type QualifiableCampaign = {
  id: number;
  name: string;
  type: string;
  badge: string;
  qualified: boolean;
  progress?: { current: number; required: number };
};

function calcDiscount(amount: number, discountType: string, discountValue: number): number {
  if (discountType === "percentage") {
    return Math.round((amount * discountValue) / 100 * 100) / 100;
  }
  return Math.min(discountValue, amount);
}

function campaignBadge(type: string, name: string): string {
  const badges: Record<string, string> = {
    coupon:     "🏷️ " + name,
    cart_total: "🛒 " + name,
    product:    "📦 " + name,
    category:   "🗂️ " + name,
    bogo:       "🎁 " + name,
    volume:     "📊 " + name,
  };
  return badges[type] ?? name;
}

// Kampanya tipine göre indirim miktarını hesapla, uygunluk bilgisini döndür
function evaluateCampaignDiscount(
  c: Record<string, unknown>,
  cartItems: CartItem[],
  subtotal: number,
  couponCode?: string
): { qualified: boolean; discount: number; progress?: { current: number; required: number } } {
  const discountVal = Number(c.discountValue);
  const discountType = c.discountType as string;

  switch (c.type) {
    case "coupon": {
      if (!couponCode || c.couponCode !== couponCode) return { qualified: false, discount: 0 };
      return { qualified: true, discount: calcDiscount(subtotal, discountType, discountVal) };
    }

    case "cart_total": {
      const minAmt = Number(c.minAmount ?? 0);
      const qualified = subtotal >= minAmt;
      return {
        qualified,
        discount: qualified ? calcDiscount(subtotal, discountType, discountVal) : 0,
        progress: { current: Math.round(subtotal), required: Math.round(minAmt) },
      };
    }

    case "product": {
      const matching = cartItems.filter((i) => i.id === (c.productId as number));
      const qualified = matching.length > 0;
      if (!qualified) return { qualified: false, discount: 0 };
      const base = matching.reduce((s, i) => s + i.price * i.quantity, 0);
      return { qualified: true, discount: calcDiscount(base, discountType, discountVal) };
    }

    case "category": {
      const matching = cartItems.filter((i) => i.categoryId === (c.categoryId as number));
      const qualified = matching.length > 0;
      if (!qualified) return { qualified: false, discount: 0 };
      const base = matching.reduce((s, i) => s + i.price * i.quantity, 0);
      return { qualified: true, discount: calcDiscount(base, discountType, discountVal) };
    }

    case "bogo": {
      const buyQty = Number(c.buyQuantity ?? 3);
      const payQty = Number(c.getQuantity ?? 2);
      const freePerGroup = buyQty - payQty;
      if (freePerGroup <= 0) return { qualified: false, discount: 0 };

      // Kapsam: ürün veya kategori seçiliyse sadece onları say, yoksa tüm sepet
      const scopedItems = c.productId
        ? cartItems.filter((i) => i.id === c.productId)
        : c.categoryId
        ? cartItems.filter((i) => i.categoryId === c.categoryId)
        : cartItems;

      const totalQty = scopedItems.reduce((s, i) => s + i.quantity, 0);
      const qualified = totalQty >= buyQty;
      if (!qualified) {
        return { qualified: false, discount: 0, progress: { current: totalQty, required: buyQty } };
      }

      // Sipariş başına 1 kez — kapsam içindeki en ucuz freePerGroup birim ücretsiz
      const units: number[] = [];
      for (const item of [...scopedItems].sort((a, b) => a.price - b.price)) {
        for (let j = 0; j < item.quantity; j++) units.push(item.price);
      }
      const discount = units.slice(0, freePerGroup).reduce((s, price) => s + calcDiscount(price, discountType, discountVal), 0);
      return { qualified: true, discount, progress: { current: totalQty, required: buyQty } };
    }

    case "volume": {
      const minQty = Number(c.minQuantity ?? 2);
      const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);
      const qualified = totalQty >= minQty;
      return {
        qualified,
        discount: qualified ? calcDiscount(subtotal, discountType, discountVal) : 0,
        progress: { current: totalQty, required: minQty },
      };
    }

    default:
      return { qualified: false, discount: 0 };
  }
}

export async function evaluateCampaigns(
  cartItems: CartItem[],
  subtotal: number,
  couponCode?: string,
  userId?: number
): Promise<CampaignCheckResult> {
  const now = new Date();

  const activeCampaigns = await db
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.isActive, true),
        or(isNull(campaigns.startDate), lte(campaigns.startDate, now)),
        or(isNull(campaigns.endDate), gte(campaigns.endDate, now))
      )
    );

  const qualifiable: QualifiableCampaign[] = [];
  const stackableCandidates: AppliedCampaign[] = [];
  const nonStackableCandidates: AppliedCampaign[] = [];

  for (const c of activeCampaigns) {
    const badge = campaignBadge(c.type, c.name);

    // Max kullanım kontrolü
    if (c.maxUsage && c.currentUsage >= c.maxUsage) continue;

    // Kullanıcı limiti kontrolü
    if (userId && c.perUserLimit) {
      const [usage] = await db
        .select()
        .from(campaignUsage)
        .where(and(eq(campaignUsage.campaignId, c.id), eq(campaignUsage.userId, userId)))
        .limit(1);
      if (usage) continue;
    }

    const { qualified, discount, progress } = evaluateCampaignDiscount(
      c as Record<string, unknown>,
      cartItems,
      subtotal,
      couponCode
    );

    // Badge için her kampanyayı qualifiable listesine ekle
    qualifiable.push({ id: c.id, name: c.name, type: c.type, badge, qualified, progress });

    if (!qualified || discount <= 0) continue;

    const entry: AppliedCampaign = { id: c.id, name: c.name, type: c.type, discount, badge };

    if (c.isStackable) {
      stackableCandidates.push(entry);
    } else {
      nonStackableCandidates.push(entry);
    }
  }

  // Hangi kampanyaları uygulayacağımıza karar ver:
  // - Sadece stackable varsa → hepsini uygula
  // - Non-stackable varsa → tek tek karşılaştır:
  //   en iyi non-stackable mi, yoksa tüm stackable toplamı mı daha avantajlı?
  let applied: AppliedCampaign[];

  if (nonStackableCandidates.length === 0) {
    // Tümü stackable, hepsini uygula
    applied = stackableCandidates;
  } else {
    const stackableTotal = stackableCandidates.reduce((s, a) => s + a.discount, 0);
    const bestNonStackable = nonStackableCandidates.reduce((best, cur) =>
      cur.discount > best.discount ? cur : best
    );

    if (bestNonStackable.discount >= stackableTotal) {
      // En iyi non-stackable kampanya tek başına daha avantajlı
      applied = [bestNonStackable];
    } else {
      // Stackable kampanyalar toplamı daha avantajlı
      applied = stackableCandidates;
    }
  }

  // İndirim toplamı sepet tutarını aşamaz
  const rawDiscount = applied.reduce((s, a) => s + a.discount, 0);
  const totalDiscount = Math.min(subtotal, rawDiscount);

  return { applied, totalDiscount, qualifiable };
}
