"use client";

import { useState } from "react";
import { Loader2, Check, ChevronDown, ChevronRight, X, Plus } from "lucide-react";

type SeoPageData = {
  id?: number;
  page: string;
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  robots?: string | null;
  canonical?: string | null;
};

type Props = {
  pages: Array<{ page: string; label: string }>;
  seoMap: Record<string, SeoPageData>;
};

export default function SeoManager({ pages, seoMap }: Props) {
  const [forms, setForms] = useState<Record<string, SeoPageData>>(() => {
    const initial: Record<string, SeoPageData> = {};
    pages.forEach(({ page }) => {
      initial[page] = seoMap[page] ?? { page, title: "", description: "", keywords: "", ogTitle: "", ogDescription: "", ogImage: "", robots: "index, follow", canonical: "" };
    });
    return initial;
  });
  const [open, setOpen] = useState<string>(pages[0]?.page ?? "");
  const [loading, setLoading] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [kwInputs, setKwInputs] = useState<Record<string, string>>({});

  function setField(page: string, key: string, value: string) {
    setForms((prev) => ({ ...prev, [page]: { ...prev[page], [key]: value } }));
  }

  function addKeyword(page: string) {
    const val = (kwInputs[page] ?? "").trim();
    if (!val) return;
    const existing = (forms[page]?.keywords ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!existing.includes(val)) setField(page, "keywords", [...existing, val].join(", "));
    setKwInputs((p) => ({ ...p, [page]: "" }));
  }

  function removeKeyword(page: string, kw: string) {
    const existing = (forms[page]?.keywords ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    setField(page, "keywords", existing.filter((k) => k !== kw).join(", "));
  }

  async function handleSave(page: string) {
    setLoading(page);
    const data = forms[page];

    await fetch("/api/seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(null);
    setSaved(page);
    setTimeout(() => setSaved(null), 3000);
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
  const labelClass = "block text-xs font-medium text-zinc-500 mb-1";

  return (
    <div className="space-y-3 max-w-2xl">
      {pages.map(({ page, label }) => {
        const form = forms[page] ?? { page };
        const isOpen = open === page;

        return (
          <div key={page} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              onClick={() => setOpen(isOpen ? "" : page)}
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{label}</span>
              {isOpen ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
            </button>

            {isOpen && (
              <div className="px-5 pb-5 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <div>
                  <label className={labelClass}>Sayfa Başlığı (Title)</label>
                  <input className={inputClass} value={form.title ?? ""} onChange={(e) => setField(page, "title", e.target.value)} placeholder="60 karakter önerilir" />
                </div>
                <div>
                  <label className={labelClass}>Meta Açıklama</label>
                  <textarea rows={2} className={inputClass} value={form.description ?? ""} onChange={(e) => setField(page, "description", e.target.value)} placeholder="160 karakter önerilir" />
                </div>
                <div>
                  <label className={labelClass}>Anahtar Kelimeler</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(form.keywords ?? "").split(",").map((s) => s.trim()).filter(Boolean).map((kw) => (
                      <span key={kw} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full">
                        {kw}
                        <button type="button" onClick={() => removeKeyword(page, kw)}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className={inputClass}
                      value={kwInputs[page] ?? ""}
                      onChange={(e) => setKwInputs((p) => ({ ...p, [page]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(page); } }}
                      placeholder="Anahtar kelime ekle…"
                    />
                    <button type="button" onClick={() => addKeyword(page)} className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0">
                      <Plus className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>OG Başlık</label>
                  <input className={inputClass} value={form.ogTitle ?? ""} onChange={(e) => setField(page, "ogTitle", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>OG Açıklama</label>
                  <textarea rows={2} className={inputClass} value={form.ogDescription ?? ""} onChange={(e) => setField(page, "ogDescription", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>OG Görsel URL</label>
                  <input className={inputClass} value={form.ogImage ?? ""} onChange={(e) => setField(page, "ogImage", e.target.value)} placeholder="https://..." />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Robots</label>
                    <select className={inputClass} value={form.robots ?? "index, follow"} onChange={(e) => setField(page, "robots", e.target.value)}>
                      <option value="index, follow">index, follow</option>
                      <option value="noindex, follow">noindex, follow</option>
                      <option value="index, nofollow">index, nofollow</option>
                      <option value="noindex, nofollow">noindex, nofollow</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Canonical URL</label>
                    <input className={inputClass} value={form.canonical ?? ""} onChange={(e) => setField(page, "canonical", e.target.value)} placeholder="https://..." />
                  </div>
                </div>
                <button
                  onClick={() => handleSave(page)}
                  disabled={loading === page}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  {loading === page && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saved === page && <Check className="h-4 w-4" />}
                  {saved === page ? "Kaydedildi!" : "Kaydet"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
