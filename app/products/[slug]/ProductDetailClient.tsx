"use client";

import { useState, useMemo } from "react";
import { ShoppingCart, Check, Plus, Minus, Truck, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { ClientCampaign } from "@/lib/campaign-engine-client";
import { evaluateCampaignsClient } from "@/lib/campaign-engine-client";

type Props = {
  product: {
    id: number;
    name: string;
    price: number;
    comparePrice: number | null;
    image: string;
    slug: string;
    stock: number;
    lowStockThreshold: number | null;
    categoryId: number | null;
    shortDescription: string | null;
    tags: string[];
  };
  campaigns: ClientCampaign[];
};

export default function ProductDetailClient({ product: p, campaigns }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = p.stock === 0;
  const subtotal = p.price * qty;

  const { applied, totalDiscount, qualifiable } = useMemo(() => {
    if (campaigns.length === 0) return { applied: [], totalDiscount: 0, qualifiable: [] };
    return evaluateCampaignsClient(
      campaigns,
      [{ id: p.id, price: p.price, quantity: qty, categoryId: p.categoryId }],
      subtotal
    );
  }, [campaigns, qty, subtotal, p.id, p.price, p.categoryId]);

  const finalPrice = Math.max(0, subtotal - totalDiscount);
  const compareDiscount = p.comparePrice
    ? Math.round((1 - p.price / p.comparePrice) * 100)
    : null;

  // Uygulanan kampanyalar için id → discount haritası
  const appliedMap = useMemo(
    () => Object.fromEntries(applied.map((a) => [a.id, a.discount])),
    [applied]
  );

  function handleAdd() {
    const cart = JSON.parse(localStorage.getItem("mesopro-cart") ?? "[]");
    const existing = cart.find((i: { id: number }) => i.id === p.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, slug: p.slug, categoryId: p.categoryId, quantity: qty });
    }
    localStorage.setItem("mesopro-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-update"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Fiyat + Kampanyalar */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {formatPrice(finalPrice)}
          </span>
          {(totalDiscount > 0 || p.comparePrice) && (
            <span className="text-lg text-zinc-400 line-through">
              {formatPrice(subtotal)}
            </span>
          )}
          {compareDiscount && totalDiscount === 0 && (
            <span className="text-sm font-semibold text-red-500">-%{compareDiscount}</span>
          )}
        </div>

        {/* Kampanya badge'leri — yeşil yandığında indirim tutarını içinde gösterir */}
        {qualifiable.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {qualifiable.map((c) => {
              const discount = appliedMap[c.id];
              const isLit = c.qualified && discount != null && discount > 0;
              return (
                <div
                  key={c.id}
                  title={c.progress ? `${c.progress.current} / ${c.progress.required}` : undefined}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-all duration-500 cursor-default select-none ${
                    isLit
                      ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-200 dark:shadow-green-900"
                      : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-500 ${isLit ? "bg-white" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                  <span>{c.badge}</span>
                  {isLit ? (
                    <span className="font-bold opacity-90">· -{formatPrice(discount)}</span>
                  ) : c.progress && !isLit ? (
                    <span className="opacity-60">{c.progress.current}/{c.progress.required}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Kısa açıklama */}
      {p.shortDescription && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {p.shortDescription}
        </p>
      )}

      {/* Stok durumu */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
          outOfStock
            ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
            : p.stock <= (p.lowStockThreshold ?? 5)
            ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
            : "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
        }`}>
          {outOfStock
            ? "Stokta yok"
            : p.stock <= (p.lowStockThreshold ?? 5)
            ? `Son ${p.stock} ürün`
            : "Stokta var"}
        </span>
      </div>

      {/* Adet seçici + Sepete ekle */}
      {!outOfStock && (
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="h-10 w-10 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="h-10 w-10 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold transition-all ${
              added
                ? "bg-green-500 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"
            }`}
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            {added ? `${qty} ürün sepete eklendi!` : "Sepete Ekle"}
          </button>
        </div>
      )}

      {outOfStock && (
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
        >
          <ShoppingCart className="h-4 w-4" />
          Stokta yok
        </button>
      )}

      {/* Avantajlar */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-3">
        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <Truck className="h-4 w-4 text-indigo-500 shrink-0" />
          Kapıda ödeme imkanı
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0" />
          Orijinal ürün garantisi
        </div>
      </div>

      {/* Etiketler */}
      {p.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {p.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
