"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="tr">
      <body className="min-h-screen flex items-center justify-center bg-white text-zinc-900">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold mb-2">Bir şeyler ters gitti</h1>
          <p className="text-zinc-500 mb-6 text-sm">Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.</p>
          <button
            onClick={reset}
            className="bg-brand-primary hover:bg-brand-primary-light text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  );
}
