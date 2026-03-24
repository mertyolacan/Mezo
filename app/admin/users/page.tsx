import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { count, desc } from "drizzle-orm";
import Link from "next/link";
import { Users, Search } from "lucide-react";
import ToggleUserRoleButton from "./ToggleUserRoleButton";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, Number(pageParam));
  const limit = 20;
  const offset = (page - 1) * limit;

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db.select({ total: count() }).from(users);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Kullanıcılar</h1>
            <p className="text-xs text-zinc-500">{total} kayıtlı kullanıcı</p>
          </div>
        </div>
      </div>

      {/* Arama */}
      <form method="GET" className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Ad veya e-posta ile ara..."
          className="w-full max-w-sm pl-10 pr-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </form>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-left px-3 py-2.5 sm:px-5 sm:py-3 font-medium text-zinc-500">Ad / E-posta</th>
              <th className="text-left px-3 py-2.5 sm:px-5 sm:py-3 font-medium text-zinc-500 hidden sm:table-cell">Telefon</th>
              <th className="text-left px-3 py-2.5 sm:px-5 sm:py-3 font-medium text-zinc-500">Rol</th>
              <th className="text-left px-3 py-2.5 sm:px-5 sm:py-3 font-medium text-zinc-500 hidden md:table-cell">Durum</th>
              <th className="text-left px-3 py-2.5 sm:px-5 sm:py-3 font-medium text-zinc-500 hidden lg:table-cell">Kayıt Tarihi</th>
              <th className="px-3 py-2.5 sm:px-5 sm:py-3" />
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => (
              <tr key={user.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-3 py-2.5 sm:px-5 sm:py-3">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50 text-sm">{user.name ?? "—"}</p>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                </td>
                <td className="px-3 py-2.5 sm:px-5 sm:py-3 hidden sm:table-cell text-xs text-zinc-500">
                  {user.phone ?? "—"}
                </td>
                <td className="px-3 py-2.5 sm:px-5 sm:py-3">
                  <ToggleUserRoleButton userId={user.id} role={user.role} />
                </td>
                <td className="px-3 py-2.5 sm:px-5 sm:py-3 hidden md:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.isActive
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  }`}>
                    {user.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-3 py-2.5 sm:px-5 sm:py-3 text-xs text-zinc-400 hidden lg:table-cell whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-3 py-2.5 sm:px-5 sm:py-3 text-right whitespace-nowrap">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Detay →
                  </Link>
                </td>
              </tr>
            ))}
            {allUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-400 text-sm">Kullanıcı bulunamadı</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/users?page=${p}${q ? `&q=${q}` : ""}`}
              className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
