"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function RemoveFavoriteButton({ favoriteId, productId }: { favoriteId: number; productId: number }) {
  const router = useRouter();

  async function handle() {
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    router.refresh();
  }

  return (
    <button
      onClick={handle}
      className="absolute top-2 right-2 z-10 h-6 w-6 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm text-zinc-400 hover:text-red-500 transition-colors"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}
