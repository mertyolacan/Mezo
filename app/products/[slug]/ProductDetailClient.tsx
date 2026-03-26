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

  const [showCampaignDetails, setShowCampaignDetails] = useState(false);

  return (
    <div className="space-y-6 pb-24 md:pb-0">
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
          <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="h-12 w-12 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              disabled={qty >= p.stock}
              className="h-12 w-12 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 ${
              added
                ? "bg-green-500 text-white shadow-green-500/20"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            {added ? `${qty} ürün eklendi` : "Sepete Ekle"}
          </button>
        </div>
      )}

      {outOfStock && (
        <button
          disabled
          className="w-full h-14 flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
        >
          <ShoppingCart className="h-4 w-4" />
          Stokta yok
        </button>
      )}

      {/* Avantajlar */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-3">
        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <Truck className="h-4 w-4 text-indigo-500 shrink-0" />
          Ücretsiz Kargo İmkanı
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
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* STICKY BOTTOM BAR FOR MOBILE */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] flex flex-col animate-in slide-in-from-bottom duration-500">
        {/* Campaign Breakdown (Expanded State) */}
        {showCampaignDetails && applied.length > 1 && (
          <div className="bg-emerald-700 text-white text-[11px] px-6 py-3 border-b border-white/10 space-y-2 animate-in slide-in-from-bottom duration-300">
            {applied.map((c) => (
              <div key={c.id} className="flex justify-between items-center opacity-90">
                <span>{c.badge}</span>
                <span className="font-bold">{formatPrice(c.discount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Campaign Banner */}
        {(applied.length > 0 || qualifiable.some(c => c.qualified)) && (
          <div 
            onClick={() => applied.length > 1 && setShowCampaignDetails(!showCampaignDetails)}
            className="bg-emerald-600 text-white text-[10px] font-bold py-1.5 px-6 flex items-center justify-between shadow-sm cursor-pointer active:bg-emerald-700"
          >
            <span className="flex items-center gap-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              {applied.length > 1 
                ? "Toplam Kazancınız" 
                : applied.length === 1 
                ? applied[0].badge 
                : qualifiable.find(c => c.qualified)?.badge}
              {applied.length > 1 && (
                <Plus className={`w-3 h-3 transition-transform duration-300 ${showCampaignDetails ? "rotate-45" : ""}`} />
              )}
            </span>
            {totalDiscount > 0 && (
              <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                {formatPrice(totalDiscount)} {applied.length === 1 ? "kazanç" : ""}
              </span>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between gap-6 shadow-[0_-8px_30px_rgb(0,0,0,0.06)]">
          <div className="flex flex-col">
            {(totalDiscount > 0 || p.comparePrice) && (
              <span className="text-xs text-zinc-400 line-through font-medium">
                {formatPrice(subtotal)}
              </span>
            )}
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {formatPrice(finalPrice)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={`flex-1 h-12 flex items-center justify-center rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 ${
              outOfStock
                ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed"
                : added
                ? "bg-green-500 text-white"
                : "bg-indigo-600 text-white"
            }`}
          >
            {added ? "Eklendi" : outOfStock ? "Stokta Yok" : "Sepete Ekle"}
          </button>
        </div>
      </div>
    </div>


  );
}
