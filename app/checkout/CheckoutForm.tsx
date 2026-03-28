"use client";

import { useState, useMemo, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag, Loader2, Tag, CheckCircle2, Minus, Plus, Trash2,
  User, MapPin, FileText, Banknote, ChevronRight, Package, CreditCard, Sparkles,
  X, ChevronUp, ChevronDown, Phone
} from "lucide-react";
import { evaluateCampaignsClient } from "@/lib/campaign-engine-client";
import type { ClientCampaign } from "@/lib/campaign-engine-client";
import AddressModal from "@/components/shared/AddressModal";
import type { Address as SavedAddress } from "@/components/shared/AddressModal";

// SavedAddress type is now imported from AddressModal

type InitialUser = { name: string; email: string; phone: string } | null;

interface Props {
  initialUser: InitialUser;
  initialAddresses: SavedAddress[];
  initialCampaigns: ClientCampaign[];
  codEnabled?: boolean;
  cardEnabled?: boolean;
}

function parseAddress(fullStreet: string) {
  // Daha esnek regex: "Sultan Selim Mah.", "Sultan Selim Mah", "Sultan Selim Mahallesi" vb. durumları kapsar
  const match = fullStreet.match(/^(.*?)\s+Mah\.?\s*,?\s*(.*)$/i) || 
                fullStreet.match(/^(.*?)\s+Mahallesi\s*,?\s*(.*)$/i);
  
  if (match) return { neighbourhood: match[1], street: match[2] };
  return { neighbourhood: "", street: fullStreet };
}

