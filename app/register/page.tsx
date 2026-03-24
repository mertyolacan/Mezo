"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddress, setShowAddress] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    password: "", confirmPassword: "",
    street: "", district: "", city: "", postalCode: "",
  });

  function set(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    setLoading(true);
    setError("");

    const body: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    };

    if (form.street) {
      body.address = {
        street: form.street,
        district: form.district,
        city: form.city,
        postalCode: form.postalCode || undefined,
      };
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Kayıt başarısız");
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
  const labelClass = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Kayıt Ol</h1>
          <p className="text-sm text-zinc-500 mt-1">Ücretsiz hesap oluşturun</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Ad Soyad */}
          <div>
            <label className={labelClass}>Ad Soyad</label>
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Adınız Soyadınız"
              autoComplete="name"
            />
          </div>

          {/* E-posta */}
          <div>
            <label className={labelClass}>E-posta</label>
            <input
              required
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="ornek@mail.com"
              autoComplete="email"
            />
          </div>

          {/* Telefon */}
          <div>
            <label className={labelClass}>Telefon</label>
            <input
              required
              type="tel"
              className={inputClass}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="05xx xxx xx xx"
              autoComplete="tel"
            />
          </div>

          {/* Şifre */}
          <div>
            <label className={labelClass}>Şifre</label>
            <div className="relative">
              <input
                required
                type={showPass ? "text" : "password"}
                minLength={8}
                className={inputClass + " pr-11"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="En az 8 karakter, 1 büyük harf, 1 rakam"
                autoComplete="new-password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Şifre Onayı */}
          <div>
            <label className={labelClass}>Şifre Tekrar</label>
            <div className="relative">
              <input
                required
                type={showPassConfirm ? "text" : "password"}
                minLength={8}
                className={`${inputClass} pr-11 ${form.confirmPassword && form.password !== form.confirmPassword ? "border-red-400 focus:ring-red-400" : ""}`}
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                placeholder="Şifrenizi tekrar girin"
                autoComplete="new-password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showPassConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor</p>
            )}
          </div>

          {/* Adres (opsiyonel) */}
          <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAddress((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span>
                Adres Bilgileri{" "}
                <span className="text-xs font-normal text-zinc-400">(opsiyonel)</span>
              </span>
              {showAddress ? (
                <ChevronUp className="h-4 w-4 text-zinc-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              )}
            </button>

            {showAddress && (
              <div className="px-4 pb-4 space-y-3 border-t border-zinc-100 dark:border-zinc-700 pt-4">
                <p className="text-xs text-zinc-400">
                  Girdiğiniz adres, siparişlerinizde otomatik doldurulacak.
                </p>
                <div>
                  <label className={labelClass}>Açık Adres</label>
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={form.street}
                    onChange={(e) => set("street", e.target.value)}
                    placeholder="Mahalle, cadde, sokak, bina no, daire no"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>İlçe</label>
                    <input
                      className={inputClass}
                      value={form.district}
                      onChange={(e) => set("district", e.target.value)}
                      placeholder="İlçe"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Şehir</label>
                    <input
                      className={inputClass}
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="Şehir"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    Posta Kodu{" "}
                    <span className="text-xs font-normal text-zinc-400">(opsiyonel)</span>
                  </label>
                  <input
                    className={inputClass}
                    value={form.postalCode}
                    onChange={(e) => set("postalCode", e.target.value)}
                    placeholder="34000"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Hesap Oluştur
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
