"use client";

import { useCart } from "@/contexts/CartContext";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { evaluateCampaignsClient } from "@/lib/campaign-engine-client";
import type { ClientCampaign } from "@/lib/campaign-engine-client";

export default function CartDrawer() {
  const { items, total, count, remove, updateQty, isOpen, closeCart } = useCart();
  const [activeCampaigns, setActiveCampaigns] = useState<ClientCampaign[]>([]);

  useEffect(() => {
    const CACHE_KEY = "mesopro_campaigns";
    const CACHE_TTL = 60_000; // 60 saniye
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) { setActiveCampaigns(data); return; }
      }
    } catch {}
    fetch("/api/campaigns/active")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) {
          setActiveCampaigns(d.data);
          try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: d.data, ts: Date.now() })); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const { applied, totalDiscount, qualifiable } = useMemo(() => {
    if (items.length === 0) return { applied: [], totalDiscount: 0, qualifiable: [] };
    return evaluateCampaignsClient(
      activeCampaigns,
      items.map((i) => ({ id: i.id, price: i.price, quantity: i.quantity, categoryId: undefined })),
      total
    );
  }, [activeCampaigns, items, total]);

  const appliedMap = useMemo(
    () => Object.fromEntries(applied.map((a) => [a.id, a.discount])),
    [applied]
  );

  const finalTotal = Math.max(0, total - totalDiscount);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-zinc-950 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-indigo-500" />
            <span className="font-bold text-zinc-900 dark:text-zinc-50">Sepet</span>
            {count > 0 && (
              <span className="text-xs bg-indigo-600 text-white font-semibold px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <ShoppingBag className="h-7 w-7 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sepetiniz boş</p>
                <p className="text-xs text-zinc-400 mt-1">Ürün ekleyerek başlayın</p>
              </div>
              <button
                onClick={closeCart}
                className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                Alışverişe devam et
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 px-5 py-4">
                  <div className="relative shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800" style={{ width: 72, height: 72 }}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="72px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="h-6 w-6 text-zinc-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-snug">
                        {item.name}
                      </p>
                      <button
                        onClick={() => remove(item.id)}
                        className="shrink-0 p-0.5 text-zinc-300 hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400 transition-colors mt-0.5"
                        aria-label="Kaldır"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="h-7 w-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-bold w-7 text-center text-zinc-900 dark:text-zinc-50">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="h-7 w-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-5 py-5 space-y-4">

            {/* Kampanya badge'leri */}
            {qualifiable.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Kampanyalar</p>
                <div className="flex flex-wrap gap-1.5">
                  {qualifiable.map((c) => {
                    const discount = appliedMap[c.id];
                    const isLit = c.qualified && discount != null && discount > 0;
                    return (
                      <div
                        key={c.id}
                        title={c.progress ? `${c.progress.current} / ${c.progress.required}` : undefined}
                        className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all duration-500 cursor-default select-none ${
                          isLit
                            ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-200 dark:shadow-green-900"
                            : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isLit ? "bg-white" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                        <span>{c.badge}</span>
                        {isLit ? (
                          <span className="font-bold opacity-90">· -{formatPrice(discount)}</span>
                        ) : c.progress ? (
                          <span className="opacity-60">{c.progress.current}/{c.progress.required}</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fiyat özeti */}
            <div className="space-y-1.5">
              {totalDiscount > 0 && (
                <div className="flex items-center justify-between text-sm text-zinc-400">
                  <span>Ara toplam</span>
                  <span>{formatPrice(total)}</span>
                </div>
              )}
              {applied.map((ac) => (
                <div key={ac.id} className="flex items-center justify-between text-xs text-green-600 dark:text-green-400">
                  <span className="truncate mr-2">{ac.name}</span>
                  <span className="shrink-0 font-medium">-{formatPrice(ac.discount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm text-zinc-500">{count} ürün · Toplam</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{formatPrice(finalTotal)}</span>
                  {totalDiscount > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">{formatPrice(totalDiscount)} tasarruf</p>
                  )}
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex items-center justify-between w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold py-3.5 px-5 rounded-2xl transition-colors"
            >
              <span>Siparişi Tamamla</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={closeCart}
              className="w-full text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors py-1"
            >
              Alışverişe devam et
            </button>
          </div>
        )}
      </div>
    </>
  );
}