export default function CheckoutForm({ initialUser, initialAddresses, initialCampaigns, codEnabled = true, cardEnabled = true }: Props) {
  const { items, total, clear, updateQty, remove } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [activeCampaigns, setActiveCampaigns] = useState<ClientCampaign[]>(initialCampaigns);
  const [couponError, setCouponError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">(codEnabled ? "cod" : "card");
  const [localAddresses, setLocalAddresses] = useState<SavedAddress[]>(initialAddresses);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [crossSells, setCrossSells] = useState<{ id: number; name: string; slug: string; price: unknown; comparePrice: unknown; images: unknown }[]>([]);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Form — server-side verilerle önceden doldurulmuş
  const [form, setForm] = useState(() => {
    const defaultAddr = initialAddresses.find((a) => a.isDefault) ?? initialAddresses[0];
    const parsed = defaultAddr ? parseAddress(defaultAddr.street) : { neighbourhood: "", street: "" };
    
    return {
      customerName: initialUser?.name ?? "",
      customerEmail: initialUser?.email ?? "",
      customerPhone: initialUser?.phone ? initialUser.phone : "0 (5",
      street: defaultAddr ? parsed.street : "",
      district: defaultAddr?.district ?? "",
      city: defaultAddr?.city ?? "",
      neighbourhood: defaultAddr ? parsed.neighbourhood : "",
      postalCode: defaultAddr?.postalCode ?? "",
      notes: "",
    };
  });

  function addCrossSellToCart(cs: { id: number; name: string; price: unknown; images: unknown; slug: string }) {
    const cart = JSON.parse(localStorage.getItem("mesopro-cart") ?? "[]");
    const existing = cart.find((i: { id: number }) => i.id === cs.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: cs.id,
        name: cs.name,
        price: Number(cs.price),
        image: ((cs.images as string[])[0]) ?? "",
        slug: cs.slug,
        categoryId: null,
        quantity: 1,
      });
    }
    localStorage.setItem("mesopro-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-update"));
  }

  // Fetch cross-sell suggestions based on cart items
  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map((i) => i.id).join(",");
    fetch(`/api/products/cross-sell?ids=${ids}`)
      .then((r) => r.json())
      .then((d) => setCrossSells(d.data ?? []));
  }, [items]);

  const { applied, totalDiscount, qualifiable } = useMemo(() => {
    if (items.length === 0) return { applied: [], totalDiscount: 0, qualifiable: [] };
    return evaluateCampaignsClient(
      activeCampaigns,
      items.map((i) => ({ id: i.id, price: i.price, quantity: i.quantity, categoryId: i.categoryId ?? null })),
      total,
      coupon || undefined
    );
  }, [activeCampaigns, items, total, coupon]);

  const appliedMap = useMemo(
    () => Object.fromEntries(applied.map((a) => [a.id, a.discount])),
    [applied]
  );

  function applyAddress(a: SavedAddress) {
    const parsed = parseAddress(a.street);
    setForm((f) => ({
      ...f,
      customerName: a.fullName,
      customerPhone: a.phone ?? f.customerPhone,
      street: parsed.street,
      district: a.district ?? "",
      city: a.city,
      neighbourhood: parsed.neighbourhood,
      postalCode: a.postalCode ?? "",
    }));
  }

  function handleUpdateAddresses(newAddresses: SavedAddress[]) {
    setLocalAddresses(newAddresses);
  }

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let input = e.target.value.replace(/\D/g, "");
    
    if (input.length < 2) {
      input = "05";
    } else if (!input.startsWith("05")) {
      if (input.startsWith("5")) {
        input = "0" + input;
      } else {
        input = "05";
      }
    }
    
    if (input.length > 11) input = input.slice(0, 11);

    let formatted = input;
    if (input.length > 1) formatted = input.slice(0, 1) + " (" + input.slice(1, 4);
    if (input.length > 4) formatted = formatted + ") " + input.slice(4, 7);
    if (input.length > 7) formatted = formatted + " " + input.slice(7, 9);
    if (input.length > 9) formatted = formatted + " " + input.slice(9, 11);
    
    setForm((p) => ({ ...p, customerPhone: formatted }));
  }

  async function applyCoupon() {
    const code = couponInput.toLocaleUpperCase("tr-TR");
    setCouponError("");
    const res = await fetch("/api/campaigns/validate-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok || !data.valid) {
      setCouponError(data.error ?? "Geçersiz kupon kodu");
      return;
    }
    setActiveCampaigns((prev) =>
      prev.map((c) => c.type === "coupon" && data.campaignId === c.id
        ? { ...c, validatedCoupon: true } : c)
    );
    setCoupon(code);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    let neighbourhood = form.neighbourhood;
    if (neighbourhood && !neighbourhood.toLowerCase().includes("mah")) {
      neighbourhood = `${neighbourhood} Mah.`;
    }
    const streetFull = neighbourhood 
      ? `${neighbourhood}, ${form.street}`.replace(/, $/, "").trim()
      : form.street;

    const shippingAddress = {
      street: streetFull,
      district: form.district,
      city: form.city,
      postalCode: form.postalCode,
      country: "Türkiye",
    };

    if (paymentMethod === "cod") {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          shippingAddress,
          notes: form.notes,
          couponCode: coupon || undefined,
          paymentMethod: "cod",
          items: items.map((i) => ({ id: i.id, name: i.name, image: i.image, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error ?? "Bir hata oluştu"); return; }
      clear();
      router.push(`/checkout/success?order=${data.data.orderNumber}`);
      return;
    }

    const res = await fetch("/api/payment/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        shippingAddress,
        notes: form.notes,
        couponCode: coupon || undefined,
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Bir hata oluştu"); return; }
    router.push(`/checkout/payment?token=${data.data.token}`);
  }

  const finalTotal = Math.max(0, total - totalDiscount);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-6">
          <ShoppingBag className="h-9 w-9 text-zinc-400" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Sepetiniz boş</h1>
        <p className="text-sm text-zinc-500 mb-8">Sipariş verebilmek için sepete ürün ekleyin.</p>
        <a
          href="/products"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Ürünlere Göz At <ChevronRight className="h-4 w-4" />
        </a>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition";
  const labelClass = "block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-10">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Sipariş</h1>
        <span className="text-zinc-300 dark:text-zinc-600">·</span>
        <span className="text-sm text-zinc-400">{items.reduce((s, i) => s + i.quantity, 0)} ürün</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* ── Form ─────────────────────────────────────────────── */}
        <form id="checkout-form" onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}


          {/* Teslimat Adresi */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold shrink-0">1</span>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-zinc-400" />
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Teslimat Adresi</h2>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 underline underline-offset-4"
              >
                {form.street ? "Değiştir / Düzenle" : "Adres Ekle"}
              </button>
            </div>

            <div className="p-6">
              {form.street ? (
                <div className="flex items-start gap-4 p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-indigo-600 shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Teslim Edilecek Adres</span>
                    </div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-50 truncate">{form.customerName}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      {form.neighbourhood ? `${form.neighbourhood} Mah., ` : ""}{form.street}<br />
                      {form.district}, {form.city}
                    </p>
                    <div className="mt-3 py-1.5 px-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl inline-flex items-center gap-2">
                       <Phone className="h-3 w-3 text-zinc-400" />
                       <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{form.customerPhone}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="w-full py-12 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 text-zinc-400 hover:border-indigo-500 hover:text-indigo-500 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 transition-colors">
                    <Plus className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-sm">Teslimat Adresi Seçin veya Ekleyin</span>
                </button>
              )}
            </div>
          </div>

          {/* Address Management Modal */}
          <AddressModal 
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            addresses={localAddresses}
            onSelect={applyAddress}
            onUpdateAddresses={handleUpdateAddresses}
          />


          {/* Sipariş Notu */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs font-bold shrink-0">2</span>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Sipariş Notu <span className="text-xs font-normal text-zinc-400">(opsiyonel)</span></h2>
              </div>
            </div>
            <div className="p-6">
              <textarea
                className={inputClass}
                rows={3}
                placeholder="Kurye için not, kapı kodu, özel istek..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>

          {/* Ödeme Yöntemi */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs font-bold shrink-0">3</span>
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Ödeme Yöntemi</h2>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {codEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all ${paymentMethod === "cod" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"}`}
                >
                  <div className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${paymentMethod === "cod" ? "border-indigo-500" : "border-zinc-300 dark:border-zinc-600"}`}>
                    {paymentMethod === "cod" && <div className="h-2 w-2 rounded-full bg-indigo-500" />}
                  </div>
                  <Banknote className={`h-5 w-5 shrink-0 ${paymentMethod === "cod" ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"}`} />
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${paymentMethod === "cod" ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-700 dark:text-zinc-300"}`}>Kapıda Ödeme</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Nakit veya kart ile kapıda öde</p>
                  </div>
                </button>
              )}

              {cardEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all ${paymentMethod === "card" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"}`}
                >
                  <div className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${paymentMethod === "card" ? "border-indigo-500" : "border-zinc-300 dark:border-zinc-600"}`}>
                    {paymentMethod === "card" && <div className="h-2 w-2 rounded-full bg-indigo-500" />}
                  </div>
                  <CreditCard className={`h-5 w-5 shrink-0 ${paymentMethod === "card" ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"}`} />
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${paymentMethod === "card" ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-700 dark:text-zinc-300"}`}>Kredi / Banka Kartı</p>
                    <p className="text-xs text-zinc-400 mt-0.5">iyzico güvencesiyle güvenli ödeme</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Onayla */}
          <button
            type="submit"
            disabled={loading}
            className="hidden lg:flex w-full items-center justify-between gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-4 px-6 rounded-2xl transition-colors"
          >
            <span className="flex items-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {paymentMethod === "cod" ? "Siparişi Onayla" : "Ödemeye Geç"}
            </span>
            <span className="text-indigo-200 text-sm font-normal">
              {formatPrice(finalTotal)}
            </span>
          </button>
        </form>

        {/* ── Sipariş Özeti ─────────────────────────────────────── */}
        <div className="lg:col-span-2 lg:sticky lg:top-20 space-y-4">


          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 sm:rounded-[2rem] rounded-2xl p-5 sm:p-6 shadow-xl shadow-zinc-200/30 dark:shadow-none">

            <h2 className="text-lg font-black mb-5 sm:mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
              <ShoppingBag className="h-5 w-5 text-indigo-500" /> Sipariş Özeti
            </h2>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 mb-6">
              {items.map((item) => {
                const itemApplied = applied.flatMap(a => {
                    const original = activeCampaigns.find(c => c.id === a.id);
                    const isRelevant = (original?.productId == null && original?.categoryId == null) || (original?.productId != null && original?.productId === item.id) || (original?.categoryId != null && original?.categoryId === item.categoryId);
                    return isRelevant ? [{ ...original, badge: a.name }] : [];
                }).reduce((acc, curr) => {
                    if (!acc.find(x => x?.name === curr?.name)) acc.push(curr);
                    return acc;
                }, [] as any[]);

                const itemTotal = item.price * item.quantity;
                const itemDiscountShare = total > 0 ? (itemTotal / total) * totalDiscount : 0;
                const itemFinalTotal = Math.max(0, itemTotal - itemDiscountShare);

                return (
                  <div key={item.id} className="flex gap-4 py-4">
                    <div className="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-contain p-2" sizes="64px" />
                      ) : (
                        <Package className="h-6 w-6 text-zinc-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col py-0.5 justify-between">
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
                            {item.quantity} Adet
                          </span>
                          {itemApplied.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {itemApplied.map((ac, idx) => (
                                <span key={idx} className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 px-1.5 py-0.5 rounded-md">
                                  {ac.badge}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-2">
                         <div />
                         <div className="text-right flex flex-col items-end justify-center">
                           {itemDiscountShare > 0 ? (
                             <>
                               <p className="text-[10px] text-zinc-400 font-bold line-through tabular-nums decoration-zinc-300">{formatPrice(itemTotal)}</p>
                               <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums leading-none mt-0.5">{formatPrice(itemFinalTotal)}</p>
                             </>
                           ) : (
                             <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 tabular-nums leading-none">{formatPrice(itemTotal)}</p>
                           )}
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden lg:block space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  <span>Ara Toplam</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">{formatPrice(total)}</span>
              </div>
              
              {applied.length > 0 && (
                 <div className="space-y-2 pt-3 pb-1 border-t border-zinc-50 dark:border-zinc-800/50">
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

            <div className="pt-2 pb-6 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">İndirim Kodu</p>
              {coupon ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{coupon}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm font-mono text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition uppercase tracking-widest placeholder:tracking-normal placeholder:font-sans"
                      placeholder="Kupon kodu girin"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={!couponInput}
                      className="flex items-center gap-1.5 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold px-4 py-3 rounded-xl disabled:opacity-40 transition-colors"
                    >
                      Uygula
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500 mt-2 font-medium">{couponError}</p>
                  )}
                </>
              )}
            </div>

            <div className="hidden lg:block h-px bg-zinc-100 dark:bg-zinc-800 my-2" />
            <div className="hidden lg:flex justify-between items-end mt-4">
                 <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">ÖDENECEK TUTAR</p>
                    <p className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight tabular-nums">{formatPrice(finalTotal)}</p>
                 </div>
                 {totalDiscount > 0 && (
                    <div className="text-right flex flex-col items-end">
                        <p className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 px-1.5 py-0.5 rounded-md mb-1 uppercase tracking-wider">Toplam Kazanç</p>
                        <p className="text-sm font-black text-emerald-600 tabular-nums">{formatPrice(totalDiscount)}</p>
                    </div>
                 )}
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
        <div className={`bg-white dark:bg-zinc-900 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col w-full transition-transform duration-300 ease-out translate-y-0`}>
          {/* Expandable Drawer */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMobileSummaryOpen ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 relative max-h-[60vh] overflow-y-auto">
               <button type="button" onClick={() => setIsMobileSummaryOpen(false)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 rounded-full transition-colors">
                   <X className="h-5 w-5" />
               </button>
               <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-800 pb-3 pr-10">Sipariş Özeti</h3>
               
               <div className="space-y-3 sm:space-y-4 text-sm mt-2">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Ara Toplam</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">{formatPrice(total)}</span>
                  </div>
                  
                  {applied.length > 0 && (
                     <div className="space-y-2 pt-2 border-t border-zinc-50 dark:border-zinc-800/50">
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

                   {/* Removed Ödenecek Tutar block as requested */}

               </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-4 sm:p-5 flex justify-between items-center bg-white dark:bg-zinc-900 rounded-t-3xl border-t border-zinc-100 dark:border-zinc-800 relative z-10 w-full gap-2">
             <div className="flex flex-col cursor-pointer select-none shrink-0" onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}>
                <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-bold tracking-wide uppercase text-[9px] mb-0.5">
                    Toplam {isMobileSummaryOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                </div>
                <div className="flex flex-col">
                    <div className="text-xl xs:text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums tracking-tight leading-none">
                        {formatPrice(finalTotal)}
                    </div>
                    {totalDiscount > 0 && (
                       <div className="flex items-center gap-1 mt-1">
                          <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 px-1 py-0.5 rounded uppercase leading-none">Kazanç:</span>
                          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-none tracking-tight">{formatPrice(totalDiscount)}</span>
                       </div>
                    )}
                </div>
             </div>
             
             <button form="checkout-form" type="submit" disabled={loading} className="flex items-center justify-center gap-2 bg-indigo-900 hover:bg-indigo-800 active:bg-indigo-950 text-white font-bold py-2.5 xs:py-3 sm:py-3.5 px-4 xs:px-6 sm:px-8 rounded-full shrink transition-colors shadow-lg shadow-indigo-900/20 text-[11px] xs:text-xs sm:text-sm tracking-wide uppercase whitespace-nowrap min-w-0 flex-1 sm:flex-none">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {paymentMethod === "cod" ? "ONAYLA" : "ÖDEMEYE GEÇ"}
             </button>
          </div>

        </div>
      </div>

    </div>
  );
}
