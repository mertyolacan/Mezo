import { db } from "@/lib/db";
import { dynamicPages } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import DeletePageButton from "./DeletePageButton";

export const dynamic = "force-dynamic";

const statusMap: Record<string, { label: string; cls: string }> = {
  draft: { label: "Taslak", cls: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500" },
  published: { label: "Yayında", cls: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" },
  scheduled: { label: "Zamanlandı", cls: "bg-blue-100 dark:bg-blue-900 text-brand-primary dark:text-blue-300" },
};

export default async function AdminPagesPage() {
  const pages = await db
    .select({ id: dynamicPages.id, title: dynamicPages.title, slug: dynamicPages.slug, status: dynamicPages.status, publishedAt: dynamicPages.publishedAt, createdAt: dynamicPages.createdAt })
    .from(dynamicPages)
    .orderBy(desc(dynamicPages.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Sayfalar</h1>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-light text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Yeni Sayfa
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Sayfa</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500 hidden md:table-cell">URL</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => {
              const s = statusMap[page.status] ?? statusMap.draft;
              return (
                <tr key={page.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{page.title}</td>
                  <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">/{page.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-primary hover:bg-brand-primary/5 dark:hover:bg-brand-primary/20 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeletePageButton id={page.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {pages.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-400 text-sm">Henüz sayfa yok</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
