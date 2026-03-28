"use client";

import { useState, useMemo } from "react";
import { ShoppingCart, Check, Plus, Minus, Truck, ShieldCheck, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { ClientCampaign } from "@/lib/campaign-engine-client";
import { evaluateCampaignsClient } from "@/lib/campaign-engine-client";
import Link from "next/link";
import Image from "next/image";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setIsModalOpen(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const [showCampaignDetails, setShowCampaignDetails] = useState(false);

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Fiyat + Kampanyalar — DESKTOP ONLY */}
      <div className="hidden md:flex flex-col gap-4">
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-black text-indigo-600 tabular-nums tracking-tighter">
            {formatPrice(finalPrice)}
          </span>
          {(totalDiscount > 0 || p.comparePrice) && (
            <div className="flex flex-col justify-center">
              <span className="text-base text-zinc-400 line-through font-bold opacity-40 leading-none">
                {formatPrice(subtotal)}
              </span>
              {totalDiscount > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                   <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-tighter leading-none">Toplam Kazanç:</span>
                   <span className="text-[11px] font-black text-emerald-600 tabular-nums leading-none tracking-tight">{formatPrice(totalDiscount)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kampanya badge'leri */}
        {(() => {
          if (qualifiable.length === 0) return null;
          return (
            <div className="flex flex-wrap gap-2 pt-2">
              {qualifiable.map((c) => {
                const discount = appliedMap[c.id];
                const isLit = c.qualified && discount != null && discount > 0;
                return (
                  <div
                    key={c.id}
                    className={`flex items-center gap-2 text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all duration-300 uppercase leading-none ${
                      isLit
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm"
                        : "bg-white border-zinc-200 text-zinc-700"
                    }`}
                  >
                    <span className="shrink-0">{c.badge}</span>
                    {isLit && discount != null && discount > 0 ? (
                      <span className="font-black text-emerald-600 tabular-nums">· -{formatPrice(discount)}</span>
                    ) : c.progress && (
                      <span className="text-zinc-500 font-medium ml-1">({c.progress.current}/{c.progress.required})</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full" />

      {/* Kısa açıklama & Stok durumu */}
      <div className="space-y-4">
        {p.shortDescription && (
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed italic border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
            {p.shortDescription}
          </p>
        )}

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
            outOfStock
              ? "bg-red-50 text-red-600 border border-red-100"
              : p.stock <= (p.lowStockThreshold ?? 5)
              ? "bg-amber-50 text-amber-600 border border-amber-100"
              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full mr-2 ${outOfStock ? "bg-red-500" : p.stock <= (p.lowStockThreshold ?? 5) ? "bg-amber-500" : "bg-emerald-500"}`} />
            {outOfStock
              ? "Stokta yok"
              : p.stock <= (p.lowStockThreshold ?? 5)
              ? `Son ${p.stock} ürün`
              : "Stokta var"}
          </span>
        </div>
      </div>

      {/* Adet seçici + Sepete ekle — DESKTOP ONLY */}
      {!outOfStock && (
        <div className="hidden md:flex flex-col gap-6 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
           <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sipariş Adeti</span>
              <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm h-12">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="w-14 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  disabled={qty >= p.stock}
                  className="w-14 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
           </div>

          <button
            onClick={handleAdd}
            className={`w-full h-16 flex items-center justify-center gap-3 rounded-2xl text-base font-black transition-all shadow-xl active:scale-95 uppercase tracking-widest ${
              added
                ? "bg-green-500 text-white shadow-green-500/20"
                : "bg-indigo-900 hover:bg-indigo-800 text-white shadow-indigo-900/20"
            }`}
          >
            {added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
            {added ? "SEPETE EKLENDİ" : "SEPETE EKLE"}
          </button>
        </div>
      )}

      {outOfStock && (
        <button
          disabled
          className="hidden md:flex w-full h-16 items-center justify-center gap-2 rounded-2xl text-base font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed uppercase tracking-widest"
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

      {/* STICKY BOTTOM BAR FOR MOBILE — CART THEME */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] flex flex-col pointer-events-none">
        {/* Campaign Breakdown (Expanded State) */}
        {showCampaignDetails && applied.length > 1 && (
          <div className="bg-emerald-600 text-white text-[11px] px-8 py-5 rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.1)] border-b border-white/10 space-y-3 animate-in slide-in-from-bottom duration-500 pointer-events-auto">
             <div className="flex items-center justify-between mb-2">
                <h4 className="font-black uppercase tracking-widest text-[10px]">İndirim Detayı</h4>
                <button onClick={() => setShowCampaignDetails(false)}><X className="h-4 w-4" /></button>
             </div>
            {applied.map((c) => (
              <div key={c.id} className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md">
                <span className="font-bold uppercase tracking-tight text-[10px]">{c.badge}</span>
                <span className="font-black tabular-nums">{formatPrice(c.discount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-white dark:bg-zinc-950 rounded-t-[2.5rem] border-t border-zinc-100 dark:border-zinc-800 px-5 pt-4 pb-6 xs:pb-8 flex items-center justify-between gap-4 shadow-[0_-15px_50px_rgba(0,0,0,0.12)] pointer-events-auto">
          <div 
             className="flex flex-col cursor-pointer select-none min-w-0" 
             onClick={() => applied.length > 1 ? setShowCampaignDetails(!showCampaignDetails) : null}
          >
             <div className="flex items-center gap-1 text-zinc-500 font-bold tracking-wide uppercase text-[9px] mb-1">
                 Fiyat {applied.length > 1 && (showCampaignDetails ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />)}
             </div>
             <div className="flex flex-col">
                 <div className="text-xl xs:text-2xl font-black text-indigo-600 tabular-nums tracking-tight leading-none">
                     {formatPrice(finalPrice)}
                 </div>
                 {totalDiscount > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5 overflow-hidden">
                       <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded uppercase leading-none shrink-0">Kazanç:</span>
                       <span className="text-[11px] font-black text-emerald-600 tabular-nums leading-none tracking-tight truncate">{formatPrice(totalDiscount)}</span>
                    </div>
                 )}
             </div>
          </div>

          <div className="flex flex-1 items-center gap-2">
            {!outOfStock && (
              <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 h-12 shadow-sm">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="h-full px-5 flex items-center justify-center text-zinc-500 active:bg-zinc-100 disabled:opacity-30 transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[1.5rem] text-center text-xs font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  disabled={qty >= p.stock}
                  className="h-full px-5 flex items-center justify-center text-zinc-500 active:bg-zinc-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl text-[11px] xs:text-xs font-black transition-all shadow-lg active:scale-95 uppercase tracking-wide px-2 ${
                outOfStock
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed"
                  : added
                  ? "bg-green-500 text-white shadow-green-500/20"
                  : "bg-indigo-900 text-white shadow-indigo-900/20"
              }`}
            >
              {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              <span>{added ? "EKLENDİ" : outOfStock ? "STOKTA YOK" : "EKLE"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL — THEME STANDARDIZED */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full sm:max-w-[420px] bg-white dark:bg-zinc-950 rounded-t-[2.5rem] sm:rounded-3xl shadow-[0_-10px_50px_rgba(0,0,0,0.25)] overflow-hidden animate-in slide-in-from-bottom duration-500 sm:zoom-in-95">
            <div className="flex items-center justify-between px-6 xs:px-8 pt-8 pb-4">
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
                 <Check className="h-6 w-6 text-emerald-500" /> Sepete Eklendi
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 -mr-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors group"
                aria-label="Kapat"
              >
                <X className="h-5 w-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
              </button>
            </div>
            <div className="px-6 xs:px-8 pb-8">
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full mb-6" />
              
              <div className="flex gap-4 mb-8 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shrink-0 shadow-sm flex items-center justify-center">
                  <Image src={p.image} alt={p.name} fill className="object-contain p-2" />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 line-clamp-1 leading-none">{p.name}</p>
                  <p className="text-xs font-bold text-zinc-500 mt-2">{qty} ADET · {formatPrice(finalPrice)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link 
                  href="/cart"
                  className="w-full h-14 bg-indigo-900 hover:bg-indigo-800 text-white flex items-center justify-center rounded-2xl text-sm font-black transition-all active:scale-[0.98] shadow-xl shadow-indigo-900/20 uppercase tracking-widest"
                >
                  SEPETE GİT
                </Link>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full h-14 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex items-center justify-center rounded-2xl text-sm font-black hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-[0.98] uppercase tracking-widest"
                >
                  ALIŞVERİŞE DEVAM ET
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
