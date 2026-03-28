"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { Loader2, Plus, X, Check, Save, ArrowLeft, Image as ImageIcon, FileText, Settings } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SeoForm from "@/components/admin/SeoForm";
import ImageInput from "@/components/admin/ImageInput";
import { slugify } from "@/lib/utils";

type BlogFormProps = {
  initialData?: any;
};

export default function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");

  const methods = useForm({
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      excerpt: initialData?.excerpt ?? "",
      content: initialData?.content ?? "",
      image: initialData?.image ?? "",
      tags: initialData?.tags ?? [],
      status: initialData?.status ?? "draft",
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
  const tags = watch("tags");
  const title = watch("title");

  async function onSubmit(data: any) {
    setLoading(true);
    setError("");

    const isEdit = !!initialData?.id;
    const url = isEdit ? `/api/blog/${initialData!.id}` : "/api/blog";
    const method = isEdit ? "PUT" : "POST";

    // API'ye gönderirken slug boşsa başlığa göre oluştur
    const payload = {
      ...data,
      slug: data.slug || slugify(data.title)
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Bir hata oluştu");

      if (isEdit) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        router.push("/admin/blog");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setValue("tags", [...tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setValue("tags", tags.filter((t: string) => t !== tag));
  }

  const inputClass = "w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none";
  const labelClass = "block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5";

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto space-y-8 pb-20">
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
            <X className="h-4 w-4" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 -mx-6 px-6 pb-4 mb-2">
                <FileText className="h-4 w-4 text-brand-primary" />
                <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Yazı İçeriği</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Başlık *</label>
                  <input
                    {...register("title", { required: "Başlık zorunludur" })}
                    className={inputClass + " text-lg font-bold"}
                    placeholder="Etkileyici bir başlık yazın..."
                  />
                </div>

                <div>
                  <label className={labelClass}>Kısa Özet (Excerpt)</label>
                  <textarea
                    {...register("excerpt")}
                    rows={3}
                    className={inputClass}
                    placeholder="Okuyucuyu içeriğe çekecek kısa bir özet..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>İçerik *</label>
                  <div className="min-h-[500px] border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                    <RichTextEditor
                      value={watch("content")}
                      onChange={(val) => setValue("content", val)}
                      placeholder="Hikayenizi anlatmaya başlayın..."
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SEO Section */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 -mx-6 px-6 pb-4 mb-2">
                <Settings className="h-4 w-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Arama Motoru Optimizasyonu (SEO)</h2>
              </div>
              <SeoForm 
                prefix="seoSettings." 
                defaultValues={{ title: title }}
                previewUrl={`mesopro.com/blog/${watch("slug") || slugify(title)}`} 
              />
            </section>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-6">
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 -mx-6 px-6 pb-4 mb-2">
                <Settings className="h-4 w-4 text-zinc-400" />
                <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Yayın Ayarları</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>URL Uzantısı (Slug)</label>
                  <input
                    {...register("slug")}
                    className={inputClass}
                    placeholder="yazi-urly-uzantisi"
                  />
                </div>

                <div>
                  <label className={labelClass}>Durum</label>
                  <select {...register("status")} className={inputClass}>
                    <option value="draft">Taslak</option>
                    <option value="published">Yayınlandı</option>
                    <option value="archived">Arşivlendi</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Etiketler</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag: string) => (
                      <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-primary/5 dark:bg-zinc-800 text-brand-primary dark:text-brand-primary text-[11px] font-bold rounded-lg border border-indigo-100 dark:border-zinc-700">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      className={inputClass}
                      placeholder="Etiket ekle..."
                    />
                    <button type="button" onClick={addTag} className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 -mx-6 px-6 pb-4 mb-2">
                <ImageIcon className="h-4 w-4 text-zinc-400" />
                <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">Kapak Görseli</h2>
              </div>
              <ImageInput
                value={watch("image") ?? ""}
                onChange={(url) => setValue("image", url, { shouldDirty: true })}
                previewType="video"
                inputClass={inputClass}
              />
            </section>
          </div>
        </div>

        {/* Floating Save Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Geri Dön
            </button>
            <div className="flex items-center gap-4">
              {saved && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">Değişiklikler Kaydedildi</span>}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-light disabled:opacity-50 text-white font-bold px-10 py-3 rounded-2xl shadow-lg shadow-brand-primary/20 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {loading ? "Kaydediliyor..." : initialData?.id ? "Yazıyı Güncelle" : "Yazıyı Yayınla"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
