import { db } from "@/lib/db";
import { productReviews, products, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Star } from "lucide-react";
import ReviewActions from "./ReviewActions";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await db
    .select({
      id: productReviews.id,
      rating: productReviews.rating,
      title: productReviews.title,
      comment: productReviews.comment,
      isApproved: productReviews.isApproved,
      createdAt: productReviews.createdAt,
      productName: products.name,
      productSlug: products.slug,
      userName: users.name,
    })
    .from(productReviews)
    .leftJoin(products, eq(productReviews.productId, products.id))
    .leftJoin(users, eq(productReviews.userId, users.id))
    .orderBy(desc(productReviews.createdAt));

  const pending = reviews.filter((r) => !r.isApproved);
  const approved = reviews.filter((r) => r.isApproved);

  function Stars({ rating }: { rating: number }) {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-700"}`}
          />
        ))}
      </div>
    );
  }

  function ReviewRow({ review }: { review: (typeof reviews)[0] }) {
    return (
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Stars rating={review.rating} />
              <span className="text-xs text-zinc-400">{review.userName ?? "Anonim"}</span>
              <span className="text-xs text-zinc-300 dark:text-zinc-600">·</span>
              <Link href={`/products/${review.productSlug}`} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline truncate">
                {review.productName}
              </Link>
            </div>
            {review.title && <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{review.title}</p>}
            {review.comment && <p className="text-sm text-zinc-500 mt-0.5 line-clamp-2">{review.comment}</p>}
            <p className="text-xs text-zinc-400 mt-1">{new Date(review.createdAt).toLocaleDateString("tr-TR")}</p>
          </div>
          <ReviewActions id={review.id} isApproved={review.isApproved} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Değerlendirmeler</h1>

      {pending.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
          <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Onay Bekleyen ({pending.length})</p>
          </div>
          {pending.map((r) => <ReviewRow key={r.id} review={r} />)}
        </div>
      )}

      {approved.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Yayınlanan ({approved.length})</p>
          </div>
          {approved.map((r) => <ReviewRow key={r.id} review={r} />)}
        </div>
      )}

      {reviews.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-10 text-center text-zinc-400 text-sm">
          Henüz değerlendirme yok
        </div>
      )}
    </div>
  );
}
