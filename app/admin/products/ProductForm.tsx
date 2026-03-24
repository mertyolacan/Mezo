"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X, ImageIcon, Images, Search, ShoppingBag, Check } from "lucide-react";
import Image from "next/image";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

type Category = { id: number; name: string };
type Brand = { id: number; name: string };
type ProductOption = { id: number; name: string; images: unknown };

type ProductFormProps = {
  categories: Category[];
  brands: Brand[];
  allProducts?: ProductOption[];
  initialData?: Record<string, unknown>;
  productId?: number;
};

export default function ProductForm({ categories, brands, allProducts = [], initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>((initialData?.images as string[]) ?? []);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [crossSellIds, setCrossSellIds] = useState<number[]>((initialData?.crossSellIds as number[]) ?? []);
  const [crossSellSearch, setCrossSellSearch] = useState("");
  const [form, setForm] = useState({
    name: (initialData?.name as string) ?? "",
    slug: (initialData?.slug as string) ?? "",
    description: (initialData?.description as string) ?? "",
    shortDescription: (initialData?.shortDescription as string) ?? "",
    price: (initialData?.price as string) ?? "",
    comparePrice: (initialData?.comparePrice as string) ?? "",
    stock: String(initialData?.stock ?? 0),
    lowStockThreshold: String(initialData?.lowStockThreshold ?? 5),
    categoryId: String(initialData?.categoryId ?? ""),
    brandId: String(initialData?.brandId ?? ""),
    tags: ((initialData?.tags as string[]) ?? []).join(", "),
    isActive: (initialData?.isActive as boolean) ?? true,
    isFeatured: (initialData?.isFeatured as boolean) ?? false,
    seoTitle: (initialData?.seoTitle as string) ?? "",
    seoDescription: (initialData?.seoDescription as string) ?? "",
    seoKeywords: (initialData?.seoKeywords as string) ?? "",
  });

  function set(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setImages((prev) => [...prev, data.data.url]);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((img) => img !== url));
  }

  function setCover(url: string) {
    setImages((prev) => [url, ...prev.filter((img) => img !== url)]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      brandId: form.brandId ? Number(form.brandId) : null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      images,
      crossSellIds,
    };

    const res = await fetch(
      productId ? `/api/products/${productId}` : "/api/products",
      {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Bir hata oluştu");
      return;
    }

    if (productId) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      router.push("/admin/products");
      router.refresh();
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";

  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(urls) => setImages((prev) => [...prev, ...urls.filter((u) => !prev.includes(u))])}
      />

      {/* Resimler */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Ürün Resimleri</h2>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            <Images className="h-4 w-4" />
            Medyadan seç
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((url, i) => (
            <div
              key={url}
              onClick={() => i !== 0 && setCover(url)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 group transition-all ${
                i === 0
                  ? "border-indigo-500 cursor-default"
                  : "border-zinc-200 dark:border-zinc-700 cursor-pointer hover:border-indigo-400"
              }`}
            >
              <Image src={url} alt={`Resim ${i + 1}`} fill className="object-contain" sizes="150px" />

              {/* Kapak rozeti */}
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-indigo-600 text-white py-0.5 font-medium">
                  Kapak
                </span>
              )}

              {/* Hover overlay — kapak yap */}
              {i !== 0 && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="text-white text-[10px] font-semibold bg-indigo-600 px-2 py-1 rounded-full">Kapak Yap</span>
                </div>
              )}

              {/* Sil butonu */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(url); }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            <span className="text-xs">{uploading ? "Yükleniyor" : "Ekle"}</span>
          </button>
        </div>
        {images.length === 0 && !uploading && (
          <p className="text-xs text-zinc-400 flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Resme tıklayarak kapak fotoğrafını belirleyebilirsiniz.</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {/* Temel Bilgiler */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Temel Bilgiler</h2>
        <div>
          <label className={labelClass}>Ürün Adı *</label>
          <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input className={inputClass} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="otomatik-olusturulur" />
        </div>
        <div>
          <label className={labelClass}>Kısa Açıklama</label>
          <textarea className={inputClass} rows={2} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Açıklama</label>
          <textarea className={inputClass} rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
      </div>

      {/* Fiyat & Stok */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Fiyat & Stok</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fiyat (₺) *</label>
            <input type="number" min="0" step="0.01" className={inputClass} value={form.price} onChange={(e) => set("price", e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Eski Fiyat (₺)</label>
            <input type="number" min="0" step="0.01" className={inputClass} value={form.comparePrice} onChange={(e) => set("comparePrice", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Stok</label>
            <input type="number" min="0" className={inputClass} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Düşük Stok Eşiği</label>
            <input type="number" min="0" className={inputClass} value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Kategori & Marka */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Kategori & Marka</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Kategori</label>
            <select className={inputClass} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="">Seçiniz</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Marka</label>
            <select className={inputClass} value={form.brandId} onChange={(e) => set("brandId", e.target.value)}>
              <option value="">Seçiniz</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Etiketler (virgülle ayırın)</label>
          <input className={inputClass} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="mezoterapi, serum, vitamin" />
        </div>
      </div>

      {/* Ayarlar */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Ayarlar</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-indigo-600" />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Aktif (sitede görünsün)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="w-4 h-4 accent-indigo-600" />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Öne çıkan ürün</span>
        </label>
      </div>

      {/* Birlikte Alınan Ürünler */}
      {allProducts.length > 0 && (() => {
        const filtered = allProducts.filter(
          (p) => !crossSellIds.includes(p.id) && p.name.toLowerCase().includes(crossSellSearch.toLowerCase())
        );
        const selected = allProducts.filter((p) => crossSellIds.includes(p.id));
        return (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Birlikte Alınan Ürünler</h2>
              <p className="text-xs text-zinc-400 mt-1">Checkout sayfasında müşteriye tavsiye edilecek ürünler.</p>
            </div>

            {/* Seçili ürünler */}
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selected.map((p) => {
                  const imgs = p.images as string[];
                  return (
                    <div key={p.id} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg px-2 py-1.5">
                      {imgs[0] && (
                        <div className="relative h-6 w-6 rounded overflow-hidden shrink-0">
                          <Image src={imgs[0]} alt={p.name} fill className="object-contain" sizes="24px" />
                        </div>
                      )}
                      <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 max-w-[140px] truncate">{p.name}</span>
                      <button
                        type="button"
                        onClick={() => setCrossSellIds((prev) => prev.filter((id) => id !== p.id))}
                        className="text-indigo-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                className={`${inputClass} pl-8`}
                placeholder="Ürün ara ve ekle..."
                value={crossSellSearch}
                onChange={(e) => setCrossSellSearch(e.target.value)}
              />
            </div>

            {crossSellSearch && (
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="text-xs text-zinc-400 px-3 py-2">Sonuç bulunamadı</p>
                ) : (
                  filtered.slice(0, 8).map((p) => {
                    const imgs = p.images as string[];
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setCrossSellIds((prev) => [...prev, p.id]); setCrossSellSearch(""); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div className="relative h-7 w-7 rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                          {imgs[0] ? (
                            <Image src={imgs[0]} alt={p.name} fill className="object-contain" sizes="28px" />
                          ) : (
                            <ShoppingBag className="h-3.5 w-3.5 text-zinc-400 absolute inset-0 m-auto" />
                          )}
                        </div>
                        <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{p.name}</span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* SEO */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">SEO</h2>
        <div>
          <label className={labelClass}>SEO Başlığı</label>
          <input className={inputClass} value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} maxLength={255} />
        </div>
        <div>
          <label className={labelClass}>SEO Açıklaması</label>
          <textarea className={inputClass} rows={2} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Anahtar Kelimeler</label>
          <input className={inputClass} value={form.seoKeywords} onChange={(e) => set("seoKeywords", e.target.value)} placeholder="mezoterapi, serum, klinik" />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!loading && saved && <Check className="h-4 w-4" />}
          {saved ? "Kaydedildi!" : productId ? "Güncelle" : "Kaydet"}
        </button>
        <a href="/admin/products" className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 px-4 py-2.5 transition-colors">
          İptal
        </a>
      </div>
    </form>
  );
}
