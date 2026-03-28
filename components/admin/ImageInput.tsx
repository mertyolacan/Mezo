"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import MediaPickerModal from "./MediaPickerModal";

type PreviewType = "square" | "video" | "favicon";

type Props = {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  /** Önizleme şekli: square (kare), video (16:9), favicon (küçük ikon) */
  previewType?: PreviewType;
  inputClass?: string;
};

export default function ImageInput({
  value,
  onChange,
  placeholder = "https://...",
  previewType = "square",
  inputClass,
}: Props) {
  const [open, setOpen] = useState(false);

  const baseInput =
    inputClass ||
    "w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none";

  return (
    <>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={baseInput}
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            title="Medya kütüphanesinden seç"
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-semibold rounded-xl hover:bg-brand-primary/5 hover:border-indigo-300 hover:text-brand-primary dark:hover:bg-brand-primary/10 dark:hover:border-brand-primary/30 dark:hover:text-brand-primary transition-all"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Medya</span>
          </button>
        </div>

        {/* Önizleme */}
        {value && (
          previewType === "favicon" ? (
            <div className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
              <img
                src={value}
                alt=""
                className="w-5 h-5 object-contain"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          ) : previewType === "video" ? (
            <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
              <img
                src={value}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 overflow-hidden">
              <img
                src={value}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          )
        )}
      </div>

      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(urls) => {
          if (urls[0]) onChange(urls[0]);
        }}
        multiple={false}
      />
    </>
  );
}
