"use client";

import { useState, useTransition, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { updateOrderStatus } from "./actions";

const statusOptions: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Bekliyor",      cls: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" },
  confirmed:  { label: "Onaylandı",    cls: "bg-blue-100 dark:bg-blue-900/40 text-brand-primary dark:text-blue-300" },
  processing: { label: "Hazırlanıyor", cls: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300" },
  shipped:    { label: "Kargoda",      cls: "bg-brand-primary/10 dark:bg-brand-primary/10/40 text-brand-primary dark:text-brand-primary" },
  delivered:  { label: "Teslim Edildi",cls: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" },
  cancelled:  { label: "İptal",        cls: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" },
};

export default function ChangeOrderStatusButton({ orderId, status }: { orderId: number; status: string }) {
  const [current, setCurrent] = useState(status);
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const [pending, startTransition] = useTransition();
  const btnRef = useRef<HTMLButtonElement>(null);

  function handleOpen() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen((v) => !v);
  }

  function change(newStatus: string) {
    setOpen(false);
    setCurrent(newStatus);
    startTransition(() => updateOrderStatus(orderId, newStatus));
  }

  const s = statusOptions[current] ?? statusOptions.pending;

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={pending}
        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap transition-opacity ${s.cls} ${pending ? "opacity-60" : ""}`}
      >
        {s.label}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[999] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden min-w-[155px]"
            style={{ top: dropPos.top, left: dropPos.left }}
          >
            {Object.entries(statusOptions).map(([key, val]) => (
              <button
                key={key}
                onClick={() => change(key)}
                className={`w-full text-left text-xs px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                  key === current
                    ? "font-semibold text-brand-primary dark:text-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10/30"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {val.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
