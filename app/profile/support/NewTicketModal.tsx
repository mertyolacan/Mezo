"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";

export default function NewTicketModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "", category: "", priority: "medium" });

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setOpen(false);
      setForm({ subject: "", message: "", category: "", priority: "medium" });
      router.refresh();
    }
  }

  const inputClass = "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <Plus className="h-4 w-4" />
        Yeni Talep
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Yeni Destek Talebi</h2>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Konu *</label>
                <input className={inputClass} required value={form.subject} onChange={(e) => set("subject", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Kategori</label>
                  <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
                    <option value="">Seçiniz</option>
                    <option value="siparis">Sipariş</option>
                    <option value="urun">Ürün</option>
                    <option value="iade">İade</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Öncelik</label>
                  <select className={inputClass} value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Mesaj *</label>
                <textarea className={inputClass} rows={4} required value={form.message} onChange={(e) => set("message", e.target.value)} />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Gönder
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
