"use client";

import { useState } from "react";
import { Loader2, Check, MapPin, Phone, Mail, Clock } from "lucide-react";
import type { Metadata } from "next";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Bir hata oluştu");
      return;
    }

    setSent(true);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">İletişim</h1>
      <p className="text-zinc-500 text-sm mb-10">Sorularınız için bize ulaşın, en kısa sürede yanıt verelim.</p>

      <div className="grid md:grid-cols-3 gap-10">
        {/* Info */}
        <div className="space-y-6">
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Adres</p>
              <p className="text-sm text-zinc-500 mt-0.5">İstanbul, Türkiye</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Telefon</p>
              <p className="text-sm text-zinc-500 mt-0.5">+90 (212) 000 00 00</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Mail className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">E-posta</p>
              <p className="text-sm text-zinc-500 mt-0.5">info@mesopro.com.tr</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Çalışma Saatleri</p>
              <p className="text-sm text-zinc-500 mt-0.5">Pzt–Cum: 09:00–18:00</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          {sent ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">Mesajınız alındı!</p>
              <p className="text-sm text-zinc-500">En kısa sürede size geri döneceğiz.</p>
              <button
                onClick={() => setSent(false)}
                className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 underline"
              >
                Yeni mesaj gönder
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Ad Soyad *</label>
                  <input
                    required
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                <div>
                  <label className={labelClass}>E-posta *</label>
                  <input
                    required
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="ornek@mail.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Telefon</label>
                  <input
                    className={inputClass}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="05xx xxx xx xx"
                  />
                </div>
                <div>
                  <label className={labelClass}>Konu *</label>
                  <input
                    required
                    className={inputClass}
                    value={form.subject}
                    onChange={(e) => set("subject", e.target.value)}
                    placeholder="Konu başlığı"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Mesaj *</label>
                <textarea
                  required
                  rows={5}
                  className={inputClass}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Gönder
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
