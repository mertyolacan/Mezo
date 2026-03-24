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
} from "lucide-react";
import { evaluateCampaignsClient } from "@/lib/campaign-engine-client";
import type { ClientCampaign } from "@/lib/campaign-engine-client";

type SavedAddress = {
  id: number; title: string; fullName: string; phone: string | null;
  street: string; district: string | null; city: string;
  postalCode: string | null; isDefault: boolean;
};

type InitialUser = { name: string; email: string; phone: string } | null;

interface Props {
  initialUser: InitialUser;
  initialAddresses: SavedAddress[];
  initialCampaigns: ClientCampaign[];
  codEnabled?: boolean;
  cardEnabled?: boolean;
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
  const [savedAddresses] = useState<SavedAddress[]>(initialAddresses);
  const [crossSells, setCrossSells] = useState<{ id: number; name: string; slug: string; price: unknown; comparePrice: unknown; images: unknown }[]>([]);

  // Form — server-side verilerle önceden doldurulmuş, useEffect yok
  const defaultAddr = initialAddresses.find((a) => a.isDefault) ?? initialAddresses[0];
  const [form, setForm] = useState({
    customerName: initialUser?.name ?? "",
    customerEmail: initialUser?.email ?? "",
    customerPhone: initialUser?.phone ?? "",
    street: defaultAddr?.street ?? "",
    district: defaultAddr?.district ?? "",
    city: defaultAddr?.city ?? "",
    postalCode: defaultAddr?.postalCode ?? "",
    notes: "",
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
    setForm((f) => ({
      ...f,
      customerName: a.fullName,
      customerPhone: a.phone ?? f.customerPhone,
      street: a.street,
      district: a.district ?? "",
      city: a.city,
      postalCode: a.postalCode ?? "",
    }));
  }

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function applyCoupon() {
    const code = couponInput.toUpperCase();
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

    const shippingAddress = {
      street: form.street, district: form.district,
      city: form.city, postalCode: form.postalCode, country: "Türkiye",
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
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Kişisel Bilgiler */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold shrink-0">1</span>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Kişisel Bilgiler</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Ad Soyad</label>
                <input className={inputClass} required placeholder="Adınız Soyadınız" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>E-posta</label>
                  <input type="email" className={inputClass} required placeholder="ornek@email.com" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Telefon</label>
                  <input type="tel" className={inputClass} required placeholder="05xx xxx xx xx" value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Teslimat Adresi */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold shrink-0">2</span>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Teslimat Adresi</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {savedAddresses.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs text-zinc-400 w-full">Kayıtlı adreslerim:</span>
                  {savedAddresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => applyAddress(a)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${a.isDefault ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"}`}
                    >
                      {a.title}
                    </button>
                  ))}
                </div>
              )}
              <div>
                <label className={labelClass}>Açık Adres</label>
                <textarea
                  className={inputClass}
                  rows={2}
                  required
                  placeholder="Mahalle, cadde, sokak, bina no, daire no"
                  value={form.street}
                  onChange={(e) => set("street", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>İlçe</label>
                  <input className={inputClass} required placeholder="İlçe" value={form.district} onChange={(e) => set("district", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Şehir</label>
                  <input className={inputClass} required placeholder="Şehir" value={form.city} onChange={(e) => set("city", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Posta Kodu <span className="normal-case font-normal">(opsiyonel)</span></label>
                <input className={inputClass} placeholder="34000" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Sipariş Notu */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs font-bold shrink-0">3</span>
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
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs font-bold shrink-0">4</span>
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
            className="w-full flex items-center justify-between gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-4 px-6 rounded-2xl transition-colors"
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
        <div className="lg:col-span-2 sticky top-20 space-y-4">

          {/* Birlikte Alınan Ürünler */}
          {crossSells.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Birlikte Alınan Ürünler</h2>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {crossSells.map((cs) => {
                  const imgs = cs.images as string[];
                  const price = Number(cs.price);
                  const comparePrice = cs.comparePrice ? Number(cs.comparePrice) : null;
                  const inCart = items.some((i) => i.id === cs.id);
                  return (
                    <div key={cs.id} className="flex items-center gap-3 px-4 py-3">
                      <Link href={`/products/${cs.slug}`} className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        {imgs[0] ? (
                          <Image src={imgs[0]} alt={cs.name} fill className="object-contain" sizes="48px" />
                        ) : (
                          <Package className="h-5 w-5 text-zinc-300 absolute inset-0 m-auto" />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${cs.slug}`} className="text-xs font-medium text-zinc-800 dark:text-zinc-100 line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          {cs.name}
                        </Link>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{formatPrice(price)}</span>
                          {comparePrice && <span className="text-[10px] text-zinc-400 line-through">{formatPrice(comparePrice)}</span>}
                        </div>
                      </div>
                      {inCart ? (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-2 py-1 rounded-full shrink-0">
                          <CheckCircle2 className="h-3 w-3" /> Sepette
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addCrossSellToCart(cs)}
                          className="flex items-center gap-1 text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                        >
                          <Plus className="h-3 w-3" /> Ekle
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">

            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Sipariş Özeti</h2>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 px-5 py-4">
                  <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-contain" sizes="64px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="h-6 w-6 text-zinc-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-1 justify-between">
                      <p className="text-xs font-medium text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-snug pr-1">
                        {item.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="shrink-0 p-0.5 text-zinc-300 hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400 transition-colors"
                        aria-label="Ürünü kaldır"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="h-6 w-6 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-semibold w-6 text-center text-zinc-900 dark:text-zinc-50">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="h-6 w-6 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {qualifiable.length > 0 && (
              <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
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

            <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-2">İndirim Kodu</p>
              {coupon ? (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">{coupon} uygulandı</span>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition uppercase tracking-widest placeholder:tracking-normal placeholder:font-sans"
                      placeholder="Kupon kodu girin"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={!couponInput}
                      className="flex items-center gap-1.5 text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold px-3 py-2 rounded-xl disabled:opacity-40 transition-colors"
                    >
                      <Tag className="h-3 w-3" />
                      Uygula
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500 mt-1.5">{couponError}</p>
                  )}
                </>
              )}
            </div>

            <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Ara toplam</span>
                <span>{formatPrice(total)}</span>
              </div>

              {applied.map((ac) => (
                <div key={ac.id} className="flex justify-between text-xs text-green-600 dark:text-green-400">
                  <span className="truncate mr-2">{ac.name}</span>
                  <span className="shrink-0 font-medium">-{formatPrice(ac.discount)}</span>
                </div>
              ))}

              <div className="flex justify-between items-baseline pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="font-bold text-zinc-900 dark:text-zinc-50">Toplam</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{formatPrice(finalTotal)}</span>
                  {totalDiscount > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">{formatPrice(totalDiscount)} tasarruf</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
