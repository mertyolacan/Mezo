"use client";

import { useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { updateOrderStatus } from "./actions";

const statusOptions: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Bekliyor",      cls: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" },
  confirmed:  { label: "Onaylandı",    cls: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" },
  processing: { label: "Hazırlanıyor", cls: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300" },
  shipped:    { label: "Kargoda",      cls: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300" },
  delivered:  { label: "Teslim Edildi",cls: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" },
  cancelled:  { label: "İptal",        cls: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" },
};

export default function ChangeOrderStatusButton({ orderId, status }: { orderId: number; status: string }) {
  const [current, setCurrent] = useState(status);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function change(newStatus: string) {
    setOpen(false);
    setCurrent(newStatus);
    startTransition(() => updateOrderStatus(orderId, newStatus));
  }

  const s = statusOptions[current] ?? statusOptions.pending;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={pending}
        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap transition-opacity ${s.cls} ${pending ? "opacity-60" : ""}`}
      >
        {s.label}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-7 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden min-w-[150px]">
            {Object.entries(statusOptions).map(([key, val]) => (
              <button
                key={key}
                onClick={() => change(key)}
                className={`w-full text-left text-xs px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                  key === current
                    ? "font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {val.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
