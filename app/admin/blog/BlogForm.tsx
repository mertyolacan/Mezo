"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";

type BlogFormProps = {
  initialData?: {
    id?: number;
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    image?: string;
    tags?: string[];
    status?: string;
    seoTitle?: string;
    seoDescription?: string;
    ogImage?: string;
  };
};

export default function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    excerpt: initialData?.excerpt ?? "",
    content: initialData?.content ?? "",
    image: initialData?.image ?? "",
    tags: initialData?.tags ?? [],
    status: initialData?.status ?? "draft",
    seoTitle: initialData?.seoTitle ?? "",
    seoDescription: initialData?.seoDescription ?? "",
    ogImage: initialData?.ogImage ?? "",
  });

  function set(key: string, value: string | string[]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      set("tags", [...form.tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    set("tags", form.tags.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const isEdit = !!initialData?.id;
    const url = isEdit ? `/api/blog/${initialData!.id}` : "/api/blog";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Bir hata oluştu");
      return;
    }

    router.push("/admin/blog");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Yazı Bilgileri</h2>

        <div>
          <label className={labelClass}>Başlık *</label>
          <input
            required
            className={inputClass}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Yazı başlığı"
          />
        </div>

        <div>
          <label className={labelClass}>Slug</label>
          <input
            className={inputClass}
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="otomatik-olusturulur"
          />
        </div>

        <div>
          <label className={labelClass}>Özet</label>
          <textarea
            rows={2}
            className={inputClass}
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            placeholder="Kısa açıklama (liste görünümünde gösterilir)"
          />
        </div>

        <div>
          <label className={labelClass}>İçerik *</label>
          <textarea
            required
            rows={14}
            className={inputClass}
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            placeholder="Yazı içeriği..."
          />
        </div>

        <div>
          <label className={labelClass}>Kapak Görseli URL</label>
          <input
            className={inputClass}
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
            placeholder="https://..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className={labelClass}>Etiketler</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              placeholder="Etiket ekle ve Enter'a bas"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Plus className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Durum</label>
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="draft">Taslak</option>
            <option value="published">Yayınla</option>
            <option value="archived">Arşivle</option>
          </select>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">SEO</h2>
        <div>
          <label className={labelClass}>SEO Başlık</label>
          <input className={inputClass} value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder="Başlık girilmezse yazı başlığı kullanılır" />
        </div>
        <div>
          <label className={labelClass}>Meta Açıklama</label>
          <textarea rows={2} className={inputClass} value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} placeholder="160 karakter önerilir" />
        </div>
        <div>
          <label className={labelClass}>OG Görsel URL</label>
          <input className={inputClass} value={form.ogImage} onChange={(e) => set("ogImage", e.target.value)} placeholder="https://..." />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {initialData?.id ? "Güncelle" : "Oluştur"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
