"use client";

import { useCart } from "@/contexts/CartContext";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, Package, Truck, ShieldCheck, Sparkles, CheckCircle2, X, ChevronUp, ChevronDown } from "lucide-react";
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

function CampaignNudge({ c, onGone }: { c: QualifiableExtended, onGone: (id: number) => void }) {
  const [stage, setStage] = useState<'progress' | 'success' | 'hiding' | 'gone'>('progress');
  
  useEffect(() => {
    if (c.qualified) {
      if (stage === 'progress') {
        setStage('success');
        const hTimer = setTimeout(() => setStage('hiding'), 2000);
        const gTimer = setTimeout(() => {
          setStage('gone');
          onGone(c.id);
        }, 3000);
        return () => { clearTimeout(hTimer); clearTimeout(gTimer); };
      }
    } else {
      setStage('progress');
    }
  }, [c.qualified, stage, c.id, onGone]);

  if (stage === 'gone') return null;

  return (
    <div 
      className={`relative overflow-hidden transition-all duration-700 ease-in-out border rounded-card flex items-center justify-between w-fit
        ${stage === 'success' || stage === 'hiding' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-zinc-200'}
        ${stage === 'hiding' ? 'max-h-0 opacity-0 mb-0 py-0 px-0 pointer-events-none border-0' : 'max-h-14 py-1.5 px-3'}
      `}
    >
      <div className="flex items-center relative z-10 w-full min-w-0">
        <p className={`text-[11px] sm:text-xs font-bold whitespace-nowrap flex-1 ${stage === 'success' || stage === 'hiding' ? 'text-emerald-700' : 'text-zinc-700'}`}>
          {c.badge} 
          {stage === 'progress' && c.progress && (
            <span className="text-zinc-500 font-medium ml-1">({c.progress.current}/{c.progress.required})</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, total, count, remove, updateQty, add } = useCart();
  const [loadedCampaigns, setLoadedCampaigns] = useState<ClientCampaign[]>([]);
  const [transitioningNudges, setTransitioningNudges] = useState<QualifiableExtended[]>([]);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [crossSells, setCrossSells] = useState<{ sourceId: number; products: { id: number; name: string; slug: string; price: unknown; comparePrice: unknown; images: unknown }[] }[]>([]);

  useEffect(() => {
    fetch("/api/campaigns/active")
      .then((r) => r.json())
      .then((d) => {
        const campaigns = (d.data || []) as ClientCampaign[];
        setLoadedCampaigns(campaigns.filter((c) => c.type !== "coupon"));
      });
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map((i) => i.id).join(",");
    fetch(`/api/products/cross-sell?ids=${ids}`)
      .then((r) => r.json())
      .then((d) => setCrossSells(d.data ?? []));
  }, [items]);

  const { applied, totalDiscount, qualifiable } = useMemo(() => {
    if (items.length === 0) return { applied: [], totalDiscount: 0, qualifiable: [] };
    return evaluateCampaignsClient(loadedCampaigns, items.map(i => ({ id: i.id, price: i.price, quantity: i.quantity, categoryId: i.categoryId })), total);
  }, [loadedCampaigns, items, total]);

  const qualifiableFull = useMemo(() => {
    return qualifiable.map(q => {
      const original = loadedCampaigns.find(c => c.id === q.id);
      return { ...q, productId: original?.productId, categoryId: original?.categoryId, isGlobal: !original?.productId && !original?.categoryId } as QualifiableExtended;
    });
  }, [qualifiable, loadedCampaigns]);

  useEffect(() => {
    const newlyQualified = qualifiableFull.filter(q => q.qualified && !q.isGlobal);
    if (newlyQualified.length > 0) {
      setTransitioningNudges(prev => {
        const next = [...prev];
        newlyQualified.forEach(nq => {
          if (!next.find(p => p.id === nq.id)) next.push(nq);
        });
        return next;
      });
    }
  }, [qualifiableFull]);

  const finalTotal = Math.max(0, total - totalDiscount);

  if (items.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="h-10 w-10 text-zinc-300" />
        </div>
        <h1 className="text-3xl font-black mb-3">Sepetiniz Boş</h1>
        <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Alışverişe başlamak ve kampanyaları keşfetmek için ürünler sayfamıza göz atın.</p>
        <Link href="/products" className="inline-flex items-center px-8 py-4 bg-brand-primary hover:bg-brand-primary/90 transition-all text-white font-black rounded-btn shadow-lg shadow-brand-primary/20 active:scale-95 uppercase tracking-widest">
            ALIŞVERİŞE BAŞLA
            <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tight">Sepetim</h1>
          <span className="bg-zinc-100 text-zinc-600 font-bold px-3 py-1 rounded-full text-sm">{count}</span>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Products List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
            {items.map((item) => {
              const activeNudgesForItem = [
                  ...qualifiableFull.filter(q => (q.productId == null && q.categoryId == null) || (q.productId != null && q.productId === item.id) || (q.categoryId != null && q.categoryId === item.categoryId)),
                  ...transitioningNudges.filter(tn => (tn.productId == null && tn.categoryId == null) || (tn.productId != null && tn.productId === item.id) || (tn.categoryId != null && tn.categoryId === item.categoryId))
              ].reduce((acc, curr) => {
                  if (!acc.find(x => x.id === curr.id)) acc.push(curr);
                  return acc;
              }, [] as QualifiableExtended[]);

              const currentNudgedIds = new Set(activeNudgesForItem.map(n => n.id));

              const itemApplied = applied.filter(a => {
                  const original = loadedCampaigns.find(c => c.id === a.id);
                  const isRelevant = (original?.productId == null && original?.categoryId == null) || (original?.productId != null && original?.productId === item.id) || (original?.categoryId != null && original?.categoryId === item.categoryId);
                  const isStillTransitioning = currentNudgedIds.has(a.id);
                  return isRelevant && !isStillTransitioning;
              }).reduce((acc, curr) => {
                  if (!acc.find(x => x.name === curr.name)) acc.push(curr);
                  return acc;
              }, [] as typeof applied);

              const hasAnyFursat = activeNudgesForItem.length > 0 || itemApplied.length > 0;

              const itemTotal = item.price * item.quantity;
              const itemDiscountShare = total > 0 ? (itemTotal / total) * totalDiscount : 0;
              const itemFinalTotal = Math.max(0, itemTotal - itemDiscountShare);

              return (
                <div key={item.id} className="p-4 sm:p-5 lg:p-6 flex flex-col gap-4 sm:gap-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-card shadow-[var(--card-shadow)] hover:shadow-lg transition-all relative">
                  
                  {/* Upper Row: Image + Info */}
                  <div className="flex flex-row gap-4 sm:gap-6">
                    {/* Image */}
                    <div className="relative w-20 h-20 sm:w-32 sm:h-32 shrink-0 rounded-card overflow-hidden bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                      {item.image ? <Image src={item.image} alt={item.name} fill className="object-contain p-2" sizes="(max-width: 640px) 80px, 128px" /> : <Package className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                       <div className="flex justify-between items-start gap-4">
                          <div>
                             <Link href={`/products/${item.slug}`} className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 line-clamp-2 hover:text-brand-primary leading-snug">{item.name}</Link>
                          </div>
                          <button onClick={() => remove(item.id)} className="p-1.5 sm:p-2 text-zinc-300 hover:text-red-500 transition-colors bg-zinc-50 rounded-btn shrink-0" aria-label="Kaldır"><Trash2 className="h-4 w-4" /></button>
                       </div>
                       
                       <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-btn h-9 sm:h-10 shadow-sm overflow-hidden">
                              <button onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))} className="w-8 sm:w-10 h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors" disabled={item.quantity <= 1}><Minus className="h-3 w-3 sm:h-4 sm:w-4" /></button>
                              <span className="w-8 sm:w-10 text-center font-bold text-sm text-zinc-900 dark:text-zinc-50 select-none tabular-nums">{item.quantity}</span>
                              <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 sm:w-10 h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"><Plus className="h-3 w-3 sm:h-4 sm:w-4" /></button>
                          </div>
                          <div className="text-right flex flex-col items-end justify-center">
                              {itemDiscountShare > 0 ? (
                                  <>
                                    <p className="text-[10px] sm:text-xs text-zinc-400 font-bold line-through tabular-nums decoration-zinc-300 dark:decoration-zinc-700">{formatPrice(itemTotal)}</p>
                                    <p className="text-base sm:text-xl font-black text-brand-primary dark:text-brand-primary-vibrant tabular-nums leading-none mt-1">{formatPrice(itemFinalTotal)}</p>
                                  </>
                              ) : (
                                  <p className="text-base sm:text-xl font-black text-zinc-900 tabular-nums leading-none">{formatPrice(itemTotal)}</p>
                              )}
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Campaigns Specific to this Product - Full Width */}
                  {hasAnyFursat && (
                    <div className="pt-2 sm:pt-4 border-t border-zinc-100 flex flex-col gap-2 w-full">
                        {itemApplied.length > 0 && (
                           <div className="flex flex-wrap gap-1.5">
                              {itemApplied.map(ac => (
                                 <div key={ac.id} className="flex items-center py-1.5 px-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-btn w-fit shrink-0">
                                     <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-400">{ac.badge}</span>
                                 </div>
                              ))}
                           </div>
                        )}
                        {activeNudgesForItem.length > 0 && (
                           <div className="flex flex-wrap gap-1.5">
                             {activeNudgesForItem.map((c) => (
                                <CampaignNudge key={c.id} c={c} onGone={(id) => setTransitioningNudges(prev => prev.filter(p => p.id !== id))} />
                             ))}
                           </div>
                        )}
                    </div>
                  )}

                  {/* Yanında alınan ürünleri (Cross-Sells) */}
                  {(() => {
                    const itemCrossSells = crossSells.find(cs => cs.sourceId === item.id)?.products || [];
                    if (itemCrossSells.length === 0) return null;
                    return (
                      <div className="pt-5 border-t border-zinc-100 flex flex-col gap-4 w-full -mt-2">
                        <div className="flex items-center justify-between px-1">
                          <h3 className="text-[10px] sm:text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Birlikte Alabileceğiniz Ürünler</h3>
                        </div>
                        <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-0 lg:px-0 scroll-smooth snap-x snap-mandatory">
                          {itemCrossSells.map((cs) => {
                             const imgs = cs.images as string[];
                             const price = Number(cs.price);
                             const inCart = items.some((i) => i.id === cs.id);
                             return (
                               <div key={cs.id} className="min-w-[150px] xs:min-w-[180px] sm:min-w-[260px] flex flex-col sm:flex-row items-center sm:items-center gap-3 p-3 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100/80 dark:border-zinc-800/80 rounded-card hover:border-brand-primary/30 hover:bg-white dark:hover:bg-zinc-800 transition-all group shrink-0 snap-start shadow-[var(--card-shadow)]">
                                  <Link href={`/products/${cs.slug}`} className="relative h-16 w-16 xs:h-20 xs:w-20 sm:h-14 sm:w-14 shrink-0 rounded-btn overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                    {imgs[0] ? (
                                      <Image src={imgs[0]} alt={cs.name} fill className="object-contain p-2" sizes="(max-width: 640px) 80px, 56px" />
                                    ) : (
                                      <Package className="h-6 w-6 text-zinc-300" />
                                    )}
                                  </Link>
                                  <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                                    <Link href={`/products/${cs.slug}`} className="text-[11px] sm:text-xs font-bold text-zinc-900 line-clamp-1 hover:text-brand-primary transition-colors uppercase tracking-tight">
                                      {cs.name}
                                    </Link>
                                    <div className="flex items-center justify-center sm:justify-between mt-1.5 sm:mt-1 gap-2">
                                       <div className="text-[13px] sm:text-sm font-black text-brand-primary dark:text-brand-primary-vibrant tabular-nums">{formatPrice(price)}</div>
                                       <div className="hidden sm:block">
                                         {inCart ? (
                                           <div className="flex items-center justify-center h-8 w-8 bg-emerald-50 text-emerald-600 rounded-btn shrink-0 border border-emerald-100" title="Sepette">
                                             <CheckCircle2 className="h-4 w-4" />
                                           </div>
                                         ) : (
                                           <button
                                             type="button"
                                             onClick={() => add({ id: cs.id, name: cs.name, price, image: imgs[0] ?? "", slug: cs.slug, categoryId: null })}
                                             className="flex items-center justify-center h-8 w-8 bg-zinc-900 hover:bg-brand-primary text-white rounded-btn transition-all shrink-0 shadow-lg shadow-zinc-900/10 active:scale-90"
                                             title="Sepete Ekle"
                                           >
                                             <Plus className="h-4 w-4" />
                                           </button>
                                         )}
                                       </div>
                                    </div>
                                    {/* Mobile Add to Cart Button - Visible only on very small screens */}
                                    <div className="sm:hidden mt-2">
                                       {inCart ? (
                                         <div className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-btn border border-emerald-100 text-[10px] font-bold">
                                            <CheckCircle2 className="h-3 w-3" /> SEPETTE
                                         </div>
                                       ) : (
                                         <button
                                           type="button"
                                           onClick={() => add({ id: cs.id, name: cs.name, price, image: imgs[0] ?? "", slug: cs.slug, categoryId: null })}
                                           className="w-full py-1.5 bg-zinc-900 text-white rounded-btn text-[10px] font-black uppercase tracking-wider active:bg-brand-primary transition-colors shadow-sm"
                                         >
                                           EKLE
                                         </button>
                                       )}
                                    </div>
                                  </div>
                               </div>
                             );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                </div>
              );
            })}
        </div>

        <div className="hidden lg:block lg:col-span-4 space-y-4 lg:sticky lg:top-32">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-card p-5 sm:p-6 shadow-[var(--card-shadow)] shadow-xl dark:shadow-black/20">
            <h2 className="text-lg font-black mb-5 sm:mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-50"><ShoppingBag className="h-5 w-5 text-brand-primary" /> Sipariş Özeti</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  <span>Ara Toplam</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatPrice(total)}</span>
              </div>
              
              {applied.length > 0 && (
                 <div className="space-y-2 pt-3 pb-1 border-t border-zinc-50 dark:border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Uygulanan Kampanyalar</p>
                    {applied.map((ac) => (
                       <div key={ac.id} className="flex justify-between items-center text-sm">
                           <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate flex-1 flex items-center gap-1.5">
                               <CheckCircle2 className="h-3.5 w-3.5 shrink-0"/> {ac.name}
                           </span>
                           <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 tabular-nums">-{formatPrice(ac.discount)}</span>
                       </div>
                    ))}
                 </div>
              )}
              
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-4" />
              <div className="flex justify-between items-end">
                 <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">ÖDENECEK TUTAR</p>
                    <p className="text-3xl sm:text-4xl font-black text-brand-primary dark:text-brand-primary-vibrant tracking-tight tabular-nums">{formatPrice(finalTotal)}</p>
                 </div>
                 {totalDiscount > 0 && (
                    <div className="text-right flex flex-col items-end">
                        <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 px-1.5 py-0.5 rounded-md mb-1 uppercase tracking-wider">Toplam Kazanç</p>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{formatPrice(totalDiscount)}</p>
                    </div>
                 )}
              </div>
            </div>

            <div className="space-y-2.5">
              <Link href="/checkout" className="flex flex-row items-center justify-center w-full h-14 bg-brand-primary hover:bg-brand-primary/90 active:bg-brand-primary/95 text-white rounded-btn text-base font-bold shadow-lg shadow-brand-primary/20 transition-all select-none uppercase tracking-widest">
                  Siparişi Tamamla <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link href="/products" className="flex items-center justify-center w-full h-12 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-700 rounded-btn text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors select-none uppercase tracking-wide">
                  Alışverişe Devam Et
              </Link>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-card p-1 grid grid-cols-2 gap-1 border border-zinc-100 dark:border-zinc-800">
             <div className="flex flex-col items-center justify-center p-3 sm:p-4 text-center rounded-btn bg-white dark:bg-zinc-900 shadow-sm shadow-zinc-200/20 dark:shadow-black/20">
                 <Truck className="h-6 w-6 text-brand-primary mb-2" />
                 <p className="text-[11px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-200">Ücretsiz Kargo</p>
                 <p className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500">Belirli tutar üzeri</p>
             </div>
             <div className="flex flex-col items-center justify-center p-3 sm:p-4 text-center rounded-btn bg-white dark:bg-zinc-900 shadow-sm shadow-zinc-200/20 dark:shadow-black/20">
                 <ShieldCheck className="h-6 w-6 text-emerald-500 mb-2" />
                 <p className="text-[11px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-200">Güvenli Ödeme</p>
                 <p className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500">256-Bit SSL Koruma</p>
             </div>
          </div>
          


        </div>
      </div>

      {/* Mobile Spacer to ensure scroll doesn't get hidden behind bottom bar */}
      <div className="lg:hidden h-28 w-full shrink-0" />

      {/* Mobile Overlay */}
      {isMobileSummaryOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setIsMobileSummaryOpen(false)}
        />
      )}

      {/* Mobile Sticky Bottom Bar & Drawer */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex flex-col justify-end pointer-events-none">
        <div className={`bg-white dark:bg-zinc-950 rounded-t-card shadow-[0_-10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col w-full transition-transform duration-300 ease-out translate-y-0 border-t border-zinc-50 dark:border-zinc-800`}>
          {/* Expandable Drawer */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMobileSummaryOpen ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-5 relative max-h-[60vh] overflow-y-auto">
               <button onClick={() => setIsMobileSummaryOpen(false)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 bg-zinc-50 dark:bg-zinc-800 rounded-full transition-colors">
                   <X className="h-5 w-5" />
               </button>
               <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-zinc-50 pb-3 pr-10 border-b border-zinc-100 dark:border-zinc-800">Sipariş Özeti</h3>
               
               <div className="space-y-3 sm:space-y-4 text-sm mt-2">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Ara Toplam</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">{formatPrice(total)}</span>
                  </div>
                  
                  {applied.length > 0 && (
                     <div className="space-y-2 pt-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Uygulanan Kampanyalar</p>
                        {applied.map((ac) => (
                           <div key={ac.id} className="flex justify-between items-center text-sm">
                               <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate flex-1 flex items-center gap-1.5">
                                   <CheckCircle2 className="h-3.5 w-3.5 shrink-0"/> {ac.name}
                               </span>
                               <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 tabular-nums">-{formatPrice(ac.discount)}</span>
                           </div>
                        ))}
                     </div>
                  )}

               </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-4 sm:p-5 flex justify-between items-center bg-white dark:bg-zinc-900 relative z-10 w-full gap-2 border-t border-zinc-50 dark:border-zinc-800">
             <div className="flex flex-col cursor-pointer select-none shrink-0" onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}>
                <div className="flex items-center gap-1 text-zinc-500 font-bold tracking-wide uppercase text-[9px] mb-0.5">
                    Toplam {isMobileSummaryOpen ? <ChevronDown className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />}
                </div>
                <div className="flex flex-col">
                    <div className="text-xl xs:text-2xl font-black text-brand-primary dark:text-brand-primary-vibrant tabular-nums tracking-tight leading-none">
                        {formatPrice(finalTotal)}
                    </div>
                    {totalDiscount > 0 && (
                       <div className="flex items-center gap-1 mt-1">
                          <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 px-1 py-0.5 rounded uppercase leading-none">Kazanç:</span>
                          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-none tracking-tight">{formatPrice(totalDiscount)}</span>
                       </div>
                    )}
                </div>
             </div>
             
             <Link href="/checkout" className="flex items-center justify-center bg-brand-primary hover:bg-brand-primary/90 active:bg-brand-primary/95 text-white font-bold py-2.5 xs:py-3 sm:py-3.5 px-4 xs:px-6 sm:px-8 rounded-btn shrink transition-colors shadow-lg shadow-brand-primary/20 text-[11px] xs:text-xs sm:text-sm tracking-wide uppercase whitespace-nowrap min-w-0 flex-1 sm:flex-none">
                SİPARİŞİ ONAYLA
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

