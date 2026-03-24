"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";

type SiteSettingsFormProps = {
  initialSettings: Record<string, string>;
};

export default function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setLoading(false);
    if (!res.ok) {
      setError("Kaydedilemedi");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

  function val(key: string) {
    return settings[key] ?? "";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* General */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Genel</h2>
        <div>
          <label className={labelClass}>Site Adı</label>
          <input className={inputClass} value={val("site_name")} onChange={(e) => set("site_name", e.target.value)} placeholder="MesoPro" />
        </div>
        <div>
          <label className={labelClass}>Site Açıklaması</label>
          <textarea rows={2} className={inputClass} value={val("site_description")} onChange={(e) => set("site_description", e.target.value)} placeholder="Mezoterapi ürünleri..." />
        </div>
        <div>
          <label className={labelClass}>Logo URL</label>
          <input className={inputClass} value={val("logo_url")} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className={labelClass}>Favicon URL</label>
          <input className={inputClass} value={val("favicon_url")} onChange={(e) => set("favicon_url", e.target.value)} placeholder="https://..." />
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">İletişim Bilgileri</h2>
        <div>
          <label className={labelClass}>E-posta</label>
          <input type="email" className={inputClass} value={val("contact_email")} onChange={(e) => set("contact_email", e.target.value)} placeholder="info@mesopro.com.tr" />
        </div>
        <div>
          <label className={labelClass}>Telefon</label>
          <input className={inputClass} value={val("contact_phone")} onChange={(e) => set("contact_phone", e.target.value)} placeholder="+90 212 000 00 00" />
        </div>
        <div>
          <label className={labelClass}>Adres</label>
          <textarea rows={2} className={inputClass} value={val("contact_address")} onChange={(e) => set("contact_address", e.target.value)} placeholder="İstanbul, Türkiye" />
        </div>
        <div>
          <label className={labelClass}>Çalışma Saatleri</label>
          <input className={inputClass} value={val("working_hours")} onChange={(e) => set("working_hours", e.target.value)} placeholder="Pzt–Cum: 09:00–18:00" />
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Sosyal Medya</h2>
        {[
          { key: "social_instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
          { key: "social_facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
          { key: "social_twitter", label: "X (Twitter)", placeholder: "https://x.com/..." },
          { key: "social_youtube", label: "YouTube", placeholder: "https://youtube.com/..." },
          { key: "social_tiktok", label: "TikTok", placeholder: "https://tiktok.com/..." },
          { key: "social_linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/..." },
          { key: "social_whatsapp", label: "WhatsApp", placeholder: "905xx..." },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className={labelClass}>{label}</label>
            <input className={inputClass} value={val(key)} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} />
          </div>
        ))}
      </div>

      {/* Scripts */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Scriptler</h2>
        <div>
          <label className={labelClass}>Head Script ({"<head>"} içine eklenir)</label>
          <textarea rows={4} className={`${inputClass} font-mono text-xs`} value={val("script_head")} onChange={(e) => set("script_head", e.target.value)} placeholder="<!-- Google Analytics, Meta Pixel, vb. -->" />
        </div>
        <div>
          <label className={labelClass}>Body Script ({"<body>"} başına eklenir)</label>
          <textarea rows={4} className={`${inputClass} font-mono text-xs`} value={val("script_body")} onChange={(e) => set("script_body", e.target.value)} placeholder="<!-- GTM, vb. -->" />
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
  );
}
