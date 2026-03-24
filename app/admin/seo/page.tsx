import { db } from "@/lib/db";
import { seoPages, siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Search } from "lucide-react";
import SeoTabs from "./SeoTabs";
import type { GlobalSettingsInput } from "@/lib/validations/seo";

export const dynamic = "force-dynamic";

const DEFAULT_PAGES = [
  { page: "home",     label: "Anasayfa",                     previewSlug: "" },
  { page: "products", label: "Ürünler",                      previewSlug: "urunler" },
  { page: "blog",     label: "Blog",                         previewSlug: "blog" },
  { page: "contact",  label: "İletişim",                     previewSlug: "iletisim" },
  { page: "faq",      label: "SSS (Sıkça Sorulan Sorular)",  previewSlug: "sss" },
];

export default async function AdminSeoPage() {
  const [row, pageRows] = await Promise.all([
    db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1).then((r) => r[0]),
    db.select().from(seoPages),
  ]);

  // Yalnızca GlobalSettingsInput alanlarını gönder
  const globalData: GlobalSettingsInput = {
    siteName:           row?.siteName           ?? "MesoPro",
    titleSeparator:     row?.titleSeparator     ?? " | ",
    defaultDescription: row?.defaultDescription ?? "",
    defaultOgImage:     row?.defaultOgImage     ?? "",
    gaId:               row?.gaId               ?? "",
    gscId:              row?.gscId              ?? "",
    faviconUrl:         row?.faviconUrl         ?? "",
    customScripts: {
      head:      row?.customScripts?.head      ?? "",
      bodyStart: row?.customScripts?.bodyStart ?? "",
      bodyEnd:   row?.customScripts?.bodyEnd   ?? "",
    },
  };

  const seoMap: Record<string, any> = {};
  pageRows.forEach((r) => { seoMap[r.page] = r; });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
          <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">SEO & Meta</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Arama motoru optimizasyonu, analytics ve meta yapılandırması.</p>
        </div>
      </div>

      <SeoTabs
        globalData={globalData}
        pages={DEFAULT_PAGES}
        seoMap={seoMap}
      />
    </div>
  );
}
