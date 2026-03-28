import { db } from "@/lib/db";
import { blogPosts, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import DeleteBlogButton from "./DeleteBlogButton";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      status: blogPosts.status,
      publishedAt: blogPosts.publishedAt,
      createdAt: blogPosts.createdAt,
      author: { name: users.name },
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .orderBy(desc(blogPosts.createdAt));

  const statusLabel: Record<string, { label: string; cls: string }> = {
    draft: { label: "Taslak", cls: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500" },
    published: { label: "Yayında", cls: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" },
    archived: { label: "Arşiv", cls: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Blog Yazıları</h1>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-light text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Yeni Yazı
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-zinc-500">Başlık</th>
              <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-zinc-500 hidden md:table-cell">Yazar</th>
              <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-zinc-500 hidden lg:table-cell">Tarih</th>
              <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium text-zinc-500">Durum</th>
              <th className="px-3 py-2.5 sm:px-4 sm:py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const s = statusLabel[post.status] ?? statusLabel.draft;
              return (
                <tr key={post.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-50 line-clamp-1">{post.title}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">/blog/{post.slug}</div>
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-zinc-500 hidden md:table-cell">{post.author?.name ?? "—"}</td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-zinc-500 hidden lg:table-cell">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("tr-TR")
                      : new Date(post.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-primary hover:bg-brand-primary/5 dark:hover:bg-brand-primary/20 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteBlogButton id={post.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-400 text-sm">
                  Henüz yazı yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
