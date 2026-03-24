"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export default function FavoriteButton({
  productId,
  initialFavorited,
}: {
  productId: number;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (res.ok) {
        const d = await res.json();
        setFavorited(d.data.favorited);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={`absolute top-2 right-2 z-10 h-7 w-7 rounded-full flex items-center justify-center shadow-sm transition-all ${
        favorited
          ? "bg-red-500 text-white"
          : "bg-white/90 dark:bg-zinc-800/90 text-zinc-400 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-800"
      } ${loading ? "opacity-60" : ""}`}
    >
      <Heart className={`h-3.5 w-3.5 ${favorited ? "fill-current" : ""}`} />
    </button>
  );
}
