"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "mesopro_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Çerez izni"
      className="fixed bottom-4 left-4 right-20 sm:left-auto sm:right-4 sm:max-w-sm z-[60] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-brand shadow-lg p-4"
    >
      <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Çerez Politikası</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Sitemizde deneyiminizi iyileştirmek için çerezler kullanıyoruz.{" "}
            <Link href="/kvkk" className="text-brand-primary hover:underline">
              Gizlilik Politikası
            </Link>
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={accept}
              className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold py-2 rounded-brand transition-colors"
            >
              Kabul Et
            </button>
            <button
              onClick={decline}
              className="flex-1 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium py-2 rounded-brand transition-colors"
            >
              Reddet
            </button>
          </div>
        </div>
        <button
          onClick={decline}
          aria-label="Kapat"
          className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
