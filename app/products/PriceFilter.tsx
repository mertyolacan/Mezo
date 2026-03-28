"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function PriceFilter({ minPrice, maxPrice }: { minPrice?: string; maxPrice?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [min, setMin] = useState(minPrice ?? "");
  const [max, setMax] = useState(maxPrice ?? "");

  function apply() {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set("minPrice", min);
    else params.delete("minPrice");
    if (max) params.set("maxPrice", max);
    else params.delete("maxPrice");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  function reset() {
    setMin("");
    setMax("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  const hasFilter = !!(minPrice || maxPrice);

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">Fiyat Aralığı</h3>
      <div className="flex gap-2 items-center mb-2">
        <input
          type="number"
          min={0}
          placeholder="Min ₺"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="w-full rounded-brand border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm focus:outline-none focus:border-brand-primary transition-all shadow-sm"
        />
        <span className="text-zinc-400 text-xs shrink-0">—</span>
        <input
          type="number"
          min={0}
          placeholder="Max ₺"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="w-full rounded-input border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm focus:outline-none focus:border-brand-primary transition-all shadow-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={apply}
          className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold rounded-btn py-1.5 shadow-sm active:scale-95 transition-all"
        >
          Uygula
        </button>
        {hasFilter && (
          <button
            onClick={reset}
            className="flex-1 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold rounded-brand py-1.5 transition-all"
          >
            Temizle
          </button>
        )}
      </div>
    </div>
  );
}
