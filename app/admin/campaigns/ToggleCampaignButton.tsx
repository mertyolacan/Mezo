"use client";
import { useRouter } from "next/navigation";

export default function ToggleCampaignButton({ id, isActive }: { id: number; isActive: boolean }) {
  const router = useRouter();
  async function handle() {
    await fetch(`/api/campaigns/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }
  return (
    <button
      onClick={handle}
      className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
        isActive
          ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
      }`}
    >
      {isActive ? "Aktif" : "Pasif"}
    </button>
  );
}
