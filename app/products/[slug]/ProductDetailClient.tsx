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
          <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
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

        <div className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 px-4 py-4 flex items-center justify-between gap-3 shadow-[0_-8px_30px_rgb(0,0,0,0.06)]">
          <div className="flex flex-col min-w-[80px]">
            {(totalDiscount > 0 || p.comparePrice) && (
              <span className="text-[10px] text-zinc-400 line-through font-medium leading-none mb-1">
                {formatPrice(subtotal)}
              </span>
            )}
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">
              {formatPrice(finalPrice)}
            </span>
          </div>

          {!outOfStock && (
            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 h-12 shadow-sm">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="h-full px-3 flex items-center justify-center text-zinc-500 active:bg-zinc-50 dark:active:bg-zinc-800 disabled:opacity-30 transition-colors"
                aria-label="Azalt"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-zinc-900 dark:text-zinc-50">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                disabled={qty >= p.stock}
                className="h-full px-3 flex items-center justify-center text-zinc-500 active:bg-zinc-50 dark:active:bg-zinc-800 transition-colors"
                aria-label="Artır"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 ${
              outOfStock
                ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed"
                : added
                ? "bg-green-500 text-white"
                : "bg-indigo-600 text-white"
            }`}
          >
            {added ? (
              <>
                <Check className="h-5 w-5" />
                <span>Eklendi</span>
              </>
            ) : outOfStock ? (
              "Stokta Yok"
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                <span>Sepete Ekle</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* BOYNAR STYLE SUCCESS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full sm:max-w-[420px] bg-white dark:bg-zinc-950 rounded-t-[32px] sm:rounded-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] overflow-hidden animate-in slide-in-from-bottom duration-500 sm:zoom-in-95">
            <div className="flex items-center justify-between px-8 pt-8 pb-4">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Ürün Sepete Eklendi</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 -mr-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors group"
                aria-label="Kapat"
              >
                <X className="h-6 w-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
              </button>
            </div>

            <div className="px-8 pb-8">
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 w-full mb-8" />
              
              <div className="flex gap-4 mb-10">
                <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shrink-0">
                  <Image src={p.image} alt={p.name} fill className="object-contain p-3" />
                </div>
                <div className="flex flex-col justify-center space-y-1">
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-snug">{p.name}</p>
                  <p className="text-sm font-medium text-zinc-500">{qty} Adet · {formatPrice(finalPrice)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link 
                  href="/cart"
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center rounded-2xl text-[15px] font-bold transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20"
                >
                  SEPETE GİT
                </Link>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full h-14 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center rounded-2xl text-[15px] font-bold hover:border-zinc-300 dark:hover:border-zinc-600 transition-all active:scale-[0.98]"
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
