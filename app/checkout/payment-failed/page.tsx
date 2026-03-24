"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";

function FailedContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Ödeme işlemi tamamlanamadı.";

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
        <XCircle className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Ödeme Başarısız</h1>
      <p className="text-sm text-zinc-500 mb-6">{error}</p>
      <Link
        href="/checkout"
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        Tekrar Dene
      </Link>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-10">
        <Suspense fallback={null}>
          <FailedContent />
        </Suspense>
      </div>
    </div>
  );
}
