"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Loader2, Check, ChevronDown, ChevronRight, Globe, Search, AlertCircle, CheckCircle2 } from "lucide-react";
import SeoForm from "@/components/admin/SeoForm";
import { updatePageSeo } from "@/lib/actions/seo";
import type { PageSeoInput } from "@/lib/validations/seo";

type SeoPageData = {
  id?: number;
  page: string;
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  ogImage?: string | null;
  robots?: string | null;
  canonical?: string | null;
};

type Props = {
  pages: Array<{ page: string; label: string; previewSlug?: string }>;
  seoMap: Record<string, SeoPageData>;
};

function PageSeoItem({
  page,
  label,
  previewSlug,
  initialData,
}: {
  page: string;
  label: string;
  previewSlug?: string;
  initialData: SeoPageData;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // DB → SeoForm field mapping
  const methods = useForm({
    defaultValues: {
      title: initialData.title || "",
      description: initialData.description || "",
      keywords: initialData.keywords
        ? initialData.keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : [],
      ogImage: initialData.ogImage || "",
      noIndex: initialData.robots?.includes("noindex") ?? false,
      canonicalUrl: initialData.canonical || "",
    },
  });

  const hasTitle = !!initialData.title?.trim();
  const hasDesc = !!initialData.description?.trim();

  async function handleSave(data: any) {
    setLoading(true);
    setError("");
    try {
      const payload: PageSeoInput = {
        page,
        title: data.title || null,
        description: data.description || null,
        keywords: data.keywords || [],
        ogImage: data.ogImage || null,
        noIndex: data.noIndex || false,
        canonicalUrl: data.canonicalUrl || null,
      };
      await updatePageSeo(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
      <button
        type="button"
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <Globe className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{label}</span>
            <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">/{previewSlug || ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* SEO durum göstergesi */}
          {hasTitle && hasDesc ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
              <CheckCircle2 className="h-3 w-3" /> Tamam
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
              <AlertCircle className="h-3 w-3" /> Eksik
            </span>
          )}
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
          <FormProvider {...methods}>
            <SeoForm previewUrl={`mesopro.com/${previewSlug || ""}`} />

            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={methods.handleSubmit(handleSave)}
                disabled={loading}
                className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold px-8 py-2.5 rounded-xl hover:bg-zinc-800 dark:hover:bg-white transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {saved && <Check className="h-4 w-4" />}
                {loading ? "Kaydediliyor..." : saved ? "Kaydedildi!" : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </FormProvider>
        </div>
      )}
    </div>
  );
}

export default function SeoManager({ pages, seoMap }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPages = pages.filter(
    (p) =>
      p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.page.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="Sayfa ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none shadow-sm"
        />
      </div>

      {/* Sayfa listesi */}
      <div className="space-y-3">
        {filteredPages.map((page) => (
          <PageSeoItem
            key={page.page}
            page={page.page}
            label={page.label}
            previewSlug={page.previewSlug}
            initialData={seoMap[page.page] || { page: page.page }}
          />
        ))}

        {filteredPages.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-zinc-400 text-sm">Aramanızla eşleşen sayfa bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
