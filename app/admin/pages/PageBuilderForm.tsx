"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, ChevronUp, ChevronDown, Check } from "lucide-react";
import SeoFields from "@/components/admin/SeoFields";
import ImageInput from "@/components/admin/ImageInput";

type Section = {
  type: string;
  data: Record<string, string>;
};

type PageBuilderFormProps = {
  initialData?: {
    id?: number;
    title?: string;
    slug?: string;
    sections?: Section[];
    status?: string;
    seoTitle?: string;
    seoDescription?: string;
    ogImage?: string;
  };
};

const SECTION_TYPES = [
  { value: "hero", label: "Hero Banner" },
  { value: "text", label: "Metin Bloğu" },
  { value: "image", label: "Görsel" },
  { value: "two_column", label: "İki Kolon" },
  { value: "cta", label: "CTA Butonu" },
  { value: "divider", label: "Ayraç" },
];

const SECTION_FIELDS: Record<string, Array<{ key: string; label: string; type?: string }>> = {
  hero: [
    { key: "title", label: "Başlık" },
    { key: "subtitle", label: "Alt Başlık" },
    { key: "image", label: "Arka Plan Görseli", type: "image" },
    { key: "buttonText", label: "Buton Metni" },
    { key: "buttonUrl", label: "Buton URL" },
  ],
  text: [
    { key: "heading", label: "Başlık" },
    { key: "content", label: "İçerik", type: "textarea" },
  ],
  image: [
    { key: "url", label: "Görsel", type: "image" },
    { key: "alt", label: "Alt Metin" },
    { key: "caption", label: "Altyazı" },
  ],
  two_column: [
    { key: "leftHeading", label: "Sol Başlık" },
    { key: "leftContent", label: "Sol İçerik", type: "textarea" },
    { key: "rightHeading", label: "Sağ Başlık" },
    { key: "rightContent", label: "Sağ İçerik", type: "textarea" },
  ],
  cta: [
    { key: "text", label: "Başlık" },
    { key: "description", label: "Açıklama" },
    { key: "buttonText", label: "Buton Metni" },
    { key: "buttonUrl", label: "Buton URL" },
  ],
  divider: [],
};

export default function PageBuilderForm({ initialData }: PageBuilderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    status: initialData?.status ?? "draft",
    seoTitle: initialData?.seoTitle ?? "",
    seoDescription: initialData?.seoDescription ?? "",
    ogImage: initialData?.ogImage ?? "",
  });
  const [sections, setSections] = useState<Section[]>(initialData?.sections ?? []);
  const [seoKeywords, setSeoKeywords] = useState<string[]>(
    ((initialData as any)?.seoKeywords ?? "").split(",").map((s: string) => s.trim()).filter(Boolean)
  );
  const [keywordInput, setKeywordInput] = useState("");

  function addKeyword() {
    const kw = keywordInput.trim();
    if (kw && !seoKeywords.includes(kw)) setSeoKeywords((p) => [...p, kw]);
    setKeywordInput("");
  }

  function removeKeyword(kw: string) {
    setSeoKeywords((p) => p.filter((k) => k !== kw));
  }

  function addSection(type: string) {
    setSections((prev) => [...prev, { type, data: {} }]);
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  function moveSection(index: number, dir: -1 | 1) {
    setSections((prev) => {
      const arr = [...prev];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  }

  function updateSectionField(index: number, key: string, value: string) {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, data: { ...s.data, [key]: value } } : s))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const isEdit = !!initialData?.id;
    const url = isEdit ? `/api/pages/${initialData!.id}` : "/api/pages";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sections, seoKeywords: seoKeywords.join(", ") }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Bir hata oluştu");
      return;
    }

    if (initialData?.id) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      router.push("/admin/pages");
      router.refresh();
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
  const labelClass = "block text-xs font-medium text-zinc-500 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Meta */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Sayfa Bilgileri</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Başlık *</label>
            <input required className={inputClass} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Sayfa başlığı" />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input className={inputClass} value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="otomatik-olusturulur" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Durum</label>
          <select className={inputClass} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            <option value="draft">Taslak</option>
            <option value="published">Yayınla</option>
            <option value="scheduled">Zamanla</option>
          </select>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">İçerik Bölümleri</h2>
        </div>

        {sections.map((section, index) => {
          const fields = SECTION_FIELDS[section.type] ?? [];
          const typeLabel = SECTION_TYPES.find((t) => t.value === section.type)?.label ?? section.type;

          return (
            <div key={index} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{typeLabel}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveSection(index, -1)} className="p-1 rounded text-zinc-400 hover:text-zinc-600 transition-colors">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => moveSection(index, 1)} className="p-1 rounded text-zinc-400 hover:text-zinc-600 transition-colors">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => removeSection(index)} className="p-1 rounded text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {fields.length > 0 && (
                <div className="p-4 space-y-3">
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label className={labelClass}>{field.label}</label>
                      {field.type === "textarea" ? (
                        <textarea
                          rows={3}
                          className={inputClass}
                          value={section.data[field.key] ?? ""}
                          onChange={(e) => updateSectionField(index, field.key, e.target.value)}
                        />
                      ) : field.type === "image" ? (
                        <ImageInput
                          value={section.data[field.key] ?? ""}
                          onChange={(url) => updateSectionField(index, field.key, url)}
                          previewType="video"
                          inputClass={inputClass}
                        />
                      ) : (
                        <input
                          className={inputClass}
                          value={section.data[field.key] ?? ""}
                          onChange={(e) => updateSectionField(index, field.key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Add section */}
        <div className="flex flex-wrap gap-2">
          {SECTION_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => addSection(type.value)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Plus className="h-3 w-3" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">SEO</h2>
        <SeoFields
          title={form.seoTitle}
          onTitleChange={(v) => setForm((p) => ({ ...p, seoTitle: v }))}
          description={form.seoDescription}
          onDescriptionChange={(v) => setForm((p) => ({ ...p, seoDescription: v }))}
          keywords={seoKeywords}
          keywordInput={keywordInput}
          onKeywordInputChange={setKeywordInput}
          onAddKeyword={addKeyword}
          onRemoveKeyword={removeKeyword}
          ogImage={form.ogImage}
          onOgImageChange={(v) => setForm((p) => ({ ...p, ogImage: v }))}
          previewUrl={`mesopro.com › ${form.slug || form.title || "sayfa"}`}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!loading && saved && <Check className="h-4 w-4" />}
          {saved ? "Kaydedildi!" : initialData?.id ? "Güncelle" : "Oluştur"}
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
