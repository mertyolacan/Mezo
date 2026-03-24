"use client";

import { X, Plus } from "lucide-react";
import ImageInput from "./ImageInput";

type Props = {
  title: string;
  onTitleChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  keywords: string[];
  keywordInput: string;
  onKeywordInputChange: (v: string) => void;
  onAddKeyword: () => void;
  onRemoveKeyword: (kw: string) => void;
  ogImage?: string;
  onOgImageChange?: (v: string) => void;
  previewUrl?: string;
};

const inputClass =
  "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

function charColor(len: number, max: number) {
  if (len === 0) return "text-zinc-400";
  if (len <= max) return "text-green-600 dark:text-green-400";
  if (len <= max + 15) return "text-amber-500";
  return "text-red-500";
}

export default function SeoFields({
  title, onTitleChange,
  description, onDescriptionChange,
  keywords, keywordInput, onKeywordInputChange, onAddKeyword, onRemoveKeyword,
  ogImage, onOgImageChange,
  previewUrl = "mesopro.com",
}: Props) {
  const displayTitle = title.trim() || "Sayfa başlığı buraya gelecek";
  const displayDesc = description.trim() || "Meta açıklama buraya gelecek. Bu alan Google arama sonuçlarında görünür.";

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); onAddKeyword(); }
  }

  return (
    <div className="space-y-5">
      {/* Google Preview */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
          <p className="text-xs font-medium text-zinc-500">Google Arama Önizlemesi</p>
        </div>
        <div className="px-4 py-4 bg-white dark:bg-zinc-900 font-sans overflow-hidden">
          <p className="text-xs text-zinc-500 mb-1 truncate">{previewUrl}</p>
          <p className="text-[#1a0dab] dark:text-[#8ab4f8] text-lg font-medium leading-snug line-clamp-1 cursor-pointer hover:underline break-all">
            {displayTitle.length > 60 ? displayTitle.slice(0, 60) + "…" : displayTitle}
          </p>
          <p className="text-[#4d5156] dark:text-zinc-400 text-sm mt-1 leading-relaxed line-clamp-2 break-words">
            {displayDesc.length > 160 ? displayDesc.slice(0, 160) + "…" : displayDesc}
          </p>
        </div>
      </div>

      {/* SEO Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelClass}>SEO Başlık</label>
          <span className={`text-xs font-medium ${charColor(title.length, 60)}`}>
            {title.length} / 60 karakter önerilir
          </span>
        </div>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={100}
          placeholder="Sayfa başlığı — boş bırakılırsa otomatik kullanılır"
        />
        {title.length > 60 && (
          <p className="text-xs text-amber-500 mt-1">60 karakteri geçmesi halinde Google keser.</p>
        )}
      </div>

      {/* Meta Description */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelClass}>Meta Açıklama</label>
          <span className={`text-xs font-medium ${charColor(description.length, 160)}`}>
            {description.length} / 160 karakter önerilir
          </span>
        </div>
        <textarea
          rows={3}
          className={inputClass}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          maxLength={250}
          placeholder="Arama sonuçlarında çıkacak kısa açıklama"
        />
        {description.length > 160 && (
          <p className="text-xs text-amber-500 mt-1">160 karakteri geçmesi halinde Google keser.</p>
        )}
      </div>

      {/* Keywords */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelClass}>Anahtar Kelimeler</label>
          <span className="text-xs text-zinc-400">
            {keywords.length} kelime{keywords.length < 5 && " — 5-10 önerilir"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
          {keywords.map((kw) => (
            <span key={kw} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full">
              {kw}
              <button type="button" onClick={() => onRemoveKeyword(kw)}>
                <X className="h-3 w-3 hover:text-red-500 transition-colors" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={keywordInput}
            onChange={(e) => onKeywordInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Kelime ekle ve Enter'a bas…"
          />
          <button
            type="button"
            onClick={onAddKeyword}
            className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
          </button>
        </div>
      </div>

      {/* OG Image */}
      {onOgImageChange !== undefined && (
        <div>
          <label className={labelClass + " mb-1"}>OG Görsel URL</label>
          <ImageInput
            value={ogImage ?? ""}
            onChange={onOgImageChange}
            previewType="video"
            inputClass={inputClass}
          />
        </div>
      )}
    </div>
  );
}
