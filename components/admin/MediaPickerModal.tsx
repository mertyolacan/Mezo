"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, Check, Loader2, RefreshCw, Upload } from "lucide-react";

type MediaItem = { url: string; publicId: string; bytes: number; createdAt: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
};

export default function MediaPickerModal({ open, onClose, onSelect, multiple = true }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (cursor?: string) => {
    setLoading(true);
    const url = cursor ? `/api/media/list?next_cursor=${cursor}` : "/api/media/list";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setItems((prev) => cursor ? [...prev, ...data.data.resources] : data.data.resources);
      setNextCursor(data.data.nextCursor);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      setSelected([]);
      setItems([]);
      load();
    }
  }, [open, load]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "mesopro");
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      const d = await res.json();
      if (res.ok && d.data?.url) {
        setItems((prev) => [{ url: d.data.url, publicId: d.data.publicId, bytes: 0, createdAt: new Date().toISOString() }, ...prev]);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function toggle(url: string) {
    if (!multiple) {
      setSelected([url]);
      return;
    }
    setSelected((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  }

  function handleConfirm() {
    onSelect(selected);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Medyadan Seç</h2>
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Yükle
            </button>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">
              Henüz medya yok
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {items.map((item) => {
                  const isSelected = selected.includes(item.url);
                  return (
                    <button
                      key={item.publicId}
                      type="button"
                      onClick={() => toggle(item.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? "border-indigo-500 ring-2 ring-indigo-300"
                          : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
                      }`}
                    >
                      <Image src={item.url} alt="" fill className="object-cover" sizes="150px" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                          <div className="bg-indigo-600 rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {nextCursor && (
                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    onClick={() => load(nextCursor)}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Daha fazla yükle
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-sm text-zinc-500">
            {selected.length > 0 ? `${selected.length} resim seçildi` : "Resim seçin"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selected.length === 0}
              className="text-sm px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors"
            >
              Seç ({selected.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
