"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";

function PaymentForm() {
  const searchParams = useSearchParams();
  const [formContent, setFormContent] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Geçersiz ödeme oturumu. Lütfen tekrar deneyin.");
      return;
    }

    fetch(`/api/payment/form-content?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setFormContent(d.html);
      })
      .catch(() => setError("Ödeme formu yüklenemedi."));
  }, [searchParams]);

  useEffect(() => {
    if (formContent) {
      // iyzico'nun JS'ini çalıştır
      const scripts = document.querySelectorAll<HTMLScriptElement>("#iyzico-payment-form script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        if (oldScript.src) newScript.src = oldScript.src;
        else newScript.textContent = oldScript.textContent;
        newScript.async = true;
        document.body.appendChild(newScript);
        oldScript.remove();
      });
    }
  }, [formContent]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <a href="/checkout" className="text-brand-primary dark:text-brand-primary text-sm hover:underline">
          Sepete Geri Dön
        </a>
      </div>
    );
  }

  if (!formContent) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div
      id="iyzico-payment-form"
      dangerouslySetInnerHTML={{ __html: formContent }}
    />
  );
}

export default function PaymentPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-5 w-5 text-green-600" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Güvenli Ödeme</h1>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        }>
          <PaymentForm />
        </Suspense>
      </div>

      <p className="text-xs text-zinc-400 text-center mt-4">
        Ödemeniz iyzico altyapısıyla güvence altında işlenmektedir.
      </p>
    </div>
  );
}
