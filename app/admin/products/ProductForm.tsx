"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X, ImageIcon, Images, Search, ShoppingBag, Check, Plus, Save, ArrowLeft, Package, Trash2, Layers, Globe } from "lucide-react";
import Image from "next/image";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import SeoForm from "@/components/admin/SeoForm";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { slugify } from "@/lib/utils";

type Category = { id: number; name: string };
type Brand = { id: number; name: string };
type ProductOption = { id: number; name: string; images: unknown };

type ProductFormProps = {
  categories: Category[];
  brands: Brand[];
  allProducts?: ProductOption[];
  initialData?: any;
  productId?: number;
};

export default function ProductForm({ categories, brands, allProducts = [], initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [crossSellSearch, setCrossSellSearch] = useState("");
  const [tagInput, setTagInput] = useState("");

  const methods = useForm<ProductInput>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      shortDescription: initialData?.shortDescription ?? "",
      price: initialData?.price ? Number(initialData.price) : 0,
      comparePrice: initialData?.comparePrice ? Number(initialData.comparePrice) : null,
      stock: initialData?.stock ?? 0,
      lowStockThreshold: initialData?.lowStockThreshold ?? 5,
      images: initialData?.images ?? [],
      categoryId: initialData?.categoryId ?? null,
      brandId: initialData?.brandId ?? null,
      tags: initialData?.tags ?? [],
      crossSellIds: initialData?.crossSellIds ?? [],
      isActive: initialData?.isActive ?? true,
      isFeatured: initialData?.isFeatured ?? false,
      seoSettings: initialData?.seoSettings ?? {
        title: "",
        description: "",
        keywords: [],
        ogImage: "",
        noIndex: false,
        canonicalUrl: ""
      }
    }
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = methods;
  const images = watch("images") || [];
  const tags = watch("tags") || [];
  const crossSellIds = watch("crossSellIds") || [];
  const productName = watch("name");

  async function onSubmit(data: ProductInput) {
    setLoading(true);
    setError("");

    const payload = {
      ...data,
      slug: data.slug || slugify(data.name),
    };

    try {
      const res = await fetch(productId ? `/api/products/${productId}` : "/api/products", {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Bir hata oluştu");

      if (productId) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        router.push("/admin/products");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- Image Helpers ---
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        newUrls.push(data.data.url);
      }
    }
    setValue("images", [...images, ...newUrls], { shouldDirty: true });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const removeImage = (url: string) => setValue("images", images.filter((img: string) => img !== url));
  const setCover = (url: string) => setValue("images", [url, ...images.filter((img: string) => img !== url)]);

  // --- Tag Helpers ---
  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) {
      setValue("tags", [...tags, val], { shouldDirty: true });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => setValue("tags", tags.filter((t: string) => t !== tag));

  const inputClass = "w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none";
  const labelClass = "block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5";

  return (
    <FormProvider {...methods}>
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(urls) => setValue("images", [...images, ...urls.filter((u) => !images.includes(u))], { shouldDirty: true })}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700">
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm px-6 py-4 rounded-2xl flex items-center gap-3">
            <X className="h-5 w-5" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images Grid */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Images className="h-4 w-4 text-brand-primary" />
                  <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Ürün Resimleri</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="text-xs font-bold text-brand-primary hover:text-brand-primary dark:text-brand-primary transition-colors uppercase tracking-wider"
                >
                  Medyadan Seç
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((url: string, i: number) => (
                  <div
                    key={url}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group ${
                      i === 0 ? "border-brand-primary shadow-lg shadow-indigo-500/10" : "border-zinc-100 dark:border-zinc-800 hover:border-indigo-300"
                    }`}
                  >
                    <Image src={url} alt={`Ürün ${i}`} fill className="object-contain p-2" sizes="200px" />
                    {i === 0 && (
                      <div className="absolute top-2 left-2 bg-brand-primary text-[9px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        Kapak
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      {i !== 0 && (
                        <button type="button" onClick={() => setCover(url)} className="p-2 bg-white text-zinc-900 rounded-full hover:scale-110 transition-transform">
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button type="button" onClick={() => removeImage(url)} className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:border-brand-primary hover:text-brand-primary transition-all bg-zinc-50/30 dark:bg-zinc-800/10"
                >
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin text-brand-primary" /> : <Plus className="h-6 w-6" />}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{uploading ? "Yükleniyor" : "Yeni Ekle"}</span>
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </section>

            {/* Basic Info */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 -mx-6 px-6 pb-4 mb-2">
                <Package className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Temel Bilgiler</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Ürün Adı *</label>
                    <input {...register("name")} className={inputClass + " font-bold text-zinc-900"} placeholder="Ürün başlığını girin..." />
                    {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Katalog Uzantısı (Slug)</label>
                    <input {...register("slug")} className={inputClass} placeholder="urun-adi-slug" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Kısa Açıklama</label>
                  <textarea {...register("shortDescription")} rows={2} className={inputClass} placeholder="Liste görünümünde gösterilecek özet..." />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Detaylı Açıklama</label>
                  <textarea {...register("description")} rows={6} className={inputClass} placeholder="Ürün özelliklerini ve detaylarını anlatın..." />
                </div>
              </div>
            </section>

            {/* SEO Section */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 -mx-6 px-6 pb-4 mb-2">
                <Globe className="h-4 w-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Arama Motoru Optimizasyonu (SEO)</h2>
              </div>
              <SeoForm 
                prefix="seoSettings." 
                defaultValues={{ title: productName }}
                previewUrl={`mesopro.com/urun/${watch("slug") || slugify(productName || "")}`} 
              />
            </section>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-8">
            {/* Pricing & Stock */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 -mx-6 px-6 pb-4 mb-2">
                <ShoppingBag className="h-4 w-4 text-zinc-400" />
                <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Fiyat & Envanter</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Satış Fiyatı (₺)</label>
                    <input type="number" step="0.01" {...register("price", { valueAsNumber: true })} className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Eski Fiyat (₺)</label>
                    <input type="number" step="0.01" {...register("comparePrice", { valueAsNumber: true })} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Stok Adedi</label>
                    <input type="number" {...register("stock", { valueAsNumber: true })} className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Düşük Stok Uyarı</label>
                    <input type="number" {...register("lowStockThreshold", { valueAsNumber: true })} className={inputClass} />
                  </div>
                </div>
              </div>
            </section>

            {/* Categorization */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 -mx-6 px-6 pb-4 mb-2">
                <Layers className="h-4 w-4 text-zinc-400" />
                <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Kategorizasyon</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Kategori</label>
                  <select {...register("categoryId", { valueAsNumber: true })} className={inputClass}>
                    <option value="">Seçiniz</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Marka</label>
                  <select {...register("brandId", { valueAsNumber: true })} className={inputClass}>
                    <option value="">Seçiniz</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Etiketler</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag: string) => (
                      <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold rounded-lg border border-zinc-200 dark:border-zinc-700">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      className={inputClass}
                      placeholder="Yeni etiket..."
                    />
                    <button type="button" onClick={addTag} className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 transition-colors">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Visibility & Relations */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 -mx-6 px-6 pb-4 mb-2">
                <Globe className="h-4 w-4 text-zinc-400" />
                <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Görünürlük ve İlişkiler</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Öne Çıkarılan Ürün</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Bu ürünü anasayfada sergile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register("isFeatured")} className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-brand-primary"></div>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Yanında Alınan Ürünler</label>
                  <select onChange={(e) => {
                    const id = parseInt(e.target.value);
                    if (id && !crossSellIds.includes(id)) {
                      setValue("crossSellIds", [...crossSellIds, id], { shouldDirty: true });
                    }
                    e.target.value = "";
                  }} className={inputClass}>
                    <option value="">Ürün Seçerek Ekle...</option>
                    {allProducts.filter(p => !crossSellIds.includes(p.id)).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  
                  {crossSellIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      {crossSellIds.map((id: number) => {
                        const product = allProducts.find(p => p.id === id);
                        return product ? (
                          <div key={id} className="flex items-center gap-2 pl-1 pr-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg max-w-full shadow-sm hover:border-indigo-200 transition-colors">
                            <div className="relative w-7 h-7 rounded bg-zinc-50 overflow-hidden shrink-0 border border-zinc-100">
                               {Array.isArray(product.images) && product.images.length > 0 ? (
                                  <Image src={product.images[0] as string} alt={product.name} fill className="object-cover" sizes="28px" />
                               ) : <Package className="h-4 w-4 m-1.5 text-zinc-300" />}
                            </div>
                            <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[140px] leading-tight">{product.name}</span>
                            <button type="button" onClick={() => setValue("crossSellIds", crossSellIds.filter((cid: number) => cid !== id), { shouldDirty: true })} className="text-zinc-400 hover:text-red-500 transition-colors ml-1 bg-zinc-50 rounded p-0.5">
                               <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Floating Save Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Vazgeç
            </button>
            <div className="flex items-center gap-4">
              {saved && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">Ürün Başarıyla Kaydedildi</span>}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-bold px-12 py-3.5 rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {loading ? "Kaydediliyor..." : productId ? "Ürünü Güncelle" : "Ürünü Oluştur"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
