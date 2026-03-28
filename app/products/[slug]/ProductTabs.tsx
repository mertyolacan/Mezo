"use client";

import { useState } from "react";
import ReviewSection from "./ReviewSection";

type Tab = "description" | "reviews";

interface Props {
  description: string | null;
  productId: number;
  isLoggedIn: boolean;
}

export default function ProductTabs({ description, productId, isLoggedIn }: Props) {
  const tabs: { key: Tab; label: string }[] = [
    ...(description ? [{ key: "description" as Tab, label: "Açıklama" }] : []),
    { key: "reviews", label: "Değerlendirmeler" },
  ];

  const [active, setActive] = useState<Tab>(tabs[0].key);

  return (
    <div className="mt-16 border-t border-zinc-100 dark:border-zinc-800 pt-0">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active === t.key
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-8">
        {active === "description" && description && (
          <div className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
            {description}
          </div>
        )}

        {active === "reviews" && (
          <ReviewSection productId={productId} isLoggedIn={isLoggedIn} compact />
        )}
      </div>
    </div>
  );
}
