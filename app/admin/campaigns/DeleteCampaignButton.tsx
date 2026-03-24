"use client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteCampaignButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  async function handle() {
    if (!confirm(`"${name}" kampanyasını silmek istediğinize emin misiniz?`)) return;
    await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    router.refresh();
  }
  return (
    <button onClick={handle} className="p-1.5 rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 transition-colors">
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
