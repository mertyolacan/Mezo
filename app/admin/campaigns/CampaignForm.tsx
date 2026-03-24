"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Tag, ShoppingCart, Package, Grid3x3, Gift, BarChart3, Info, RefreshCw, Check } from "lucide-react";

type Category = { id: number; name: string };
type Product = { id: number; name: string };
type Props = {
  categories: Category[];
  products: Product[];
  initialData?: Record<string, unknown>;
  campaignId?: number;
};

const campaignTypes = [
  { value: "coupon",     label: "Kupon Kodu",       icon: Tag,          desc: "Müşteri kasada özel bir kod girerek indirim kazanır.",              example: '"YAZA20" kodu ile %20 indirim',            color: "indigo" },
  { value: "cart_total", label: "Sepet Tutarı",      icon: ShoppingCart, desc: "Belirli bir tutar üzeri siparişlerde otomatik indirim uygulanır.", example: "500₺ üzeri siparişe %10 indirim",           color: "blue"   },
  { value: "product",    label: "Ürüne Özel",        icon: Package,      desc: "Belirli bir ürün sepete eklendiğinde indirim uygulanır.",          example: "X ürününü alana %15 indirim",               color: "violet" },
  { value: "category",   label: "Kategoriye Özel",   icon: Grid3x3,      desc: "Seçilen kategorideki tüm ürünlere indirim uygulanır.",             example: "Serum kategorisine %20 indirim",            color: "purple" },
  { value: "bogo",       label: "Al X Öde Y",        icon: Gift,         desc: "Müşteri X adet alırsa Y adedine indirim veya ücretsiz ürün kazanır.", example: "3 al 2 öde",                             color: "pink"   },
  { value: "volume",     label: "Adet İndirimi",     icon: BarChart3,    desc: "Belirli bir adetten fazla alımda otomatik indirim devreye girer.", example: "5 adet ve üzeri alımda %10 indirim",       color: "orange" },
];

