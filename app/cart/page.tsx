"use client";

import { useCart } from "@/contexts/CartContext";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, Package, Truck, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { evaluateCampaignsClient } from "@/lib/campaign-engine-client";
import type { ClientCampaign, ClientQualifiable } from "@/lib/campaign-engine-client";

interface QualifiableExtended extends ClientQualifiable {
  productId?: number | null;
  categoryId?: number | null;
  isGlobal: boolean;
}

function CampaignNudge({ c }: { c: QualifiableExtended }) {
  const [stage, setStage] = useState<'progress' | 'success' | 'hiding' | 'gone'>('progress');
  
  useEffect(() => {
    if (c.qualified) {
      if (stage === 'progress') {
        // Step 1: Başarıyı kutla (Yeşil bar + TAMAMLANDI)
        setStage('success');
        
        // Step 2: 2 saniye sonra saklanmaya başla
        const hidingTimer = setTimeout(() => {
          setStage('hiding');
        }, 2000);

        // Step 3: Animasyon bittikten sonra DOM'dan tamamen kaldır
        const goneTimer = setTimeout(() => {
          setStage('gone');
        }, 3000); // 1000ms transition süresi dahil

        return () => {
          clearTimeout(hidingTimer);
          clearTimeout(goneTimer);
        };
      }
    } else {
      // Eğer kullanıcı adet düşürürse her şeyi sıfırla
      setStage('progress');
    }
  }, [c.qualified, stage]);

  // Eğer tamamen bittiyse hiçbir şey gösterme
  if (stage === 'gone' && c.qualified) return null;

  return (
    <div 
      className={`group cursor-default transition-all duration-1000 ease-in-out origin-top rounded-2xl border overflow-hidden
        ${stage === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' : 'bg-transparent border-transparent'}
        ${(stage === 'hiding' || stage === 'gone') ? 'max-h-0 opacity-0 mb-0 p-0 pointer-events-none border-0' : 'max-h-[200px] p-3 mb-1'}
      `}
    >
      <div className="flex justify-between items-center mb-1.5 h-4">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
            {stage === 'success' || stage === 'hiding' ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 animate-bounce" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" />
            )}
          </div>
          <p className={`text-[11px] font-bold leading-tight transition-colors duration-500 whitespace-nowrap
            ${stage === 'success' || stage === 'hiding' ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-400'}
          `}>
            {c.badge} {(stage === 'success' || stage === 'hiding') && "— TAMAMLANDI"}
          </p>
        </div>
        {c.progress && (
          <span className={`text-[10px] font-black tabular-nums transition-colors duration-500 whitespace-nowrap ${stage === 'success' || stage === 'hiding' ? 'text-emerald-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
            {c.progress.current} / {c.progress.required}
          </span>
        )}
      </div>
      <div className="mt-1.5 h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        {c.progress && (
          <div 
            className={`h-full transition-all duration-700 ease-out ${stage === 'success' || stage === 'hiding' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-indigo-600 dark:bg-indigo-500'}`} 
            style={{ width: `${Math.min(100, (c.progress.current / c.progress.required) * 100)}%` }}
          />
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, total, count, remove, updateQty } = useCart();
  const [loadedCampaigns, setLoadedCampaigns] = useState<ClientCampaign[]>([]);

  useEffect(() => {
    const CACHE_KEY = "mesopro_campaigns";
    const CACHE_TTL = 60_000;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) {
          setLoadedCampaigns(data);
          return;
        }
      }
    } catch {}
    fetch("/api/campaigns/active")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setLoadedCampaigns(d.data);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: d.data, ts: Date.now() }));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const { applied, totalDiscount, qualifiable } = useMemo(() => {
    if (items.length === 0) return { applied: [], totalDiscount: 0, qualifiable: [] };
    return evaluateCampaignsClient(
      loadedCampaigns,
      items.map((i) => ({ id: i.id, price: i.price, quantity: i.quantity, categoryId: i.categoryId })),
      total
    );
  }, [loadedCampaigns, items, total]);

  const qualifiableWithDetails = useMemo(() => {
    return qualifiable.map(q => {
      const original = loadedCampaigns.find(c => c.id === q.id);
      return { 
        ...q, 
        productId: original?.productId, 
        categoryId: original?.categoryId,
        isGlobal: !original?.productId && !original?.categoryId
      } as QualifiableExtended;
    });
  }, [qualifiable, loadedCampaigns]);

  const finalTotal = Math.max(0, total - totalDiscount);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6">
            <ShoppingBag className="h-10 w-10 text-zinc-300" />
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">Sepetiniz Boş</h1>
          <p className="text-zinc-500 mb-8">Sepetinizde henüz ürün bulunmuyor. Alışverişe başlayarak dilediğiniz ürünü ekleyebilirsiniz.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            Ürünlere Göz At
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl lg:text-3xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">Sepetim</h1>
        <div className="flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm px-3 py-1 rounded-full">
          {count} Ürün
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="divide-y divide-zinc-50 dark:divide-zinc-900">
              {items.map((item) => {
                const relevantQualifiable = qualifiableWithDetails.filter(c => 
                  c.productId === item.id || (c.categoryId && c.categoryId === item.categoryId)
                );

                const uniqueApplied = applied.filter(a => {
                    const original = loadedCampaigns.find(c => c.id === a.id);
                    const isGlobal = !original?.productId && !original?.categoryId;
                    const isSpecific = original?.productId === item.id || original?.categoryId === item.categoryId;
                    return isGlobal || isSpecific;
                });

                const finalApplied = uniqueApplied.reduce((acc, curr) => {
                    if (!acc.find(x => x.name === curr.name)) acc.push(curr);
                    return acc;
                }, [] as typeof applied);

                const hasCampaigns = relevantQualifiable.length > 0 || finalApplied.length > 0;

                return (
                  <div key={item.id} className="p-4 sm:p-6 flex flex-col group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <div className="flex gap-4 sm:gap-6 items-center">
                      <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Package className="h-8 w-8 text-zinc-200" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 h-12">
                          <Link href={`/products/${item.slug}`} className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                            {item.name}
                          </Link>
                          <button
                            onClick={() => remove(item.id)}
                            className="p-2 -mr-2 text-zinc-300 hover:text-red-500 transition-colors shrink-0"
                            aria-label="Kaldır"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 mt-1">
                          <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden h-9 shadow-sm">
                            <button
                              onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                              className="w-9 h-full flex items-center justify-center text-zinc-500 hover:bg-zinc-50 active:bg-zinc-100 transition-colors disabled:opacity-30"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-zinc-900 dark:text-zinc-50">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              className="w-9 h-full flex items-center justify-center text-zinc-500 hover:bg-zinc-50 active:bg-zinc-100 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-[10px] text-zinc-400 font-medium">{formatPrice(item.price)} / adet</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fırsatlar Bölümü */}
                    {hasCampaigns && (
                      <div className="mt-4 pt-4 border-t border-zinc-100/50 dark:border-zinc-800/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-3 w-3 text-indigo-500" />
                          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Kazanılan Fırsatlar</h4>
                        </div>
                        
                        {/* Başarı Rozetleri */}
                        {finalApplied.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {finalApplied.map(ac => (
                                    <div key={ac.id} className="flex items-center gap-1.5 py-1.5 px-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-full animate-in fade-in slide-in-from-bottom-2 duration-700">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                        <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                                            {ac.badge} Uygulandı
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="space-y-1">
                          {relevantQualifiable.map((c) => (
                            <CampaignNudge key={c.id} c={c} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
              <Truck className="h-6 w-6 text-indigo-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-400">Ücretsiz Kargo</p>
                <p className="text-xs text-indigo-700/70 dark:text-indigo-500/70">MesoPro güvencesiyle hızlı ve ücretsiz kargo.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30">
              <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-400">Güvenli Ödeme</p>
                <p className="text-xs text-emerald-700/70 dark:text-emerald-500/70">Bütün kartlara uygun, 256-bit SSL korumalı ödeme.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sipariş Özeti */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-6 font-black uppercase tracking-tight">
              Sipariş Özeti
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 font-medium font-bold">Ara Toplam</span>
                <span className="text-zinc-900 dark:text-zinc-50 font-bold">{formatPrice(total)}</span>
              </div>

              {applied.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Uygulanan Kampanyalar</p>
                  {applied.map((ac) => (
                    <div key={ac.id} className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-2.5 rounded-xl animate-in fade-in slide-in-from-right-4 duration-500">
                      <span className="font-bold">{ac.name}</span>
                      <span className="font-bold">-{formatPrice(ac.discount)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-2" />

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-zinc-400 font-black uppercase tracking-wider mb-0.5">Ödenecek Tutar</p>
                  <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter tabular-nums">
                    {formatPrice(finalTotal)}
                  </p>
                </div>
                {totalDiscount > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Kazanç</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatPrice(totalDiscount)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="/checkout"
                className="group relative flex items-center justify-center w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-lg font-black transition-all active:scale-[0.98] shadow-[0_8px_30px_rgb(79,70,229,0.2)]"
              >
                ÖDEME ADIMINA GEÇ
                <ArrowRight className="h-6 w-6 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/products"
                className="flex items-center justify-center w-full h-14 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl text-sm font-black hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-bold"
              >
                ALIŞVERİŞE DEVAM ET
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
