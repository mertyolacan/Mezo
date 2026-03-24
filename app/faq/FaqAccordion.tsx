"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Item = { id: number; question: string; answer: string };

export default function FaqAccordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
      {items.map((item) => (
        <div key={item.id}>
          <button
            onClick={() => setOpen(open === item.id ? null : item.id)}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{item.question}</span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${open === item.id ? "rotate-180" : ""}`}
            />
          </button>
          {open === item.id && (
            <div className="px-5 pb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
