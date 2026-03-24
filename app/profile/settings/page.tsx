"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";

export default function ProfileSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", currentPassword: "", newPassword: "" });

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Bir hata oluştu");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
  }

  const inputClass = "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Hesap Ayarları</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Kişisel Bilgiler</h2>
          <div>
            <label className={labelClass}>Ad Soyad</label>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Değiştirmek için girin" />
          </div>
          <div>
            <label className={labelClass}>Telefon</label>
            <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="05xx xxx xx xx" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Şifre Değiştir</h2>
          <div>
            <label className={labelClass}>Mevcut Şifre</label>
            <input type="password" className={inputClass} value={form.currentPassword} onChange={(e) => set("currentPassword", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Yeni Şifre</label>
            <input type="password" className={inputClass} value={form.newPassword} onChange={(e) => set("newPassword", e.target.value)} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {saved && <Check className="h-4 w-4" />}
          {saved ? "Kaydedildi!" : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
