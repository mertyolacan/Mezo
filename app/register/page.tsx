"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, ChevronDown, ChevronUp, Check, AlertCircle, Package } from "lucide-react";
import TurkiyeAddressSelect from "@/components/shared/TurkiyeAddressSelect";
import { formatTurkeyPhone, cleanPhone } from "@/lib/utils";

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

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [showAddress, setShowAddress] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "0 (5",
    street: "",
    district: "",
    city: "",
    neighbourhood: "",
    postalCode: "",
  });

  const [agreements, setAgreements] = useState({
    membership: false,
    consent: false,
    commercial: false,
  });

  function set(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, phone: formatTurkeyPhone(e.target.value) }));
  }

  const isLengthValid = form.password.length >= 6;
  const isContentValid =
    /[a-zA-ZıİğĞüÜşŞöÖçÇ]/.test(form.password) &&
    /[^a-zA-ZıİğĞüÜşŞöÖçÇ\s]/.test(form.password);

  const rawPhone = cleanPhone(form.phone);
  const isPhoneValid = rawPhone.length === 11 && rawPhone.startsWith("05");
  const showPhoneError = rawPhone.length > 0 && !isPhoneValid;

  function toggleAgreement(key: keyof typeof agreements) {
    setAgreements((p) => ({ ...p, [key]: !p[key] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreements.membership || !agreements.consent) {
      setError("Zorunlu sözleşmeleri onaylamanız gerekmektedir.");
      return;
    }

    setLoading(true);
    setError("");

    const body: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      phone: cleanPhone(form.phone), // Temiz numara gönder (parantez/boşluksuz)
      password: form.password,
    };

    if (form.street || form.city) {
      // Mahalle adında zaten "Mah" geçiyorsa çift ekleme yapma
      let neighbourhood = form.neighbourhood;
      if (neighbourhood && !neighbourhood.toLowerCase().includes("mah")) {
        neighbourhood = `${neighbourhood} Mah.`;
      }
      
      const streetFull = neighbourhood 
        ? `${neighbourhood}, ${form.street}`.replace(/, $/, "").trim()
        : form.street;

      body.address = {
        street: streetFull,
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

    router.refresh();
    setTimeout(() => {
      router.push(callbackUrl);
    }, 100);
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
          Hemen üye ol, tarzını yakalamak için alışverişe başla!
        </p>
        <p className="text-xs font-medium text-zinc-500 mt-6 flex items-center gap-1">
          Zaten üye misin?
          <Link
            href="/login"
            className="font-bold text-zinc-900 dark:text-zinc-200 border-b border-zinc-900 dark:border-zinc-200 pb-[1px] hover:opacity-70 transition-opacity"
          >
            Hemen Giriş Yap
          </Link>
        </p>

        {/* Images Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 pb-12">
          <div className="flex flex-col gap-4">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop"
              alt="Fashion 1"
              className="w-full h-auto rounded-card object-cover opacity-90 hover:opacity-100 transition-opacity shadow-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=400&h=400&fit=crop"
              alt="Fashion 2"
              className="w-full h-auto rounded-card object-cover opacity-90 hover:opacity-100 transition-opacity shadow-lg"
            />
          </div>
          <div className="flex flex-col gap-4 pt-8">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop"
              alt="Fashion 3"
              className="w-full h-auto rounded-card object-cover opacity-90 hover:opacity-100 transition-opacity shadow-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1550614000-4b95dd267dbb?w=400&h=600&fit=crop"
              alt="Fashion 4"
              className="w-full h-auto rounded-card object-cover opacity-90 hover:opacity-100 transition-opacity shadow-lg"
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
              className="pb-3 text-sm font-bold border-b-2 border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="pb-3 text-sm font-bold border-b-2 border-brand-primary text-brand-primary dark:text-brand-primary-light"
            >
              Üye Ol
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3">
              {error}
            </div>
          )}

          {/* Ad Soyad */}
          <FloatingInput
            id="name"
            label="Ad Soyad"
            required
            value={form.name}
            onChange={(e: any) => set("name", e.target.value)}
            autoComplete="name"
          />

          {/* E-posta */}
          <FloatingInput
            id="email"
            type="email"
            label="E-posta"
            required
            value={form.email}
            onChange={(e: any) => set("email", e.target.value)}
            autoComplete="email"
          />

          {/* Şifre */}
          <div>
            <FloatingInput
              id="password"
              type={showPass ? "text" : "password"}
              label="Şifre"
              required
              minLength={6}
              value={form.password}
              onChange={(e: any) => set("password", e.target.value)}
              autoComplete="new-password"
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
            <div className="mt-2 space-y-1.5 px-0.5">
              <div className="flex items-center gap-1.5">
                {isLengthValid ? (
                  <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                )}
                <span className={`text-[11px] font-medium transition-colors ${isLengthValid ? "text-green-600 dark:text-green-500" : "text-red-500 dark:text-red-400"}`}>
                  En az 6 karakter olmalı
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {isContentValid ? (
                  <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                )}
                <span className={`text-[11px] font-medium transition-colors ${isContentValid ? "text-green-600 dark:text-green-500" : "text-red-500 dark:text-red-400"}`}>
                  1 harf, rakam veya özel karakter içermeli
                </span>
              </div>
            </div>
          </div>

          {/* Telefon */}
          <div>
            <FloatingInput
              id="phone"
              type="tel"
              label="Cep Telefonu"
              required
              value={form.phone}
              onChange={handlePhoneChange}
              hasError={showPhoneError}
              autoComplete="tel"
            />
            {showPhoneError && (
              <div className="flex items-center gap-1.5 mt-1.5 px-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                <span className="text-[11px] font-medium text-red-500 dark:text-red-400">
                  Lütfen geçerli bir cep telefonu girin
                </span>
              </div>
            )}
          </div>

          {/* Adres (opsiyonel) */}
          <div className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 transition-colors rounded-input overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAddress((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="text-zinc-500 font-normal">Adres Bilgileri (İsteğe bağlı)</span>
              {showAddress ? (
                <ChevronUp className="h-5 w-5 text-zinc-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-zinc-400" />
              )}
            </button>

            {showAddress && (
              <div className="px-4 pb-4 space-y-3 border-t border-zinc-200 dark:border-zinc-700 pt-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                {/* Türkiye Kademeli Adres Seçici */}
                <TurkiyeAddressSelect
                  value={{ city: form.city, district: form.district, neighbourhood: form.neighbourhood }}
                  onChange={(v) => setForm(f => ({ ...f, city: v.city, district: v.district, neighbourhood: v.neighbourhood }))}
                  inputClassName="block w-full px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-0 focus:border-brand-primary dark:focus:border-brand-primary-light appearance-none transition-all rounded-input mb-3"
                  labelClassName="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5"
                />

                {/* Cadde / Sokak Detayı */}
                <FloatingInput
                  id="street"
                  label="Açık Adres (Cadde, sokak, bina no...)"
                  value={form.street}
                  onChange={(e: any) => set("street", e.target.value)}
                />

                {/* Posta Kodu */}
                <FloatingInput
                  id="postalCode"
                  label="Posta Kodu (örn. 34000)"
                  value={form.postalCode}
                  onChange={(e: any) => set("postalCode", e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="pt-2 space-y-6">
            <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
              Üye olmadan önce lütfen <Link href="/aydinlatma-metni" className="underline hover:text-zinc-800 dark:hover:text-zinc-200">Aydınlatma Metni</Link>'ni okuyunuz. Aydınlatma metnine her zaman sitemizden veya mobil uygulama üzerinden ulaşabilirsiniz.
            </p>

            <div className="space-y-4">
              {[
                { id: "membership", label: <><Link href="/uyelik-sozlesmesi" className="underline hover:text-zinc-800 dark:hover:text-zinc-200">Üyelik Sözleşmesi</Link>'ni okudum, onaylıyorum.</> },
                { id: "consent", label: <><Link href="/acik-riza-metni" className="underline hover:text-zinc-800 dark:hover:text-zinc-200">Açık Rıza Metni</Link>'ni okudum, onaylıyorum.</> },
                { id: "commercial", label: <>Tarafıma onaylı firmalarca ticari elektronik ileti gönderilmesi için <Link href="/iletisim-izni" className="underline hover:text-zinc-800 dark:hover:text-zinc-200">burada da belirtilen</Link> iznim vardır.</> }
              ].map((agreement) => (
                <label key={agreement.id} className="flex items-start gap-3.5 cursor-pointer group">
                  <div 
                    onClick={() => toggleAgreement(agreement.id as keyof typeof agreements)}
                    className={`shrink-0 w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all ${
                      agreements[agreement.id as keyof typeof agreements] 
                        ? "bg-brand-primary border-brand-primary dark:bg-brand-primary-light dark:border-brand-primary-light" 
                        : "border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-400"
                    }`}
                  >
                    {agreements[agreement.id as keyof typeof agreements] && (
                      <Check className={`h-3 w-3 ${agreements[agreement.id as keyof typeof agreements] ? "text-white dark:text-zinc-900" : ""}`} />
                    )}
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed font-medium">
                    {agreement.label}
                  </span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 active:scale-[0.98] disabled:opacity-70 text-white font-bold tracking-widest text-sm py-4 rounded-btn uppercase transition-all shadow-lg shadow-brand-primary/20 mt-4"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              ÜYE OL
            </button>
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