const colorMap: Record<string, string> = {
  indigo: "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300",
  blue:   "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
  violet: "border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300",
  purple: "border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300",
  pink:   "border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300",
  orange: "border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300",
};
const iconColorMap: Record<string, string> = {
  indigo: "text-indigo-500", blue: "text-blue-500", violet: "text-violet-500",
  purple: "text-purple-500", pink: "text-pink-500", orange: "text-orange-500",
};

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function CampaignForm({ categories, products, initialData, campaignId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);

  // BOGO kapsam seçimi — DB'den yüklerken doğru sekmeyi aç
  const initBogoScope = initialData?.productId ? "product" : initialData?.categoryId ? "category" : "all";
  const [bogoScope, setBogoScope] = useState<"all" | "product" | "category">(initBogoScope as "all" | "product" | "category");

  const [form, setForm] = useState({
    name: (initialData?.name as string) ?? "",
    type: (initialData?.type as string) ?? "coupon",
    discountType: (initialData?.discountType as string) ?? "percentage",
    discountValue: initialData?.discountValue != null ? String(Number(initialData.discountValue)) : "",
    couponCode: (initialData?.couponCode as string) ?? "",
    minAmount: String(initialData?.minAmount ?? ""),
    minQuantity: String(initialData?.minQuantity ?? ""),
    buyQuantity: String(initialData?.buyQuantity ?? "3"),
    getQuantity: String(initialData?.getQuantity ?? "2"),
    productId: String(initialData?.productId ?? ""),
    categoryId: String(initialData?.categoryId ?? ""),
    startDate: (initialData?.startDate as string)?.slice(0, 16) ?? "",
    endDate: (initialData?.endDate as string)?.slice(0, 16) ?? "",
    maxUsage: String(initialData?.maxUsage ?? ""),
    perUserLimit: String(initialData?.perUserLimit ?? ""),
    isActive: (initialData?.isActive as boolean) ?? true,
    isStackable: (initialData?.isStackable as boolean) ?? true,
  });

  function set(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function generateCode() {
    set("couponCode", randomCode());
  }

  function copyCode() {
    navigator.clipboard.writeText(form.couponCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  const selectedType = campaignTypes.find((t) => t.value === form.type)!;
  const isBogo = form.type === "bogo";

  function buildSummary() {
    const discount = form.discountValue
      ? form.discountType === "percentage"
        ? `%${form.discountValue} indirim`
        : `${form.discountValue}₺ indirim`
      : "? indirim";
    switch (form.type) {
      case "coupon":     return form.couponCode ? `"${form.couponCode}" kodu ile ${discount}` : `Kupon kodu ile ${discount}`;
      case "cart_total": return form.minAmount ? `${form.minAmount}₺ ve üzeri alışverişe ${discount}` : `Min. tutar üzeri alışverişe ${discount}`;
      case "product":    { const p = products.find((x) => String(x.id) === form.productId); return p ? `"${p.name}" ürününe ${discount}` : `Seçili ürüne ${discount}`; }
      case "category":   { const c = categories.find((x) => String(x.id) === form.categoryId); return c ? `"${c.name}" kategorisine ${discount}` : `Seçili kategoriye ${discount}`; }
      case "bogo": {
        const free = Number(form.buyQuantity || 0) - Number(form.getQuantity || 0);
        return `${form.buyQuantity || "X"} al ${form.getQuantity || "Y"} öde — ${free > 0 ? free : "?"} ürün ${Number(form.discountValue) === 100 ? "ücretsiz" : discount}`;
      }
      case "volume":     return form.minQuantity ? `${form.minQuantity} adet ve üzeri alımda ${discount}` : `Min. adet üzeri alımda ${discount}`;
      default:           return "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minAmount: form.minAmount ? Number(form.minAmount) : null,
      minQuantity: form.minQuantity ? Number(form.minQuantity) : null,
      buyQuantity: form.buyQuantity ? Number(form.buyQuantity) : null,
      getQuantity: form.getQuantity ? Number(form.getQuantity) : null,
      productId: form.productId ? Number(form.productId) : null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      maxUsage: form.maxUsage ? Number(form.maxUsage) : null,
      perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
      couponCode: form.couponCode || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };
    const res = await fetch(
      campaignId ? `/api/campaigns/${campaignId}` : "/api/campaigns",
      { method: campaignId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Bir hata oluştu"); return; }
    if (campaignId) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      router.push("/admin/campaigns");
      router.refresh();
    }
  }

  const inputClass = "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";
  const hintClass  = "text-xs text-zinc-400 dark:text-zinc-500 mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Kampanya Adı */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <label className={labelClass}>Kampanya Adı *</label>
        <input className={inputClass} required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Örn: Yaz Sezonu İndirimi" />
        <p className={hintClass}>Sadece admin panelinde görünür, müşteriye gösterilmez.</p>
      </div>

      {/* Kampanya Tipi */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Kampanya Tipi</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {campaignTypes.map((t) => {
            const Icon = t.icon;
            const active = form.type === t.value;
            return (
              <button key={t.value} type="button" onClick={() => set("type", t.value)}
                className={`text-left p-3 rounded-xl border-2 transition-all ${active ? colorMap[t.color] : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"}`}>
                <Icon className={`h-5 w-5 mb-2 ${active ? iconColorMap[t.color] : "text-zinc-400"}`} />
                <p className={`text-xs font-semibold ${active ? "" : "text-zinc-700 dark:text-zinc-300"}`}>{t.label}</p>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">{selectedType.desc}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{selectedType.example}</p>
          </div>
        </div>
      </div>

      {/* Koşullar — tipe göre */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Koşullar</h2>

        {/* KUPON */}
        {form.type === "coupon" && (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Kupon Kodu *</label>
              <div className="flex gap-2">
                <input className={inputClass} required value={form.couponCode}
                  onChange={(e) => set("couponCode", e.target.value.toUpperCase())} placeholder="YAZA20" />
                <button type="button" onClick={generateCode} title="Rastgele kod üret"
                  className="shrink-0 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                </button>
                {form.couponCode && (
                  <button type="button" onClick={copyCode} title="Kodu kopyala"
                    className="shrink-0 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    {codeCopied ? <Check className="h-4 w-4 text-green-500" /> : <span className="text-xs">Kopyala</span>}
                  </button>
                )}
              </div>
              <p className={hintClass}>Büyük harf ve rakamlardan oluşmalı. Müşteri kasada bu kodu girer.</p>
            </div>
            {form.couponCode && (
              <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600">
                <Tag className="h-4 w-4 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Müşteri şu kodu kullanacak:</p>
                  <p className="text-lg font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400">{form.couponCode}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEPET TUTARI */}
        {form.type === "cart_total" && (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Minimum Sepet Tutarı (₺) *</label>
              <div className="relative">
                <input type="number" min="0" className={inputClass} required value={form.minAmount}
                  onChange={(e) => set("minAmount", e.target.value)} placeholder="500" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">₺</span>
              </div>
              <p className={hintClass}>Sepet bu tutara ulaştığında indirim otomatik uygulanır. Müşterinin herhangi bir şey yapması gerekmez.</p>
            </div>
            {form.minAmount && form.discountValue && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-zinc-400">Sepet</p>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">{Number(form.minAmount) - 1}₺</p>
                  <p className="text-red-400 mt-0.5">İndirim yok</p>
                </div>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <p className="text-indigo-400">Sepet</p>
                  <p className="font-semibold text-indigo-700 dark:text-indigo-300">{form.minAmount}₺</p>
                  <p className="text-green-500 mt-0.5">İndirim aktif ✓</p>
                </div>
                <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-zinc-400">Sepet</p>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">{Number(form.minAmount) + 100}₺</p>
                  <p className="text-green-500 mt-0.5">İndirim aktif ✓</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ÜRÜNE ÖZEL */}
        {form.type === "product" && (
          <div>
            <label className={labelClass}>Hangi ürüne indirim uygulanacak? *</label>
            <select className={inputClass} required value={form.productId} onChange={(e) => set("productId", e.target.value)}>
              <option value="">— Ürün seçin —</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <p className={hintClass}>Bu ürün sepete eklendiğinde otomatik indirim uygulanır.</p>
            {form.productId && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800">
                <Package className="h-4 w-4 text-violet-500 shrink-0" />
                <p className="text-xs text-violet-700 dark:text-violet-300">
                  <span className="font-semibold">{products.find((p) => String(p.id) === form.productId)?.name}</span>
                  {form.discountValue ? ` → ${form.discountType === "percentage" ? `%${form.discountValue}` : `${form.discountValue}₺`} indirimli` : " seçildi"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* KATEGORİYE ÖZEL */}
        {form.type === "category" && (
          <div>
            <label className={labelClass}>Hangi kategoriye indirim uygulanacak? *</label>
            <select className={inputClass} required value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="">— Kategori seçin —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <p className={hintClass}>Bu kategorideki tüm ürünlere indirim uygulanır.</p>
            {form.categoryId && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <Grid3x3 className="h-4 w-4 text-purple-500 shrink-0" />
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  <span className="font-semibold">{categories.find((c) => String(c.id) === form.categoryId)?.name}</span>
                  {" "}kategorisindeki tüm ürünlere
                  {form.discountValue ? ` ${form.discountType === "percentage" ? `%${form.discountValue}` : `${form.discountValue}₺`} indirim` : " indirim"} uygulanacak
                </p>
              </div>
            )}
          </div>
        )}

        {/* BOGO */}
        {form.type === "bogo" && (
          <div className="space-y-4">

            {/* Adet girişleri */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Kaç adet alsın? (X)</label>
                <input type="number" min="2" className={inputClass} value={form.buyQuantity} onChange={(e) => set("buyQuantity", e.target.value)} placeholder="3" />
                <p className={hintClass}>Kampanyanın tetiklenmesi için sepetteki minimum adet</p>
              </div>
              <div>
                <label className={labelClass}>Kaç adedini ödesin? (Y)</label>
                <input type="number" min="1" className={inputClass} value={form.getQuantity} onChange={(e) => set("getQuantity", e.target.value)} placeholder="2" />
                <p className={hintClass}>
                  Müşterinin ödeyeceği adet — kalan <strong>{Math.max(0, Number(form.buyQuantity || 0) - Number(form.getQuantity || 0))}</strong> adet ücretsiz/indirimli (Y &lt; X olmalı)
                </p>
              </div>
            </div>

            {/* Kapsam seçimi */}
            <div>
              <label className={labelClass}>Kampanya Kapsamı</label>
              <div className="flex gap-2">
                {([
                  { value: "all",      label: "Tüm Ürünler" },
                  { value: "product",  label: "Belirli Ürün" },
                  { value: "category", label: "Belirli Kategori" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setBogoScope(opt.value);
                      if (opt.value !== "product")  set("productId", "");
                      if (opt.value !== "category") set("categoryId", "");
                    }}
                    className={`flex-1 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                      bogoScope === opt.value
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ürün seçici */}
            {bogoScope === "product" && (
              <div>
                <label className={labelClass}>Hangi ürüne uygulanacak?</label>
                <select className={inputClass} value={form.productId} onChange={(e) => set("productId", e.target.value)}>
                  <option value="">— Ürün seçin —</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <p className={hintClass}>Yalnızca bu ürün sayılır. Müşteri bu üründen X adet alırsa Y tanesini öder.</p>
                {form.productId && (
                  <div className="mt-2 flex items-center gap-2 p-2.5 bg-pink-50 dark:bg-pink-950/30 rounded-lg border border-pink-200 dark:border-pink-800">
                    <Package className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                    <p className="text-xs text-pink-700 dark:text-pink-300">
                      <strong>{products.find((p) => String(p.id) === form.productId)?.name}</strong> ürününde {form.buyQuantity} al {form.getQuantity} öde
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Kategori seçici */}
            {bogoScope === "category" && (
              <div>
                <label className={labelClass}>Hangi kategoriye uygulanacak?</label>
                <select className={inputClass} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                  <option value="">— Kategori seçin —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <p className={hintClass}>Yalnızca bu kategorideki ürünler sayılır. Karma sepette diğer ürünler hesaba katılmaz.</p>
                {form.categoryId && (
                  <div className="mt-2 flex items-center gap-2 p-2.5 bg-pink-50 dark:bg-pink-950/30 rounded-lg border border-pink-200 dark:border-pink-800">
                    <Grid3x3 className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                    <p className="text-xs text-pink-700 dark:text-pink-300">
                      <strong>{categories.find((c) => String(c.id) === form.categoryId)?.name}</strong> kategorisinde {form.buyQuantity} al {form.getQuantity} öde
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Nasıl çalışır kutusu */}
            {form.buyQuantity && form.getQuantity && Number(form.buyQuantity) > Number(form.getQuantity) ? (
              <div className="p-3 bg-pink-50 dark:bg-pink-950/30 rounded-lg border border-pink-200 dark:border-pink-800 space-y-1.5">
                <p className="text-xs font-semibold text-pink-700 dark:text-pink-300">Nasıl çalışır?</p>
                <p className="text-xs text-pink-600 dark:text-pink-400">
                  {bogoScope === "all" && <>Sepetteki <strong>tüm ürünler</strong> sayılır.</>}
                  {bogoScope === "product" && form.productId && <><strong>{products.find((p) => String(p.id) === form.productId)?.name ?? "Seçili ürün"}</strong> adedi sayılır, diğer ürünler bu kampanyayı etkilemez.</>}
                  {bogoScope === "category" && form.categoryId && <><strong>{categories.find((c) => String(c.id) === form.categoryId)?.name ?? "Seçili kategori"}</strong> ürünlerinin adedi sayılır.</>}
                </p>
                <p className="text-xs text-pink-600 dark:text-pink-400">
                  Müşteri <strong>{form.buyQuantity} adet</strong> koşulunu sağlarsa → <strong>{form.getQuantity} tanesini</strong> tam fiyattan öder, en ucuz <strong>{Number(form.buyQuantity) - Number(form.getQuantity)} tanesi</strong> {Number(form.discountValue) === 100 ? "ücretsiz" : "indirimli"} olur.
                </p>
                <p className="text-xs text-pink-500 dark:text-pink-400 border-t border-pink-200 dark:border-pink-800 pt-1.5">
                  Sipariş başına 1 kez uygulanır.
                </p>
              </div>
            ) : form.buyQuantity && form.getQuantity && Number(form.buyQuantity) <= Number(form.getQuantity) ? (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400">⚠️ Ödenecek adet (Y), toplam alım adetinden (X) küçük olmalı.</p>
              </div>
            ) : null}
          </div>
        )}

        {/* ADET İNDİRİMİ */}
        {form.type === "volume" && (
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Minimum Kaç Adet? *</label>
              <div className="flex items-center gap-2">
                <input type="number" min="1" className={inputClass} required value={form.minQuantity}
                  onChange={(e) => set("minQuantity", e.target.value)} placeholder="5" />
                <span className="text-sm text-zinc-400 whitespace-nowrap">adet ve üzeri</span>
              </div>
              <p className={hintClass}>Müşteri sepetinde bu adetten fazla ürün olduğunda indirim devreye girer.</p>
            </div>
            {form.minQuantity && (
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-zinc-400">{Number(form.minQuantity) - 1} adet veya az</p>
                  <p className="text-red-400 mt-1">Normal fiyat</p>
                </div>
                <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-orange-600 dark:text-orange-400">{form.minQuantity} adet veya fazla</p>
                  <p className="text-green-500 mt-1">
                    {form.discountValue
                      ? `${form.discountType === "percentage" ? `%${form.discountValue}` : `${form.discountValue}₺`} indirim ✓`
                      : "İndirim aktif ✓"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* İndirim */}
      {isBogo ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">İndirim Miktarı</h2>
          <div className="flex gap-3">
            {[
              { label: "Ücretsiz (100%)", value: "100", type: "percentage" },
              { label: "Özel oran gir", value: "", type: "percentage" },
            ].map((opt) => (
              <button key={opt.label} type="button"
                onClick={() => { set("discountType", opt.type); set("discountValue", opt.value); }}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                  (opt.value === "100" && Number(form.discountValue) === 100) || (opt.value === "" && Number(form.discountValue) !== 100)
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
          {Number(form.discountValue) !== 100 && (
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className={labelClass}>İndirim Tipi</label>
                <select className={inputClass} value={form.discountType} onChange={(e) => set("discountType", e.target.value)}>
                  <option value="percentage">Yüzde (%)</option>
                  <option value="fixed">Sabit Tutar (₺)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>İndirim Değeri *</label>
                <div className="relative">
                  <input type="number" min="0" step="0.01" className={inputClass} required value={form.discountValue}
                    onChange={(e) => set("discountValue", e.target.value)} placeholder={form.discountType === "percentage" ? "50" : "100"} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">{form.discountType === "percentage" ? "%" : "₺"}</span>
                </div>
              </div>
            </div>
          )}
          <p className={hintClass}>Y adedindeki ürünlere uygulanacak indirim. Çoğu BOGO kampanyası ücretsizdir (%100).</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">İndirim Miktarı</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>İndirim Tipi</label>
              <select className={inputClass} value={form.discountType} onChange={(e) => set("discountType", e.target.value)}>
                <option value="percentage">Yüzde (%)</option>
                <option value="fixed">Sabit Tutar (₺)</option>
              </select>
              <p className={hintClass}>{form.discountType === "percentage" ? "Ürün fiyatının yüzdesi olarak indirim" : "Sepetten sabit tutar düşülür"}</p>
            </div>
            <div>
              <label className={labelClass}>{form.discountType === "percentage" ? "İndirim Yüzdesi" : "İndirim Tutarı"} *</label>
              <div className="relative">
                <input type="number" min="0" step="0.01" className={inputClass} required value={form.discountValue}
                  onChange={(e) => set("discountValue", e.target.value)} placeholder={form.discountType === "percentage" ? "20" : "50"} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">{form.discountType === "percentage" ? "%" : "₺"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kampanya Özeti */}
      {form.discountValue && (
        <div className="flex gap-2 p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl">
          <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-0.5">Kampanya Özeti</p>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">{buildSummary()}</p>
          </div>
        </div>
      )}

      {/* Süre & Limit */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Süre & Limit</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Başlangıç Tarihi</label>
            <input type="datetime-local" className={inputClass} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            <p className={hintClass}>Boş = hemen aktif</p>
          </div>
          <div>
            <label className={labelClass}>Bitiş Tarihi</label>
            <input type="datetime-local" className={inputClass} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            <p className={hintClass}>Boş = süresiz</p>
          </div>
          <div>
            <label className={labelClass}>Toplam Kullanım Limiti</label>
            <input type="number" min="1" className={inputClass} value={form.maxUsage} onChange={(e) => set("maxUsage", e.target.value)} placeholder="Sınırsız" />
            <p className={hintClass}>Kampanya kaç kez kullanılabilir?</p>
          </div>
          <div>
            <label className={labelClass}>Kişi Başı Kullanım Limiti</label>
            <input type="number" min="1" className={inputClass} value={form.perUserLimit} onChange={(e) => set("perUserLimit", e.target.value)} placeholder="Sınırsız" />
            <p className={hintClass}>Bir müşteri kaç kez kullanabilir?</p>
          </div>
        </div>
        <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-indigo-600" />
            <div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Kampanyayı Aktif Et</span>
              <p className={hintClass}>Pasif kampanyalar kasada uygulanmaz.</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isStackable} onChange={(e) => set("isStackable", e.target.checked)} className="w-4 h-4 accent-indigo-600" />
            <div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Diğer Kampanyalarla Birleştirilebilir</span>
              <p className={hintClass}>İşaretliyse müşteri aynı siparişte birden fazla kampanyadan faydalanabilir.</p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!loading && saved && <Check className="h-4 w-4" />}
          {saved ? "Kaydedildi!" : campaignId ? "Güncelle" : "Kampanyayı Kaydet"}
        </button>
        <a href="/admin/campaigns" className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 px-4 py-2.5 transition-colors">İptal</a>
      </div>
    </form>
  );
}
