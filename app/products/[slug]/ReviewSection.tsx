"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";

type Review = {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  user: { name: string };
};

type Stats = { avgRating: number; totalCount: number; distribution: Record<number, number> };

export default function ReviewSection({ productId, isLoggedIn, compact = false }: { productId: number; isLoggedIn: boolean; compact?: boolean }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });

  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.data?.reviews ?? []);
        setStats(d.data?.stats ?? null);
        setLoading(false);
      });
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Bir hata oluştu");
    } else {
      setSuccess(true);
      setForm({ rating: 5, title: "", comment: "" });
    }
    setSubmitting(false);
  }

  return (
    <div className={compact ? undefined : "mt-16 border-t border-zinc-100 dark:border-zinc-800 pt-10"}>
      {!compact && <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Değerlendirmeler</h2>}

      {/* İstatistik */}
      {stats && stats.totalCount > 0 && (
        <div className="flex items-center gap-6 mb-8 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <div className="text-center">
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">{stats.avgRating.toFixed(1)}</p>
            <StarRow rating={stats.avgRating} size="sm" />
            <p className="text-xs text-zinc-400 mt-1">{stats.totalCount} değerlendirme</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star] ?? 0;
              const pct = stats.totalCount > 0 ? (count / stats.totalCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 w-2">{star}</span>
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-zinc-400 w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Yorum formu */}
      {isLoggedIn && !success && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Değerlendirme Yaz</h3>

          {/* Yıldız seçici */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm((f) => ({ ...f, rating: s }))}
                className="p-0.5 focus:outline-none"
              >
                <Star className={`h-6 w-6 transition-colors ${s <= form.rating ? "text-amber-400 fill-amber-400" : "text-zinc-300 dark:text-zinc-600"}`} />
              </button>
            ))}
          </div>

          <div>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Başlık (isteğe bağlı)"
              maxLength={255}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>

          <div>
            <textarea
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Deneyiminizi paylaşın..."
              rows={3}
              required
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-brand-primary transition-colors resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white text-sm font-bold px-6 py-2.5 rounded-btn transition-colors tracking-wide mt-2"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Gönder
          </button>
        </form>
      )}

      {success && (
        <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400">
          Değerlendirmeniz alındı, incelendikten sonra yayınlanacak.
        </div>
      )}

      {!isLoggedIn && (
        <p className="mb-8 text-sm text-zinc-400">
          Değerlendirme yazmak için{" "}
          <a href="/login" className="text-brand-primary font-medium hover:underline">giriş yapın</a>.
        </p>
      )}

      {/* Yorumlar listesi */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-zinc-400" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-8">Henüz değerlendirme yapılmamış.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <StarRow rating={r.rating} size="sm" />
                  {r.title && <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mt-1">{r.title}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{r.user.name}</p>
                  <p className="text-xs text-zinc-400">{new Date(r.createdAt).toLocaleDateString("tr-TR")}</p>
                </div>
              </div>
              {r.comment && <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${cls} ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-zinc-200 dark:text-zinc-700 fill-zinc-200 dark:fill-zinc-700"}`} />
      ))}
    </div>
  );
}
