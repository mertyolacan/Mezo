import { db } from "@/lib/db";
import { seoPages } from "@/lib/db/schema";
import SeoManager from "./SeoManager";

export const dynamic = "force-dynamic";

const DEFAULT_PAGES = [
  { page: "home", label: "Anasayfa" },
  { page: "products", label: "Ürünler" },
  { page: "blog", label: "Blog" },
  { page: "contact", label: "İletişim" },
];

export default async function AdminSeoPage() {
  const rows = await db.select().from(seoPages);
  const seoMap: Record<string, typeof rows[number]> = {};
  rows.forEach((r) => { seoMap[r.page] = r; });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">SEO Yönetimi</h1>
      <SeoManager pages={DEFAULT_PAGES} seoMap={seoMap} />
    </div>
  );
}
