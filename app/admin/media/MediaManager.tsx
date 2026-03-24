"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Trash2, Copy, Check, Loader2, ImageIcon, RefreshCw } from "lucide-react";
import Image from "next/image";

type MediaItem = {
  url: string;
  publicId: string;
  bytes: number;
  createdAt: string;
};

export default function MediaManager() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [folder, setFolder] = useState("mesopro");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadImages = useCallback(async (cursor?: string) => {
    setLoading(true);
    try {
      const url = cursor
        ? `/api/media/list?folder=${folder}&next_cursor=${cursor}`
        : `/api/media/list?folder=${folder}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const resources: MediaItem[] = data.data?.resources ?? [];
      setItems((prev) => (cursor ? [...prev, ...resources] : resources));
      setNextCursor(data.data?.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    setItems([]);
    setNextCursor(null);
    loadImages();
  }, [loadImages]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.data?.url) {
        setItems((prev) => [
          { url: data.data.url, publicId: data.data.publicId, bytes: 0, createdAt: new Date().toISOString() },
          ...prev,
        ]);
      }
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete(publicId: string) {
    if (!confirm("Bu görseli silmek istediğinizden emin misiniz?")) return;
    await fetch("/api/media/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId }),
    });
    setItems((prev) => prev.filter((i) => i.publicId !== publicId));
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm">Yükleniyor...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <Upload className="h-8 w-8" />
            <p className="text-sm font-medium">Görsel yüklemek için tıklayın veya sürükleyin</p>
            <p className="text-xs">PNG, JPG, WEBP — çoklu seçim desteklenir</p>
          </div>
        )}
      </div>

      {/* Klasör + yenile */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-zinc-600 dark:text-zinc-300 shrink-0">Klasör:</label>
        <input
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition w-48"
        />
        <button
          onClick={() => { setItems([]); setNextCursor(null); loadImages(); }}
          disabled={loading}
          className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 disabled:opacity-50 transition-colors"
          title="Yenile"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
        {items.length > 0 && (
          <span className="text-xs text-zinc-400">{items.length} görsel</span>
        )}
      </div>

      {/* Grid */}
      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-zinc-400 gap-3">
          <ImageIcon className="h-10 w-10" />
          <p className="text-sm">Bu klasörde görsel bulunamadı</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <div
                key={item.publicId}
                className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
              >
                <Image src={item.url} alt="" fill className="object-cover" sizes="200px" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                    title="URL'yi kopyala"
                  >
                    {copied === item.url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.publicId)}
                    className="p-2 bg-red-500/80 hover:bg-red-600/80 rounded-lg text-white transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {nextCursor && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => loadImages(nextCursor)}
                disabled={loading}
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Daha fazla yükle
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
