// Tarayıcıda senkron çalışan kampanya motoru — DB/API bağımlılığı yok

export type ClientCartItem = {
  id: number;
  price: number;
  quantity: number;
  categoryId?: number | null;
};

export type ClientCampaign = {
  id: number;
  name: string;
  type: string;
  discountType: string;
  discountValue: number;
  hasCoupon?: boolean;       // kupon kampanyası olduğunu belirtir, kod gelmez
  validatedCoupon?: boolean; // sunucu kupon doğruladıysa true
  minAmount?: number | null;
  minQuantity?: number | null;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  productId?: number | null;
  categoryId?: number | null;
  isStackable: boolean;
  badge: string;
};

export type ClientAppliedCampaign = {
  id: number;
  name: string;
  type: string;
  discount: number;
  badge: string;
};

export type ClientQualifiable = {
  id: number;
  name: string;
  type: string;
  badge: string;
  qualified: boolean;
  progress?: { current: number; required: number };
  productId?: number | null;
  categoryId?: number | null;
};

export type ClientCampaignResult = {
  applied: ClientAppliedCampaign[];
  totalDiscount: number;
  qualifiable: ClientQualifiable[];
};

function calcDiscount(amount: number, discountType: string, discountValue: number): number {
  if (discountType === "percentage") {
    return Math.round((amount * discountValue) / 100 * 100) / 100;
  }
  return Math.min(discountValue, amount);
}

function evaluate(
  c: ClientCampaign,
  cartItems: ClientCartItem[],
  subtotal: number,
  couponCode?: string
): { qualified: boolean; discount: number; progress?: { current: number; required: number } } {
  const dv = c.discountValue;
  const dt = c.discountType;

  switch (c.type) {
    case "coupon": {
      // Kupon doğrulaması sunucu tarafında yapılır; validatedCoupon=true ise uygulanır
      if (!c.validatedCoupon) return { qualified: false, discount: 0 };
      return { qualified: true, discount: calcDiscount(subtotal, dt, dv) };
    }

    case "cart_total": {
      const minAmt = Number(c.minAmount ?? 0);
      const qualified = subtotal >= minAmt;
      return {
        qualified,
        discount: qualified ? calcDiscount(subtotal, dt, dv) : 0,
        progress: { current: Math.round(subtotal), required: Math.round(minAmt) },
      };
    }

    case "product": {
      const matching = cartItems.filter((i) => i.id === c.productId);
      if (!matching.length) return { qualified: false, discount: 0 };
      const base = matching.reduce((s, i) => s + i.price * i.quantity, 0);
      return { qualified: true, discount: calcDiscount(base, dt, dv) };
    }

    case "category": {
      const matching = cartItems.filter((i) => i.categoryId === c.categoryId);
      if (!matching.length) return { qualified: false, discount: 0 };
      const base = matching.reduce((s, i) => s + i.price * i.quantity, 0);
      return { qualified: true, discount: calcDiscount(base, dt, dv) };
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
      if (totalQty < buyQty) {
        return { qualified: false, discount: 0, progress: { current: totalQty, required: buyQty } };
      }

      // Sipariş başına 1 kez — kapsam içindeki en ucuz freePerGroup birim ücretsiz
      const units: number[] = [];
      for (const item of [...scopedItems].sort((a, b) => a.price - b.price)) {
        for (let j = 0; j < item.quantity; j++) units.push(item.price);
      }
      const discount = units.slice(0, freePerGroup).reduce((s, p) => s + calcDiscount(p, dt, dv), 0);
      return { qualified: true, discount, progress: { current: totalQty, required: buyQty } };
    }

    case "volume": {
      const minQty = Number(c.minQuantity ?? 2);
      const scopedItems = c.productId
        ? cartItems.filter((i) => i.id === c.productId)
        : c.categoryId
        ? cartItems.filter((i) => i.categoryId === c.categoryId)
        : cartItems;
      const totalQty = scopedItems.reduce((s, i) => s + i.quantity, 0);
      const qualified = totalQty >= minQty;
      const base = scopedItems.reduce((s, i) => s + i.price * i.quantity, 0);
      return {
        qualified,
        discount: qualified ? calcDiscount(base, dt, dv) : 0,
        progress: { current: totalQty, required: minQty },
      };
    }

    default:
      return { qualified: false, discount: 0 };
  }
}

export function evaluateCampaignsClient(
  campaigns: ClientCampaign[],
  cartItems: ClientCartItem[],
  subtotal: number,
  couponCode?: string
): ClientCampaignResult {
  const qualifiable: ClientQualifiable[] = [];
  const stackable: ClientAppliedCampaign[] = [];
  const nonStackable: ClientAppliedCampaign[] = [];

  for (const c of campaigns) {
    const { qualified, discount, progress } = evaluate(c, cartItems, subtotal, couponCode);
    qualifiable.push({
      id: c.id,
      name: c.name,
      type: c.type,
      badge: c.badge,
      qualified,
      progress,
      productId: c.productId,
      categoryId: c.categoryId,
    });

    if (!qualified || discount <= 0) continue;

    const entry: ClientAppliedCampaign = { id: c.id, name: c.name, type: c.type, discount, badge: c.badge };
    if (c.isStackable) stackable.push(entry);
    else nonStackable.push(entry);
  }

  let applied: ClientAppliedCampaign[];
  if (nonStackable.length === 0) {
    applied = stackable;
  } else {
    const stackableTotal = stackable.reduce((s, a) => s + a.discount, 0);
    const bestNS = nonStackable.reduce((best, cur) => cur.discount > best.discount ? cur : best);
    applied = bestNS.discount >= stackableTotal ? [bestNS] : stackable;
  }

  const totalDiscount = Math.min(subtotal, applied.reduce((s, a) => s + a.discount, 0));
  return { applied, totalDiscount, qualifiable };
}
