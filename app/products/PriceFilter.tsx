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
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <span className="text-zinc-400 text-xs shrink-0">—</span>
        <input
          type="number"
          min={0}
          placeholder="Max ₺"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={apply}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg py-1.5 transition-colors"
        >
          Uygula
        </button>
        {hasFilter && (
          <button
            onClick={reset}
            className="flex-1 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium rounded-lg py-1.5 transition-colors"
          >
            Temizle
          </button>
        )}
      </div>
    </div>
  );
}
