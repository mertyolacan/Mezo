"use client";

import { useState } from "react";
import { Check, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReviewActions({ id, isApproved }: { id: number; isApproved: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    await fetch("/api/admin/reviews", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isApproved: !isApproved }),
    });
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Bu değerlendirmeyi silmek istediğinizden emin misiniz?")) return;
    setLoading(true);
    await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={handleApprove}
        disabled={loading}
        title={isApproved ? "Onayı Kaldır" : "Onayla"}
        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
          isApproved
            ? "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        }`}
      >
        {isApproved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        title="Sil"
        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
