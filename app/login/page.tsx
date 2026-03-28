"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Package } from "lucide-react";

function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  onFocus,
  onBlur,
  required,
  minLength,
  autoComplete,
  hasError,
  rightElement,
}: any) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder=" "
        className={`block w-full px-4 pt-6 pb-2 text-sm text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 border rounded-input ${
          hasError
            ? "border-red-500 focus:border-red-500"
            : "border-zinc-300 dark:border-zinc-700 focus:border-brand-primary dark:focus:border-brand-primary-light"
        } appearance-none focus:outline-none focus:ring-0 peer transition-all`}
      />
      <label
        htmlFor={id}
        className={`absolute text-sm duration-200 transform left-4 pointer-events-none origin-top-left
          top-1/2 -translate-y-1/2 scale-100
          peer-focus:top-2 peer-focus:translate-y-0 peer-focus:scale-[0.80]
          peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:scale-[0.80]
          ${
            hasError
              ? "text-red-500"
              : "text-zinc-500 dark:text-zinc-400 peer-focus:text-zinc-700 dark:peer-focus:text-zinc-200"
          }
        `}
      >
        {label}
      </label>
      {rightElement}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  function set(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, rememberMe }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Giriş başarısız");
      return;
    }

    if (data.data?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/profile");
    }
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex w-full bg-zinc-50 dark:bg-zinc-950 items-stretch">
      {/* LEFT PANEL (Desktop only) */}
      <div className="hidden md:flex flex-col w-[35%] lg:w-[40%] max-w-[480px] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 px-12 lg:px-16 py-12 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto custom-scrollbar">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl lg:text-3xl font-bold tracking-tight text-[#E61F25] uppercase tracking-widest mt-4"
        >
          Meso<span className="text-zinc-900 dark:text-zinc-50">Pro</span>
        </Link>

        {/* Text */}
        <h1 className="text-[22px] lg:text-[28px] font-bold mt-16 text-zinc-900 dark:text-zinc-50 leading-tight">
          Biz de seni bekliyorduk <span className="text-2xl">😊</span>
        </h1>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
          Hemen giriş yap, tarzını yakalamak için alışverişe başla!
        </p>
        <p className="text-xs font-medium text-zinc-500 mt-6 flex items-center gap-1">
          Henüz üye değil misin?
          <Link
            href="/register"
            className="font-bold text-zinc-900 dark:text-zinc-200 border-b border-zinc-900 dark:border-zinc-200 pb-[1px] hover:opacity-70 transition-opacity"
          >
            Hemen Üye Ol
          </Link>
        </p>

        {/* Images Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 pb-12">
          <div className="flex flex-col gap-4">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop"
              alt="Fashion 1"
              className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
            />
            <img
              src="https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=400&h=400&fit=crop"
              alt="Fashion 2"
              className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="flex flex-col gap-4 pt-8">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop"
              alt="Fashion 3"
              className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
            />
            <img
              src="https://images.unsplash.com/photo-1550614000-4b95dd267dbb?w=400&h=600&fit=crop"
              alt="Fashion 4"
              className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (Form) */}
      <div className="flex-1 flex flex-col items-center justify-start p-6 md:p-12 pt-12 md:pt-32 pb-24 relative overflow-y-auto">
        <div className="w-full max-w-[420px] flex flex-col">
          {/* Left-Aligned Tabs */}
          <div className="flex gap-8 border-b border-zinc-200 dark:border-zinc-800 mb-8 w-full">
            <Link
              href="/login"
              className="pb-3 text-sm font-bold border-b-2 border-brand-primary text-brand-primary dark:text-brand-primary-light"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="pb-3 text-sm font-bold border-b-2 border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              Üye Ol
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3">
                {error}
              </div>
            )}

            <FloatingInput
              id="identifier"
              label="E-posta veya Telefon"
              required
              value={form.identifier}
              onChange={(e: any) => set("identifier", e.target.value)}
              autoComplete="username"
            />

            <FloatingInput
              id="password"
              type={showPass ? "text" : "password"}
              label="Şifre"
              required
              value={form.password}
              onChange={(e: any) => set("password", e.target.value)}
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 active:scale-[0.98] disabled:opacity-70 text-white font-bold tracking-widest text-sm py-4 rounded-btn uppercase transition-all shadow-lg shadow-brand-primary/20"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              GİRİŞ YAP
            </button>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-zinc-300 rounded-sm text-[#2E2E36] focus:ring-[#2E2E36] cursor-pointer"
                />
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                  Beni Hatırla
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-b border-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-200 pb-[1px] transition-colors"
              >
                Şifremi Unuttum
              </Link>
            </div>
          </form>

          {/* Minimalist Sipariş Takibi */}
          <div className="mt-12 flex items-center justify-start gap-2 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <Package className="w-4 h-4 text-zinc-500" />
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              Üye olmadan verdiğin siparişler için
            </span>
            <Link
              href="/guest-tracking"
              className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 border-b border-zinc-800 dark:border-zinc-200 hover:text-black dark:hover:text-white pb-[1px] transition-colors"
            >
              Sipariş Takibi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
