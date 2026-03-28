"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Globe, Share2, Settings2, AlertTriangle, CheckCircle2, AlertCircle, ChevronRight, FileText } from "lucide-react";
import { useState } from "react";
import ImageInput from "./ImageInput";

type Props = {
  prefix?: string; // e.g., "seoSettings."
  defaultValues?: {
    title?: string;
    description?: string;
  };
  previewUrl?: string;
};

export default function SeoForm({ prefix = "", defaultValues, previewUrl = "mesopro.com" }: Props) {
  const { register, control, setValue } = useFormContext();
  
  const title = useWatch({ control, name: `${prefix}title` }) || "";
  const description = useWatch({ control, name: `${prefix}description` }) || "";
  const keywords = useWatch({ control, name: `${prefix}keywords` }) || [];
  const ogImage = useWatch({ control, name: `${prefix}ogImage` }) || "";
  const noIndex = useWatch({ control, name: `${prefix}noIndex` }) || false;
  const canonicalUrl = useWatch({ control, name: `${prefix}canonicalUrl` }) || "";

  const [kwInput, setKwInput] = useState("");

  const titleLen = title.length;
  const descLen = description.length;

  const getStatus = (len: number, min: number, max: number) => {
    if (len === 0) return { color: "bg-zinc-300 dark:bg-zinc-700", text: "Eksik", icon: AlertCircle };
    if (len >= min && len <= max) return { color: "bg-emerald-500", text: "Mükemmel", icon: CheckCircle2 };
    return { color: "bg-amber-500", text: "İyileştirilebilir", icon: AlertTriangle };
  };

  const titleStatus = getStatus(titleLen, 30, 60);
  const descStatus = getStatus(descLen, 70, 160);

  const addKeyword = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = kwInput.trim();
      if (val && !keywords.includes(val)) {
        setValue(`${prefix}keywords`, [...keywords, val], { shouldDirty: true });
        setKwInput("");
      }
    }
  };

  const removeKeyword = (kw: string) => {
    setValue(`${prefix}keywords`, keywords.filter((k: string) => k !== kw), { shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      {/* 1. Google Preview Card */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden group transition-all hover:shadow-md hover:border-brand-primary/20">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-primary/5 dark:bg-brand-primary/10 text-brand-primary dark:text-brand-primary">
              <Globe className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Arama Motoru Önizlemesi</h3>
          </div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Canlı Simülasyon</span>
        </div>
        <div className="p-6">
          <div className="max-w-[600px] space-y-1.5 font-sans">
            <cite className="not-italic text-[13px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              {previewUrl} <ChevronRight className="h-3 w-3" />
            </cite>
            <h3 className="text-[20px] text-brand-primary dark:text-brand-primary leading-tight font-medium hover:underline cursor-pointer line-clamp-1">
              {title.trim() || defaultValues?.title || "Sayfa Başlığı Buraya Gelecek"}
            </h3>
            <p className="text-[14px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
              {description.trim() || defaultValues?.description || "Arama sonuçlarında görünecek meta açıklama buraya gelecek. İlgi çekici ve anahtar kelime odaklı yazmaya özen gösterin."}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Main Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Content */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-zinc-400" />
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">İçerik Verileri</h4>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                SEO Başlığı
                <div className={`w-1.5 h-1.5 rounded-full ${titleStatus.color} animate-pulse`} />
              </label>
              <span className="text-[10px] font-mono text-zinc-400">{titleLen}/60</span>
            </div>
            <input
              {...register(`${prefix}title`)}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary/50 transition-all outline-none"
              placeholder={defaultValues?.title || "Etkileyici bir başlık..."}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                Meta Açıklama
                <div className={`w-1.5 h-1.5 rounded-full ${descStatus.color} animate-pulse`} />
              </label>
              <span className="text-[10px] font-mono text-zinc-400">{descLen}/160</span>
            </div>
            <textarea
              {...register(`${prefix}description`)}
              rows={4}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary/50 transition-all outline-none resize-none"
              placeholder={defaultValues?.description || "Sayfa içeriği özeti..."}
            />
          </div>
        </section>

        {/* Right Card: Media & Keywords */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="h-4 w-4 text-zinc-400" />
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Sosyal & Görsel</h4>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">OpenGraph Görseli</label>
            <ImageInput
              value={ogImage}
              onChange={(url) => setValue(`${prefix}ogImage`, url, { shouldDirty: true })}
              previewType="video"
              inputClass="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-brand-primary/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Anahtar Kelimeler</label>
            <div className="flex flex-wrap gap-2 p-2 min-h-[46px] bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus-within:border-brand-primary/50 transition-all">
              {keywords.map((kw: string) => (
                <span key={kw} className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-700 animate-in zoom-in-95">
                  {kw}
                  <button type="button" onClick={() => removeKeyword(kw)} className="text-zinc-400 hover:text-red-500 transition-colors text-lg line-none leading-none">×</button>
                </span>
              ))}
              <input
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={addKeyword}
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder-zinc-400 min-w-[100px] px-2"
                placeholder="Enter ile ekle..."
              />
            </div>
          </div>
        </section>
      </div>

      {/* 3. Advanced Card */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden group">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Gelişmiş Teknik Yapılandırma</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Dizinleme (No-Index)</span>
              <p className="text-xs text-zinc-500">Arama motorlarının bu sayfayı görmesini engeller.</p>
            </div>
            <input
              type="checkbox"
              {...register(`${prefix}noIndex`)}
              className="w-5 h-5 rounded-lg border-zinc-300 text-brand-primary focus:ring-brand-primary/20 transition-all cursor-pointer accent-brand-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Canonical (Özgün) URL</label>
            <input
              {...register(`${prefix}canonicalUrl`)}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-brand-primary/50 transition-all"
              placeholder="https://yoursite.com/original-path"
            />
          </div>
        </div>
      </section>

      {/* SEO Health Inline */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
        <div className={`p-1.5 rounded-full ${titleLen > 0 && descLen > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
          <CheckCircle2 className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-medium text-zinc-500">
          SEO Doluluk: <span className="font-bold text-zinc-700 dark:text-zinc-300">%{Math.round((titleLen / 60 + descLen / 160) * 50)}</span>
        </span>
        <span className="text-zinc-300 dark:text-zinc-700">·</span>
        <span className={`text-[11px] font-semibold flex items-center gap-1 ${titleStatus.color.replace("bg-", "text-")}`}>
          <titleStatus.icon className="h-3 w-3" /> Başlık: {titleLen}/60
        </span>
        <span className={`text-[11px] font-semibold flex items-center gap-1 ${descStatus.color.replace("bg-", "text-")}`}>
          <descStatus.icon className="h-3 w-3" /> Açıklama: {descLen}/160
        </span>
      </div>
    </div>
  );
}
